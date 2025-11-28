<script setup>
import { inject, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { usePlatformStore } from "../store/platformStore";
import { useAppCommonStore } from "../store/appCommonStore";
import EventBus from "../common/EventBus";
import WindowCtr from "../components/WindowCtr.vue";

const activeCustomPlaylistIndex = ref(-1);
let isUserMouseWheel = ref(false),
  userMouseWheelCancelTimer = null;

const { platforms, currentPlatformIndex, currentPlatformCode } = storeToRefs(usePlatformStore());
const { updateCurrentPlatform, isLocalMusic } = usePlatformStore();

const onUserMouseWheel = () => {
  isUserMouseWheel.value = true;
  if (userMouseWheelCancelTimer) clearTimeout(userMouseWheelCancelTimer);
  userMouseWheelCancelTimer = setTimeout(() => {
    isUserMouseWheel.value = false;
  }, 888);
};

const { visitRoute } = inject("appRoute");

//TODO
const updatePlatformIndex = (index) => {
  updateCurrentPlatform(index);
  const platform = currentPlatformCode.value;
  let path = null;
  path = `/playlists/square/${platform}`;
  if (isLocalMusic(platform)) {
    path = `/${platform}`;
  }
  visitRoute(path);
};

watch(
  () => currentPlatformIndex.value,
  (newIndex) => {
    console.log("currentPlatformIndex", newIndex);
  },
);
</script>
<template>
  <div id="main-left" :class="{ mousewheelViewpoint: isUserMouseWheel }">
    <div class="header">
      <WindowCtr />
    </div>
    <div class="center" @scroll="onUserMouseWheel">
      <div id="platform-list">
        <ul>
          <li v-for="(item, index) in platforms()" :class="{ active: currentPlatformIndex == index }" @click="updatePlatformIndex(index)" v-html="item.name"></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style>
#main-left {
  width: 211px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 0px 3px var(--main-left-border-color);
  background: var(--main-left-bg);
}

#main-left ::-webkit-scrollbar-thumb {
  background: transparent;
  border: 1px solid transparent;
}

.mousewheelViewpoint ::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb-bg) !important;
  border: 1px solid var(--scrollbar-thumb-bg) !important;
}

#main-left .subtitle {
  font-size: 13px;
  text-align: left;
  color: var(--text-subtitle-color);
  padding-left: 22%;
  padding-left: 19.5%;
  margin-bottom: 10px;
  font-weight: 520;
}

#main-left .header,
#main-left .center,
#main-left .bottom {
  width: 100%;
}

#main-left .header {
  -webkit-app-region: drag;
  height: 72px;
  margin-bottom: 8px;
  display: flex;
}

#main-left .header .win-traffic-light-btn {
  margin-top: 17px;
  margin-left: 20px;
}

#main-left .header .logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 16%;
  top: 60px;
  display: none;
}

#main-left .center {
  flex: 1;
  padding-bottom: 36px;
  overflow: scroll;
}

#explore-mode {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* color: var(--text-sub-color); */
}

#explore-mode svg,
#custom-playlist-list svg {
  fill: var(--text-sub-color);
  margin-right: 6px;
}

#explore-mode {
  position: relative;
}

#explore-mode .mode-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  padding: 3px 6px;
  font-size: 18px;
  font-size: 19px;
  font-weight: bold;
  color: var(--text-sub-color);
  margin-right: 23%;
}

#explore-mode .mode-item:hover span {
  color: var(--hl-title-color);
}

#explore-mode .mode-item:hover svg {
  fill: var(--svg-hover-color);
}

#explore-mode .exit-btn {
  position: absolute;
  top: 8px;
  right: 20px;
}

#explore-mode .exit-btn:hover svg {
  fill: var(--svg-hover-color);
  cursor: pointer;
}

#explore-mode .excluded-mode-item {
  cursor: default !important;
}

#explore-mode .excluded-mode-item:hover span {
  color: var(--text-sub-color) !important;
}

#explore-mode .excluded-mode-item:hover svg {
  fill: var(--svg-color) !important;
}

#custom-playlist-list,
#favorite-playlist-list,
#follow-artist-list {
  margin-top: 36px;
  position: relative;
}

#main-left .add-custom-btn,
#main-left .collapse-btn,
#main-left .expand-btn {
  fill: var(--text-sub-color);
  cursor: pointer;
  position: absolute;
  /* right: 15px; */
  right: 19px;
  top: 4px;
}

#main-left .collapse-btn,
#main-left .expand-btn {
  /* right: 22px; */
  right: 26px;
}

#main-left .add-custom-btn:hover {
  fill: var(--hl-color);
}

#main-left ul {
  list-style: none;
  text-align: left;
  line-height: 32px;
  padding-left: 13%;
  padding-left: 10%;
}

#main-left li {
  text-decoration: none;
  width: 65%;
  width: 117px;
  width: 128px;
  margin-bottom: 10.5px;
  padding-left: 20px;
  padding-right: 20px;
  cursor: pointer;
  border-radius: 5px;
  text-align: left;
  overflow: hidden;
  word-wrap: break-all;
  white-space: pre-wrap;
  line-break: anywhere;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

#main-left li:hover {
  background: var(--list-item-hover);
}

#favorite-playlist-list li {
  padding-left: 15px;
  padding-right: 15px;
  /* width: 127px; */
  width: 138px;
}

#main-left .active {
  background: var(--list-item-active-bg) !important;
  color: var(--svg-btn-color);
}

#main-left .bottom {
  height: 72px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-right: 22px;
}

#app-logo {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rem 0 10rem 10rem;
  border: 0px solid;
  font-weight: bold;
  background: var(--logo-bg);
  /*color: var(--logo-color);*/
}

#app-logo span {
  width: 16px;
  height: 16px;
  line-height: 16px;
  font-size: 13px;
  justify-content: center;
  border-radius: 10rem;
  background: var(--logo-text-bg);
  color: var(--logo-text-color);
}

#app-name {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  font-size: 18px;
  font-weight: bold;
  background: var(--logo-bg);
  -webkit-background-clip: text;
  color: transparent;
}
</style>
