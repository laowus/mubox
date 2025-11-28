<script setup>
import { inject } from "vue";
import PaginationTiles from "./PaginationTiles.vue";
import ImageTextTileLoadingMask from "./ImageTextTileLoadingMask.vue";
import EventBus from "../common/EventBus";
const props = defineProps({
  data: Array,
  loading: Boolean,
  checkbox: Boolean,
});

const { visitPlaylist } = inject("appRoute");

const visitItem = (item) => {
  console.log("visitItem", item);
  const { id, platform } = item;
  visitPlaylist(platform, id);
};

const playItem = (playlist, text) => EventBus.emit("playlist-play", { playlist, text });
</script>
<template>
  <div class="playlists-ctl">
    <PaginationTiles v-show="!loading">
      <ImageTextTile v-for="item in data" @click="visitItem(item)" :key="item.id" :cover="item.cover" :title="item.title" :subtitle="item.subtitle" :playable="true" :playAction="() => playItem(item)" />
    </PaginationTiles>
    <ImageTextTileLoadingMask :count="16" v-show="loading"></ImageTextTileLoadingMask>
  </div>
</template>

<style>
.playlists-ctl {
  margin-top: 15px;
}
</style>
