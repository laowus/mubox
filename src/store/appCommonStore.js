import { defineStore } from "pinia";
import EventBus from "../common/EventBus";

export const useAppCommonStore = defineStore("appCommon", {
  state: () => ({
    coverMaskShow: false,
    playbackQueueViewShow: false,
    playingViewShow: false,
    //通用通知
    commonNotificationShow: false,
    commonNotificationText: null,
    commonNotificationType: 0, //类型，0 - 普通成功消息，1-失败消息
    //当前调用链路追踪ID
    currentTraceId: null,
  }),
  getters: {},
  actions: {
    hidePlaybackQueueView() {
      this.playbackQueueViewShow = false;
    },
    togglePlaybackQueueView() {
      this.playbackQueueViewShow = !this.playbackQueueViewShow;
    },
    showPlayingView() {
      this.playingViewShow = true;
    },
    hidePlayingView() {
      this.playingViewShow = false;
    },
    toggleCoverMask() {
      this.coverMaskShow = !this.coverMaskShow;
    },
    setCommonNotificationType(type) {
      this.commonNotificationType = type || 0;
    },
    showCommonNotification(text) {
      this.commonNotificationShow = true;
      this.commonNotificationText = text || "操作成功！";
    },
    setCommonNotificationType(type) {
      this.commonNotificationType = type || 0;
    },
    hideCommonNotification() {
      this.commonNotificationShow = false;
      this.commonNotificationText = null;
      this.commonNotificationType = null;
    },
    showToast(text, callback, delay) {
      text = text || "操作成功！";
      this.setCommonNotificationType(0);
      EventBus.emit("toast", { text, callback, delay });
    },
    showFailToast(text, callback, delay) {
      text = text || "操作失败！";
      this.setCommonNotificationType(1);
      EventBus.emit("toast", { text, callback, delay });
    },
    setCurrentTraceId(id) {
      this.currentTraceId = id;
    },
    isCurrentTraceId(id) {
      return this.currentTraceId == id;
    },
  },
});
