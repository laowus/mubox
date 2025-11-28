<script setup>
import { ref, watch } from "vue";
import EventBus from "../common/EventBus";
import SliderBar from "./SliderBar.vue";
import { usePlayStore } from "../store/playStore.js";
import { storeToRefs } from "pinia";

const status = ref(1);
const sliderRef = ref(null);
const { updateVolume } = usePlayStore();
const { volume } = storeToRefs(usePlayStore());

const setVolume = (value) => {
  updateUI(value);
  updateVolume(value);
};

//仅更新UI
const updateUI = (value) => {
  status.value = value > 0.5 ? 2 : value > 0 ? 1 : 0;
  sliderRef.value.updateProgress(value);
};

const toggleMute = () => {
  updateVolume(sliderRef.value.toggleProgress());
};

watch(volume, (nv, ov) => updateUI(nv));

defineExpose({
  setVolume,
});
</script>

<template>
  <div class="volume-bar">
    <div class="volume-status" @click="toggleMute">
      <i v-show="status == 0" class="st-slient iconfont icon-24gl-volumeCross"></i>
      <i v-show="status == 1" class="st-small iconfont icon-24gl-volumeLow"></i>
      <i v-show="status == 2" class="st-large iconfont icon-24gl-volumeHigh"></i>
    </div>
    <SliderBar class="volume-value" ref="sliderRef" :initValue="0.5" :onseek="updateVolume" :onscroll="updateVolume" :ondrag="updateVolume"> </SliderBar>
  </div>
</template>

<style>
.volume-bar {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  -webkit-app-region: none;
}

.volume-bar .volume-status,
.volume-bar .volume-value {
  /* margin: auto; */
}

.volume-bar .volume-status {
  margin-top: 3px;
  width: 20px;
  cursor: pointer;
}

.volume-bar .volume-status svg {
  fill: var(--svg-color);
}

.volume-bar .st-slient,
.volume-bar .st-small,
.volume-bar .st-large {
  width: 20px;
  height: 20px;
}

.volume-bar .volume-status:hover svg {
  fill: var(--hl-color);
  fill: var(--svg-hover-color);
}

.volume-bar .volume-value {
  margin-left: 5px;
  width: 80px;
  height: 3px;
  border-radius: 10rem;
}

.volume-bar .volume-value .thumb {
  visibility: hidden;
}

.volume-bar:hover .volume-value .thumb {
  visibility: visible;
}
</style>
