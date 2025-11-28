<script setup>
import { ref, reactive, onMounted } from "vue";
import Notification from "./components/Notification.vue";
import { useAppCommonStore } from "./store/appCommonStore";
import { storeToRefs } from "pinia";
import EventBus from "./common/EventBus";

const { commonNotificationShow, commonNotificationText, playbackQueueViewShow } = storeToRefs(useAppCommonStore());

const { showCommonNotification, hideCommonNotification } = useAppCommonStore();

const doToast = (text, callback, delay) => {
  delay = delay && delay >= 0 ? delay : 1500;
  showCommonNotification(text);
  setTimeout(() => {
    hideCommonNotification();
    if (callback) callback();
  }, delay);
};
const bindEventListeners = () => {
  EventBus.on("toast", ({ text, callback, delay }) => doToast(text, callback, delay));
};

onMounted(() => {
  bindEventListeners();
});
</script>
<template>
  <transition>
    <Notification class="common-ntf" v-show="commonNotificationShow">
      <template #text>
        <p v-html="commonNotificationText"></p>
      </template>
    </Notification>
  </transition>
  <PlaybackQueueView id="playback-queue-view" v-show="playbackQueueViewShow"> </PlaybackQueueView>
</template>

<style>
#playback-queue-view {
  position: absolute;
  top: 0;
  right: 0px;
  width: 335px;
  max-width: 404px;
  width: 33.5%;
  height: 100%;
  z-index: 99;
  background: var(--app-bg);
  box-shadow: var(--pbq-box-shadow);
}

#playing-view,
#video-playing-view {
  position: absolute;
  top: 0;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 99;
  background: var(--app-bg);
}

#video-playing-view {
  z-index: 100;
}

#audio-effect-view {
  position: absolute;
  right: 30px;
  bottom: 80px;
  width: 725px;
  height: 550px;
  z-index: 99;
  background: var(--app-bg);
  box-shadow: var(--pbq-box-shadow);
}

#lyric-toolbar {
  position: absolute;
  top: 202px;
  right: 30px;
  z-index: 99;
}

#random-music-toolbar {
  position: absolute;
  bottom: 128px;
  right: 30px;
  z-index: 99;
  box-shadow: var(--pbq-box-shadow);
}
</style>
