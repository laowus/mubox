<script setup>
import EventBus from "./common/EventBus";
import { Track } from "./common/Track";
import { usePlayStore } from "./store/playStore";
import { useAppCommonStore } from "./store/appCommonStore";
import { usePlatformStore } from "./store/platformStore";
import { storeToRefs } from "pinia";
import { PLAY_STATE, TRAY_ACTION } from "./common/Constants";
import { onMounted } from "vue";
import { Playlist } from "./common/Playlist";
const { currentTrack, queueTracksSize } = storeToRefs(usePlayStore());
const { playNextTrack, setAutoPlaying, playTrackDirectly, isCurrentTrack, removeTrack, updateCurrentTime, setPlaying, addTracks, resetQueue } = usePlayStore();
const { getVendor } = usePlatformStore();

const { showFailToast, isCurrentTraceId, togglePlaybackQueueView, showToast } = useAppCommonStore();

//处理不可播放歌曲
const AUTO_PLAY_NEXT_MSG = "当前歌曲无法播放<br>即将为您播放下一曲";
const NO_NEXT_MSG = "当前歌曲无法播放<br>且列表已无其他歌曲";
const TOO_FAST_MSG = "尝试播放次数太多<br>请手动播放其他歌曲吧";

//处理无法播放的歌曲
const handleUnplayableTrack = (track) => {
  const queueSize = queueTracksSize.value;
  console.log("无法播放的歌曲:", track);
  // 从播放列表中删除无法播放的歌曲
  removeTrack(track);

  //提示并播放下一曲
  const toastAndPlayNext = () => {
    //因为已经删除了歌曲，这里直接播放下一首
    showFailToast(AUTO_PLAY_NEXT_MSG, () => {
      playNextTrack();
    });
  };

  if (queueSize < 2) {
    //非电台歌曲，且没有下一曲
    showFailToast(NO_NEXT_MSG);
    return;
  }
  //普通歌曲
  //频繁切换下一曲，体验不好，对音乐平台也不友好
  if (autoSkipCnt < 9) {
    console.log("autoSkipCnt:", autoSkipCnt);
    ++autoSkipCnt;
    toastAndPlayNext();
    return;
  }
  //10连跳啦，暂停一下吧
  resetAutoSkip();
  showFailToast(TOO_FAST_MSG);
};
//歌单

//添加到播放列表，并开始播放
const addAndPlayTracks = (tracks, needReset, text, traceId) => {
  if (traceId && !isCurrentTraceId(traceId)) return;

  if (needReset) resetQueue();
  showToast(text || "即将为您播放全部！");
  addTracks(tracks);
  playNextTrack();
};

//播放歌单
const playPlaylist = async (playlist, text, traceId) => {
  if (traceId && !isCurrentTraceId(traceId)) return;

  const { id, platform } = playlist;
  if (Playlist.isNormalType(playlist) || Playlist.isAnchorRadioType(playlist)) {
    let maxRetry = 3,
      retry = 0;
    while (!playlist.data || playlist.data.length < 1) {
      if (traceId && !isCurrentTraceId(traceId)) return;

      if (++retry > maxRetry) return;
      //重试一次加载数据
      const vendor = getVendor(platform);
      if (!vendor || !vendor.playlistDetail) return;
      playlist = await vendor.playlistDetail(id, 0, 1000, 1);
    }
  }
  if (!playlist.data || playlist.data.length < 1) {
    const failMsg = Playlist.isCustomType(playlist) ? "歌单里还没有歌曲" : "网络异常！请稍候重试";
    if (traceId && !isCurrentTraceId(traceId)) return;
    showFailToast(failMsg);
    return;
  }
  //可播放歌单
  addAndPlayTracks(playlist.data, true, text || "即将为您播放歌单", traceId);
};

/* 播放歌单 */
const tryPlayPlaylist = async (playlist, text, traceId) => {
  console.log("tryPlayPlaylist", playlist, text, traceId);  
  try {
    playPlaylist(playlist, text, traceId);
  } catch (error) {
    console.log(error);
    //if (traceId && !isCurrentTraceId(traceId)) return;
    showFailToast("网络异常！请稍候重试");
    return;
  }
};

//获取和设置歌曲播放信息
const bootstrapTrack = (track) => {
  return new Promise(async (resolve, reject) => {
    if (!track) {
      reject();
      return;
    }
    const { id, platform, artistNotCompleted } = track;
    //平台服务
    const vendor = getVendor(platform);
    if (!vendor || !vendor.playDetail) {
      reject();
      return;
    }
    const result = await vendor.playDetail(id, track);
    const { lyric, cover, artist, url } = result;
    //覆盖设置url，音乐平台可能有失效机制，即url只在允许的时间内有效，而非永久性url
    if (Track.hasUrl(result)) Object.assign(track, { url });
    if (!Track.hasUrl(track)) {
      reject("noUrl");
      return;
    }
    setAutoPlaying(false);
    resolve(track);
  });
};

//歌单
EventBus.on("playlist-play", ({ playlist, text, traceId }) => tryPlayPlaylist(playlist, text, traceId));
//连跳计数器
let autoSkipCnt = 0;
//重置连跳计数
const resetAutoSkip = () => (autoSkipCnt = 0);

/* 记录最近播放 */
//歌曲、电台

EventBus.on("track-play", (track) => {
  resetAutoSkip();
});
//普通歌曲
// 加载歌曲
EventBus.on("track-changed", (track) => {
  bootstrapTrack(track).then(
    //获取url
    (track) => {
      if (isCurrentTrack(track)) playTrackDirectly(track);
    },
    (reason) => {
      if (reason == "noUrl") handleUnplayableTrack(track);
    },
  );
});
EventBus.on("track-pos", (secs) => {
  updateCurrentTime(secs);
});

EventBus.on("track-state", (state) => {
  switch (state) {
    case PLAY_STATE.PLAYING:
      setPlaying(true);
      break;
    case PLAY_STATE.PAUSE:
      setPlaying(false);
      break;
    case PLAY_STATE.END:
      playNextTrack();
      break;
    default:
      break;
  }
});

//应用启动时，恢复歌曲信息
const restoreTrack = () => {
  bootstrapTrack(currentTrack.value, true)
    .then((track) => {
      EventBus.emit("track-restore", track);
    })
    .catch((error) => console.log(error));
};

onMounted(() => {
  restoreTrack();
});
</script>
<template>
  <audio class="audio-node" crossOrigin="anonymous"></audio>
  <slot></slot>
</template>
<style>
.radio-holder {
  visibility: hidden;
}
</style>
