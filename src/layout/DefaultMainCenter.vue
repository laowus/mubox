<script setup>
import { inject, onActivated, onMounted, shallowRef, watch } from "vue";
import { storeToRefs } from "pinia";
import MainContent from "./DefaultMainContent.vue";
import MainTop from "./DefaultMainTop.vue";
import { useSettingStore } from "../store/settingStore";
import EventBus from "../common/EventBus";
const { isDefaultClassicLayout } = storeToRefs(useSettingStore());

const currentMainTop = shallowRef(null);
const currentMainBottom = shallowRef(null);

const setupDefaultLayout = () => {
  if (isDefaultClassicLayout.value) {
    // currentMainTop.value = ClassicMainTop;
  } else {
    currentMainTop.value = MainTop;
  }
};

const setImageTextTileSize = () => {
  const tileMinWidth = 165;
  const tileHMargin = 12.5;
  const mainMargin = 33;
  const scrollBarWidth = 6;
  const limits = [5, 4]; //TODO 宽屏、超宽屏，需更好兼容性
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;
  const { clientWidth } = mainContent;
  const minWidths = limits.map((item) => item * (tileMinWidth + tileHMargin * 2) + mainMargin * 2 + scrollBarWidth);
  const tileCovers = document.querySelectorAll(".image-text-tile .cover");
  const tileTitles = document.querySelectorAll(".image-text-tile .title");
  let tileWidth = 165,
    limit = 0;
  for (var i = 0; i < limits.length; i++) {
    if (clientWidth > minWidths[i]) {
      limit = limits[i];
      break;
    }
  }
  if (limit > 0) tileWidth = (clientWidth - 2 * mainMargin - scrollBarWidth) / limit - tileHMargin * 2;
  tileCovers.forEach((item) => {
    item.style.width = tileWidth + "px";
    item.style.height = tileWidth + "px";
  });
  tileTitles.forEach((item) => {
    item.style.width = tileWidth + "px";
  });
};

const setImageTextTileLoadingMaskSize = () => {
  const tileMinWidth = 165;
  const tileHMargin = 12.5;
  const mainMargin = 33;
  const titleHeight = 28,
    titleMarginTop = 5;
  const scrollBarWidth = 6;
  const limits = [5, 4];
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;
  const { clientWidth } = mainContent;
  const minWidths = limits.map((item) => item * (tileMinWidth + tileHMargin * 2) + mainMargin * 2 + scrollBarWidth);
  const tiles = document.querySelectorAll(".tiles-loading-mask .tile");
  const tileCovers = document.querySelectorAll(".tiles-loading-mask .tile .cover");
  let tileWidth = 165,
    limit = 0,
    isLastVisible = true;
  if (clientWidth > minWidths[0]) {
    limit = limits[0];
    isLastVisible = false;
  } else if (clientWidth > minWidths[1]) {
    limit = limits[1];
    isLastVisible = true;
  }
  if (limit > 0) tileWidth = (clientWidth - 2 * mainMargin - scrollBarWidth) / limit - tileHMargin * 2;
  for (let i = 0; i < tiles.length; i++) {
    const item = tiles[i];
    item.style.width = tileWidth + "px";
    item.style.height = tileWidth + titleHeight + titleMarginTop + "px";
    if (i == tiles.length - 1) {
      item.style.display = isLastVisible ? "block" : "none";
    }
  }
  tileCovers.forEach((item) => {
    item.style.height = tileWidth + "px";
  });
};

const setImageTextTileComponentSize = () => {
  setImageTextTileSize();
  setImageTextTileLoadingMaskSize();
};

onActivated(setupDefaultLayout);

EventBus.on("imageTextTile-load", setImageTextTileComponentSize);
EventBus.on("imageTextTileLoadingMask-load", setImageTextTileComponentSize);
</script>
<template>
  <div id="main-center">
    <component id="main-top" :is="currentMainTop"> </component>
    <MainContent id="main-content" :class="{ autopadding: isDefaultClassicLayout }"> </MainContent>
  </div>
</template>

<style>
#main-center {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background: var(--main-center-bg);
}

#main-center,
#main-top,
#main-content,
#main-bottom {
  z-index: 1;
}

/* TODO */
#main-center .autopadding .playlist-square-view,
#main-center .autopadding .artist-square-view,
#main-center .autopadding .radio-square-view,
#main-center .autopadding #themes-view .title,
#main-center .autopadding #setting-view .title,
#main-center .autopadding #search-view,
#main-center .autopadding #user-profile-view,
#main-center .autopadding #batch-action-view,
#main-center .autopadding #user-info-edit-view,
#main-center .autopadding #custom-playlist-edit-view,
#main-center .autopadding #data-backup-view,
#main-center .autopadding #data-restore-view {
  padding-top: 5px;
}

#main-center .autopadding #local-music-view,
#main-center .autopadding #playlist-detail-view,
#main-center .autopadding #artist-detail-view,
#main-center .autopadding #album-detail-view,
#main-center .autopadding #custom-playlist-detail-view {
  padding-top: 13px;
}
</style>
