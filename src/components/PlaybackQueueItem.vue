<script setup>
import { Track } from "../common/Track";
import ArtistControl from "./ArtistControl.vue";
import { usePlayStore } from "../store/playStore";
import { inject, onMounted, ref } from "vue";
import EventBus from "../common/EventBus";
import { useAppCommonStore } from "../store/appCommonStore";
import { storeToRefs } from "pinia";

const { visitPlaylist } = inject("appRoute");

const { queueTracksSize } = storeToRefs(usePlayStore());
const { playTrack, removeTrack, isCurrentTrack, togglePlay } = usePlayStore();
const { showToast } = useAppCommonStore();

const props = defineProps({
  data: Object, //Track
  active: Boolean,
});

const playItem = () => {
  const track = props.data;
  if (isCurrentTrack(track)) {
    togglePlay();
    return;
  }
  playTrack(track);
};

const linkItem = () => {
  const track = props.data;
  if (!Track.hasPid(track)) return;
  const { pid, platform } = track;
  visitPlaylist(platform, pid);
};

const removeItem = () => {
  removeTrack(props.data);
  if (queueTracksSize.value > 0) {
    showToast("歌曲已删除！");
    return;
  }
  EventBus.emit("playbackQueue-empty");
};
</script>

<template>
  <div class="playback-queue-item" :class="{ current: active }" @dblclick="">
    <div class="item-wrap">
      <div class="left">
        <img class="cover" v-lazy="data.cover" />
      </div>
      <div class="right">
        <div class="data">
          <div class="title" v-html="data.title"></div>
          <div class="bottom">
            <div class="artist">
              <ArtistControl :visitable="true" :platform="data.platform" :data="data.artist" :trackId="data.id"> </ArtistControl>
            </div>
            <span class="duration">{{ Track.mmssDuration(data) }}</span>
          </div>
        </div>
        <div class="action">
          <i class="iconfont icon-sanjiaoxing" @click="playItem"></i>
          <i class="iconfont icon-lianjie" @click="linkItem"></i>
          <i class="iconfont icon-shanchu" @click="removeItem"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playback-queue-item {
  border-bottom: 1px solid var(--border-color);
  --item-height: 66px;
  --cover-size: 43px;
}

.playback-queue-item .item-wrap {
  margin: 0px;
  padding-left: 10px;
  height: var(--item-height);
  display: flex;
  flex: 1;
  align-items: center;
  border-left: 2px solid transparent;
}

.playback-queue-item:hover {
  background: var(--list-item-hover);
}

.playback-queue-item .spacing {
  margin-left: 12px;
}

.current .item-wrap {
  border-image: var(--pbq-hl-border);
}

.current .title,
.current .artist,
.current .duration {
  background: var(--hl-text-bg);
  background: var(--pbq-hl-text-color);
  -webkit-background-clip: text;
  color: transparent !important;
  font-weight: 520;
}

.playback-queue-item .cover {
  width: var(--cover-size);
  height: var(--cover-size);
  margin-right: 8px;
  -webkit-user-drag: none;
  box-shadow: 0px 0px 1px #161616;
}

.playback-queue-item .left {
  height: 100%;
  display: flex;
  align-items: center;
}

.playback-queue-item .right {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.playback-queue-item .right .data {
  height: var(--cover-size);
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.playback-queue-item .title,
.playback-queue-item .artist {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.playback-queue-item .title {
  /*
    margin-top: 2px;
    margin-bottom: 6px;
    */
  width: 258px;
  width: 77%;
  top: 2px;
}

.playback-queue-item .bottom {
  /*position: relative;*/
}

.playback-queue-item .artist,
.playback-queue-item .duration {
  color: var(--text-sub-color);
  /*
    font-size: 14px;
    bottom: 10px;
    */
  font-size: 13px;
  bottom: 12px;
  font-weight: 520;
}

.playback-queue-item .artist {
  position: absolute;
  left: 0px;
  width: 210px;
  width: 62.68%;
  cursor: pointer;
}

.playback-queue-item .artist span {
  cursor: pointer;
}

.playback-queue-item .artist span:hover {
  background: var(--hl-text-bg);
  -webkit-background-clip: text;
  color: transparent;
}

.playback-queue-item .duration {
  position: absolute;
  right: 20px;
}

.playback-queue-item .action {
  z-index: 2;
  height: 100%;

  position: absolute;
  top: 0px;
  right: 10px;

  display: flex;
  align-items: center;

  padding-left: 15px;
  padding-right: 15px;

  /*background: var(--list-item-hover);*/
  visibility: hidden;
  gap: 15px;
}

.playback-queue-item .action i {
  color: var(--svg-color);
  cursor: pointer;
}

.playback-queue-item .action i:hover {
  color: var(--hl-color);
  color: var(--svg-hover-color);
}

.playback-queue-item:hover .title,
.playback-queue-item:hover .artist {
  width: 158px;
  width: 47.16%;
}

.playback-queue-item:hover .action {
  visibility: visible;
}

.playback-queue-item:hover .duration {
  visibility: hidden;
}
</style>
