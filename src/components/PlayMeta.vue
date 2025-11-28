<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAppCommonStore } from "../store/appCommonStore";
import { usePlayStore } from "../store/playStore.js";
import { Track } from "../common/Track";
import VolumeBar from "./VolumeBar.vue";
import AudioTime from "./AudioTime.vue";

//歌曲信息 封面 歌手等..
const props = defineProps({
  hideVolumeBar: Boolean,
});
const { coverMaskShow } = storeToRefs(useAppCommonStore());
const { showPlayingView, toggleCoverMask } = useAppCommonStore();
const { currentTrack, mmssCurrentTime, volume, playing } = storeToRefs(usePlayStore());

const volumeBarRef = ref(null);

const trackMeta = (track) => {
  let artistName = Track.artistName(track);
  if (artistName.length > 0) artistName = " - " + artistName;
  return track.title + artistName;
};

onMounted(() => {
  if (volumeBarRef) volumeBarRef.value.setVolume(volume.value);
});
</script>

<template>
  <div class="play-meta">
    <div class="cover-wrap" @mouseenter="toggleCoverMask" @mouseleave="toggleCoverMask">
      <img class="audio-cover" v-lazy="currentTrack.cover" />
      <div class="cover-mask" v-show="coverMaskShow" @click="">
        <i class="iconfont icon-xiangxiajiantou"></i>
      </div>
    </div>
    <div class="title-wrap">
      <div class="audio-title-wrap">
        <div class="audio-title" v-html="trackMeta(currentTrack)"></div>
      </div>
      <div class="time-volume-wrap">
        <AudioTime :current="mmssCurrentTime" :duration="Track.mmssDuration(currentTrack)"></AudioTime>
        <VolumeBar class="volume-bar" ref="volumeBarRef" v-show="!hideVolumeBar"></VolumeBar>
      </div>
    </div>
  </div>
</template>

<style>
.play-meta {
  display: flex;
  height: var(--play-meta-height);
  align-items: center;
}

.play-meta .title-wrap {
  width: 211px;
  margin-left: 10px;
}

.play-meta .audio-title-wrap {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  height: 33px;
}

.play-meta .cover-wrap {
  position: relative;
  width: var(--play-meta-height);
  height: var(--play-meta-height);
  box-shadow: 0px 0px 1px #161616;
  box-shadow: 0px 0px 1px var(--main-left-border-color);
}

.play-meta .audio-cover,
.play-meta .cover-mask {
  /*width: 100%;*/
  width: var(--play-meta-height);
  height: var(--play-meta-height);
  cursor: pointer;
  -webkit-user-drag: none;
  -webkit-app-region: no-drag;

  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 1;
}

.play-meta .audio-cover {
  background-color: var(--text-color);
}

.play-meta .cover-mask {
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ntf-bg);
  opacity: 0.68;
}

.play-meta .cover-mask svg {
  fill: var(--svg-color) !important;
}

.play-meta .audio-title {
  font-size: 14;
  text-align: left;

  vertical-align: bottom;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  width: 211px;
}

.play-meta .favorite-btn {
  margin-top: 15px;
  margin-left: 15px;
  cursor: pointer;
  display: none;
}

.play-meta .favorite-btn svg {
  fill: var(--svg-color);
}

.play-meta .favorite-btn:hover svg {
  fill: var(--hl-color);
}

.play-meta .time-volume-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 211px;
  /* justify-content: center; */
}

.play-meta .audio-time,
.play-meta .volume-bar {
  line-height: 30px;
}

.play-meta .audio-time {
  color: var(--text-sub-color);
  font-size: 14px;
  text-align: left;
  flex: 1;
}

.play-meta .volume-bar {
  margin-left: 10px;
  margin-top: 3px;
}

.play-meta .volume-status {
  width: 18px;
  margin-top: 6px;
}

.play-meta .st-slient,
.play-meta .st-small,
.play-meta .st-large {
  width: 18px;
  height: 18px;
}

.play-meta .volume-value {
  width: 66px;
  margin-left: 3px;
}
</style>
