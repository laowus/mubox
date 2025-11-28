<script setup>
import { inject, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import EventBus from "../common/EventBus";
import PlayMeta from "../components/PlayMeta.vue";
import SearchBar from "../components/SearchBar.vue";
import Navigator from "../components/Navigator.vue";
import { usePlayStore } from "../store/playStore";

const { visitUserHome, visitSetting } = inject("appRoute");
const progressBarRef = ref(null);
const { progress } = storeToRefs(usePlayStore());

const seekTrack = (percent) => {
  console.log("DefaultMainTop => seekTrack:", percent);
  EventBus.emit("track-seek", percent);
};

watch(progress, (nv, ov) => {
  progressBarRef.value.updateProgress(nv);
});
</script>
<template>
  <div class="main-top">
    <div id="play-nav">
      <PlayMeta id="play-meta"></PlayMeta>
      <div class="play-ctl-wrap">
        <PlayControl></PlayControl>
      </div>
      <div class="top-right">
        <div id="userhome-btn" @click="">
          <i class="iconfont icon-touxiang f24px"></i>
        </div>
        <div id="setting-btn" @click="visitSetting">
          <i class="iconfont icon-shezhi f24px"></i>
        </div>
        <Navigator></Navigator>
      </div>
    </div>
    <ProgressBar ref="progressBarRef" :seekable="true" :onseek="seekTrack"></ProgressBar>
  </div>
</template>

<style scoped>
.main-top,
#play-nav {
  display: flex;
}

.main-top {
  flex-direction: column;
  height: var(--main-play-nav-height);
  -webkit-app-region: drag;
  /* background: #faf4f6; */
}

.main-top #play-nav #play-meta {
  width: 34.33%;
}

.main-top #play-nav .play-ctl-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0px 15px;
}

.main-top #play-nav .top-right {
  width: 39.33%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.main-top #userhome-btn {
  cursor: pointer;
  -webkit-app-region: none;
  margin-left: 16px;
  margin-right: 15px;
  background-color: transparent;
}

.main-top #userhome-btn svg {
  margin-top: 4px;
  fill: var(--svg-color);
}

.main-top #setting-btn {
  cursor: pointer;
  -webkit-app-region: none;
  /*margin-left: 15px;*/
  margin-right: 12px;
}

.main-top #setting-btn svg {
  margin-top: 4px;
  fill: var(--svg-color);
}

.main-top #userhome-btn svg:hover,
.main-top #setting-btn svg:hover {
  fill: var(--hl-color);
  fill: var(--svg-hover-color);
}
</style>
