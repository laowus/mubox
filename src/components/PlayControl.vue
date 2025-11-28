<script setup>
import { storeToRefs } from "pinia";
import { usePlayStore } from "../store/playStore";
import { useAppCommonStore } from "../store/appCommonStore";

const { playing, playMode } = storeToRefs(usePlayStore());
const { playPrevTrack, togglePlay, playNextTrack, switchPlayMode } = usePlayStore();
const { togglePlaybackQueueView, hideAllCategoryViews, hideAllCtxMenus } = useAppCommonStore();

const togglePlaybackQueue = () => {
  //   hideAllCategoryViews();
  //   hideAllCtxMenus();
  togglePlaybackQueueView();
};
</script>

<template>
  <div class="play-ctl">
    <div class="play-mode-btn" @click="switchPlayMode">
      <i v-show="playMode == 0" class="iconfont icon-duoxunhuan"></i>
      <i v-show="playMode == 1" class="iconfont icon-danquxunhuan"></i>
      <i v-show="playMode == 2" class="iconfont icon-random"></i>
    </div>
    <div class="play-prev-btn spacing" @click="playPrevTrack">
      <i class="iconfont icon-shangyishoushangyige"></i>
    </div>
    <div class="play-btn spacing" @click="togglePlay">
      <i v-show="!playing" class="iconfont icon-sanjiaoxing f16px"></i>
      <i v-show="playing" class="iconfont icon-zanting f16px"></i>
    </div>
    <div class="play-next-btn spacing" @click="playNextTrack">
      <i class="iconfont icon-xiayigexiayishou"></i>
    </div>
    <div class="playlist-btn spacing" @click.stop="togglePlaybackQueue">
      <i class="iconfont icon-gequliebiao"></i>
    </div>
  </div>
</template>

<style scoped>
.play-ctl {
  display: flex;
  height: var(--play-meta-height);
  align-items: center;
}

.play-ctl div {
  width: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.play-ctl .spacing {
  margin-left: 15px;
}

.play-ctl i {
  font-size: 22px;
  color: var(--svg-color);
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.f16px {
  font-size: 16px !important;
}

.play-ctl i:hover {
  color: var(--hl-color);
  color: var(--svg-hover-color);
}

.play-ctl .play-btn {
  /*margin-top: 16px;*/
  border-radius: 10rem;
  width: 39px;
  height: 39px;
  background: var(--btn-bg);
  cursor: pointer;
}

.play-ctl .play-btn:hover {
  /*background: linear-gradient(to top right, #2edfa3, #28c83f) !important;*/
  background: var(--btn-hover-bg);
}

.play-ctl .play-btn i {
  /* margin-top: 9px;*/
  margin-top: 1px;
  margin-left: 3px;
  color: var(--svg-btn-color) !important;
}

.play-ctl .play-btn .paused {
  /* margin-top: 6px;*/
  margin-left: 0px;
  fill: var(--svg-btn-color) !important;
}
</style>
