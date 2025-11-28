<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { Track } from "../common/Track";
import ArtistControl from "./ArtistControl.vue";
import AlbumControl from "./AlbumControl.vue";
import { usePlayStore } from "../store/playStore.js";

const props = defineProps({
  index: Number,
  artistVisitable: Boolean,
  albumVisitable: Boolean,
  data: Object, //Track
});

const { playing } = storeToRefs(usePlayStore());
const { addTrack, playTrack } = usePlayStore();

const toString = (value) => {
  return value ? value.toString() : value;
};

const isExtra1Available = () => {
  const extra = props.data.extra1;
  if (typeof extra === "string") {
    return extra ? extra.trim().length > 0 : false;
  }
  return false;
};

const isExtra2Available = () => {
  const extra = props.data.extra2;
  if (typeof extra === "string") {
    return extra ? extra.trim().length > 0 : false;
  }
  return false;
};

const playItem = () => {
  console.log("播放歌曲:::", props.data);
  playTrack(props.data);
};

const addItem = () => {
  addTrack(props.data);
  showToast("歌曲已添加成功！");
};
</script>

<template>
  <div class="song-item">
    <div class="sqno">{{ index + 1 }}</div>
    <div class="title-wrap">
      <span v-html="data.title"></span>
      <div class="action">
        <i @click="playItem" class="iconfont icon-sanjiaoxing"></i>
        <i @click="addItem" class="iconfont icon-tianjia"></i>
      </div>
    </div>
    <div class="artist spacing1" v-show="!isExtra1Available()">
      <ArtistControl :visitable="artistVisitable" :platform="data.platform" :data="data.artist" :trackId="toString(data.id)"> </ArtistControl>
    </div>
    <div class="album spacing1" v-show="!isExtra2Available()">
      <AlbumControl :visitable="albumVisitable" :platform="data.platform" :data="data.album"> </AlbumControl>
    </div>
    <div class="extra1 spacing1" v-show="isExtra1Available()">{{ data.extra1 }}</div>
    <div class="extra2 spacing1" v-show="isExtra2Available()">{{ data.extra2 }}</div>
    <div class="duration spacing1">{{ Track.mmssDuration(data) }}</div>
  </div>
</template>

<style scoped>
.song-item {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex: 1;
  margin-bottom: 3px;
}

.song-item:hover {
  background: var(--list-item-hover);
}

.song-item .hidden {
  display: none !important;
}

.song-item > div {
  line-height: 50px;
  line-height: 59px;
  vertical-align: middle;
  font-size: var(--text-size);
}

.song-item .spacing {
  margin-left: 12px;
}

.song-item .spacing1 {
  margin-left: 8px;
}

.song-item .title-wrap,
.song-item .artist,
.song-item .album {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  text-align: left;
}

.song-item .artist span,
.song-item .album span {
  cursor: pointer;
}

.song-item .artist span:hover,
.song-item .album span:hover {
  background: var(--hl-text-bg);
  -webkit-background-clip: text;
  color: transparent;
}

.song-item .sqno {
  width: 35px;
  padding-left: 8px;
  text-align: left;
}

.song-item .sqno i {
  margin-bottom: -3px;
  color: var(--svg-color);
}

.song-item .sqno .checked-svg {
  fill: var(--hl-color) !important;
}

.song-item .title-wrap {
  flex: 1;
  position: relative;
  text-align: left;
  margin-top: 1px;
}

.song-item .title-wrap span {
  z-index: 1;
}

/* .song-item .mv span, */
.song-item .vipflag span {
  color: var(--hl-color);
  border-radius: 3px;
  border: 1.3px solid var(--hl-color);
  padding: 1px 3px;
  font-size: 10px;
  font-weight: 600;
  margin-right: 5px;
}

.song-item .artist,
.song-item .extra1 {
  width: 25%;
}

.song-item .album,
.song-item .extra2 {
  width: 25%;
}

.song-item .extra1,
.song-item .extra2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  text-align: left;
}

.song-item .duration {
  width: 53px;
  padding-right: 8px;
  text-align: right;
}

.song-item .action {
  z-index: 2;
  height: 100%;

  position: absolute;
  top: 0px;
  left: 158px;
  left: 51%;
  gap: 10px;

  display: flex;
  flex-direction: row;
  align-items: center;

  padding-left: 10px;
  padding-right: 10px;

  /* background: var(--list-item-hover); */
  visibility: hidden;
}

.song-item .action .delete-btn {
  visibility: hidden;
}

.song-item .action i {
  color: var(--svg-color);
  cursor: pointer;
}

.song-item .mv i:hover,
.song-item .action i:hover {
  color: var(--svg-hover-color);
}

.song-item .title-wrap:hover .action {
  visibility: visible;
}

.song-item .title-wrap:hover .limitedSpan {
  width: 158px;
  width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>
