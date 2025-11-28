import { Howl, Howler } from "howler";
import { PLAY_STATE } from "../common/Constants";
import EventBus from "../common/EventBus";
import { Track } from "./Track";
import { WebAudioApi } from "./WebAudioApi";
import { fetch } from "@tauri-apps/plugin-http";
import { convertFileSrc } from "@tauri-apps/api/core";

let singleton = null;

//追求简洁、组合式API、单一责任
export class Player {
  constructor(track) {
    this.currentTrack = track;
    this.sound = null;
    this.retry = 0;
    this.webAudioApi = null;
    // 在Player类中添加缓存属性
    this.blobUrlCache = new Map();
    this.cacheLimit = 20; //缓存最多20条记录
  }

  static get() {
    if (!singleton) singleton = new Player();
    return singleton;
  }

  /* 初始化并配置播放器 */
  static initAndSetup() {
    const player = Player.get();
    return player
      .on("suspend", () => player.pause())
      .on("track-play", (track) => player.playTrack(track))
      .on("track-restore", (track) => player.restore(track))
      .on("track-changed", () => player.setCurrent(null))
      .on("track-togglePlay", () => player.togglePlay())
      .on("track-seek", (percent) => player.seek(percent))
      .on("volume-set", (volume) => player.volume(volume))
      .on("radio-play", () => player.setCurrent(null))
      .on("playbackQueue-empty", () => player.setCurrent(null))
      .on("track-updateEQ", (values) => player.updateEQ(values));
  }

  async urlToBlobUrl(track) {
    const url = track.url;
    try {
      if (track.platform === "local") {
        return convertFileSrc(url);
      } else {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
        const blobUrl = URL.createObjectURL(blob);
        return blobUrl;
      }
    } catch (error) {
      console.error("Failed to convert URL to Blob:", error);
      throw error;
    }
  }

  async createSound() {
    if (!Track.hasUrl(this.currentTrack)) return null;
    var self = this;
    //释放资源
    if (this.sound) this.sound.unload();

    // 使用单独的函数将URL转换为Blob URL
    const blobUrl = await this.urlToBlobUrl(this.currentTrack);

    this.sound = new Howl({
      src: [blobUrl],
      html5: true,
      autoplay: false,
      preload: false,
      crossOrigin: "anonymous",
      onplay: function () {
        this.retry = 0;
        requestAnimationFrame(self.__step.bind(self));
        self.notifyStateChanged(PLAY_STATE.PLAYING);
      },
      onpause: function () {
        self.notifyStateChanged(PLAY_STATE.PAUSE);
      },
      onend: function () {
        self.notifyStateChanged(PLAY_STATE.END);
      },
      onseek: function () {
        requestAnimationFrame(self.__step.bind(self));
      },
      onloaderror: function () {
        // 释放Blob URL
        if (blobUrl && blobUrl.startsWith("blob:")) {
          URL.revokeObjectURL(blobUrl);
        }
        self.retryPlay(1);
      },
      onplayerror: function () {
        self.retryPlay(1);
      },
    });
    this.tryUnlockHowlAudios();
    return this.sound;
  }

  getSound() {
    return Track.hasUrl(this.currentTrack) ? this.sound : null;
  }

  //播放
  play() {
    let sound = this.getSound();
    if (sound) sound.play();
  }

  //暂停
  pause() {
    const sound = this.getSound();
    if (sound) sound.pause();
  }

  togglePlay() {
    const sound = this.getSound();
    if (!sound) {
      this.retryPlay(1);
      return;
    }
    if (sound.playing()) {
      sound.pause();
    } else {
      sound.play();
    }
  }

  //暂停
  stop() {
    const sound = this.getSound();
    if (sound) sound.stop();
  }

  // 修改setCurrent方法为异步
  async setCurrent(track) {
    console.log("setCurrent", track);
    this.stop();
    this.currentTrack = track;
    await this.createSound(); // 等待音频创建完成
  }

  // 修改playTrack方法为异步
  async playTrack(track) {
    console.log("playTrack", track);
    await this.setCurrent(track); // 等待setCurrent完成
    this.play(); // 然后再执行播放
  }

  async restore(track) {
    await this.setCurrent(track);
    //this.play();
  }

  volume(value) {
    Howler.volume(value);
  }

  seek(percent) {
    console.log("seek", percent);
    const sound = this.getSound();
    if (!sound || !sound.playing()) return;
    sound.seek(sound.duration() * percent);
  }

  __step() {
    const sound = this.getSound();
    if (!sound) return;
    if (!sound.playing()) return;
    const seek = sound.seek() || 0;
    EventBus.emit("track-pos", seek);
    try {
      this.resolveSound();
    } catch (error) {
      console.log(error);
      this.retryPlay(1);
    }
    requestAnimationFrame(this.__step.bind(this));
  }

  on(event, handler) {
    EventBus.on(event, handler);
    return this;
  }

  notifyStateChanged(state) {
    EventBus.emit("track-state", state);
  }

  notifyError(isRetry) {
    EventBus.emit("track-error", isRetry ? this.currentTrack : null);
  }

  retryPlay(times) {
    this.notifyError(this.retry < times);
    ++this.retry;
  }

  createWebAudioApi() {
    if (this.webAudioApi) return;
    const audioCtx = Howler.ctx;
    if (!audioCtx) return;
    const audioNode = this.sound._sounds[0]._node;
    if (!audioNode) return;
    this.webAudioApi = WebAudioApi.create(audioCtx, audioNode);
  }

  resolveSound() {
    this.createWebAudioApi();
    if (!this.webAudioApi) return;
    const analyser = this.webAudioApi.getAnalyser();
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqData);
    EventBus.emit("track-freqUnit8Data", freqData);
  }

  tryUnlockHowlAudios() {
    try {
      const audios = Howler._html5AudioPool;
      if (Array.isArray(audios)) {
        audios.forEach((audio) => {
          if (audio) audio.crossOrigin = "anonymous";
        });
      }
    } catch (error) {
      console.warn("Failed to unlock Howl audios:", error);
    }
  }

  updateEQ(values) {
    if (this.webAudioApi) this.webAudioApi.updateEQ(values);
  }
}
