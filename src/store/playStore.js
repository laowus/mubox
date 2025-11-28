import { defineStore } from "pinia";
import { PLAY_MODE } from "../common/Constants";
import EventBus from "../common/EventBus";
import { Track } from "../common/Track";
import { toMmss } from "../common/Times";

const NO_TRACK = new Track("0", "", "听你想听，爱你所爱", [{ id: "0", name: "不枉青春" }], { id: "0", name: "山川湖海，日月星辰" }, 0, "default_cover.png");

export const usePlayStore = defineStore("play", {
  state: () => ({
    //是否正在播放
    playing: false,
    //当前播放的歌曲索引
    playingIndex: -1,
    //当前播放模式
    playMode: PLAY_MODE.REPEAT_ALL,
    //播放队列
    queueTracks: [],
    //单位: ms
    currentTime: 0,
    //0.0 - 1.0
    progress: 0.0,
    //0.0 - 1.0
    volume: 0.5,
    //是否正在自动下一曲
    isAutoPlaying: false,
  }),
  getters: {
    currentTrack(state) {
      if (this.playingIndex < 0) return NO_TRACK;
      return this.track(this.playingIndex);
    },
    //获取播放队列中的歌曲
    track(state) {
      return (index) => {
        return state.queueTracks[index];
      };
    },
    noTrack() {
      return NO_TRACK;
    },
    mmssCurrentTime() {
      return toMmss(this.currentTime);
    },
    queueTracksSize(state) {
      return state.queueTracks.length;
    },
    hasLyric(state) {
      const track = state.currentTrack;
      if (!track) return false;
      const lyric = track.lyric;
      if (!lyric) return false;
      return lyric.data.size > 0;
    },
  },
  actions: {
    findIndex(track) {
      return this.queueTracks.findIndex((item, index) => Track.isEquals(track, item));
    },
    isCurrentTrack(track) {
      return Track.isEquals(this.currentTrack, track);
    },
    isPlaying() {
      return this.playing;
    },
    setPlaying(value) {
      this.playing = value;
    },
    togglePlay() {
      console.log("togglePlay");
      //播放列表为空
      if (this.queueTracksSize < 1) return;
      //当前歌曲不存在或存在但缺少url
      if (!Track.hasUrl(this.currentTrack) || NO_TRACK == this.currentTrack) {
        this.playNextTrack();
        return;
      }
      //当前歌曲正常
      EventBus.emit("track-togglePlay");
    },
    //添加歌曲到播放队列
    addTrack(track) {
      const index = this.findIndex(track);
      if (index == -1) this.queueTracks.push(track);
    },

    addTracks(tracks) {
      if (tracks.length < 1) return;
      tracks.forEach((item) => this.addTrack(item));
    },

    __resetPlayState() {
      this.playing = false;
      this.currentTime = 0;
      this.progress = 0.0;
    },
    __validPlayingIndex() {
      const maxSize = this.queueTracksSize;
      this.playingIndex = this.playingIndex > 0 ? this.playingIndex : 0;
      this.playingIndex = this.playingIndex < maxSize ? this.playingIndex : maxSize - 1;
    },
    playTrackDirectly(track) {
      this.__resetPlayState();
      let playEventName = "track-play";
      if (!Track.hasUrl(track)) {
        playEventName = "track-changed";
      }
      EventBus.emit(playEventName, track);
    },
    //添加歌曲到播放队列, 并播放
    playTrack(track) {
      // 查找播放队列中是否存在该歌曲
      let index = this.findIndex(track);
      if (index == -1) {
        //开始不存在, 则添加到播放队列中
        index = this.playingIndex + 1;
        // 从index 插入track
        this.queueTracks.splice(index, 0, track);
      }
      this.playingIndex = index;
      this.playTrackDirectly(track);
    },
    playPrevTrack() {
      //TODO
      const maxSize = this.queueTracksSize;
      if (maxSize < 1) return;
      switch (this.playMode) {
        case PLAY_MODE.REPEAT_ALL:
          --this.playingIndex;
          this.playingIndex = this.playingIndex < 0 ? maxSize - 1 : this.playingIndex;
          break;
        case PLAY_MODE.REPEAT_ONE:
          break;
        case PLAY_MODE.RANDOM:
          break;
      }
      this.__validPlayingIndex();
      this.playTrackDirectly(this.currentTrack);
    },
    playNextTrack() {
      const maxSize = this.queueTracksSize;
      if (maxSize < 1) return;
      switch (this.playMode) {
        case PLAY_MODE.REPEAT_ALL:
          this.playingIndex = ++this.playingIndex % maxSize;
          break;
        case PLAY_MODE.REPEAT_ONE:
          break;
        case PLAY_MODE.RANDOM:
          this.playingIndex = Math.ceil(Math.random() * maxSize);
          break;
      }
      this.__validPlayingIndex();
      this.playTrackDirectly(this.currentTrack);
    },
    removeTrack(track) {
      const index = this.findIndex(track);
      if (index > -1) {
        const isCurrent = index == this.playingIndex;
        this.queueTracks.splice(index, 1);
        if (index <= this.playingIndex) {
          --this.playingIndex;
        }
        const maxSize = this.queueTracksSize;
        if (maxSize < 1) {
          this.resetQueue();
          return;
        }
        if (isCurrent) {
          if (this.playing) {
            this.playNextTrack();
          }
        }
      }
    },
    resetQueue() {
      this.isAutoPlaying = false;
      this.queueTracks.length = 0;
      this.playingIndex = -1;
      this.__resetPlayState();
    },
    updateCurrentTime(secs) {
      this.currentTime = secs * 1000;
      let duration = 0;
      try {
        duration = this.currentTrack.duration;
      } catch (error) {
        console.log(error);
      }
      this.progress = duration > 0 ? this.currentTime / duration : 0;
    },
    updateVolume(value) {
      value = parseFloat(value);
      value = value > 0 ? value : 0;
      value = value < 1 ? value : 1;
      this.volume = value;
      EventBus.emit("volume-set", value);
    },
    updateVolumeByOffset(value) {
      value = parseFloat(value);
      this.updateVolume(this.volume + value);
    },
    switchPlayMode() {
      this.playMode = ++this.playMode % 3;
      //TODO
    },
    setAutoPlaying(value) {
      this.isAutoPlaying = value;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "player",
        storage: localStorage,
        paths: ["playingIndex", "playMode", "queueTracks", "volume"],
      },
    ],
  },
});
