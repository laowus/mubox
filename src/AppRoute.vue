<script setup>
import { provide } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { usePlatformStore } from "./store/platformStore";
const { updateCurrentPlatformByCode } = usePlatformStore();

/* 全局Router设置  */
const router = useRouter();
const setupRouter = () => {
  router.beforeResolve((to, from) => {
    console.log("[ ROUTE ] ==>>> " + to.path);
    highlightPlatform(to);
  });
};

const highlightPlatform = (to) => {
  const path = to.path;
  let platform = "";
  if (path.includes("/square/")) {
    ///eg:playlists/square/qq
    platform = path.split("/")[3];
  } else if (path.includes("/playlist/")) {
    ///eg:playlist/qq/123456
    platform = path.split("/")[2];
  } else if (path.includes("/local")) {
    platform = "local";
  }
  updateCurrentPlatformByCode(platform);
};

const currentRoutePath = () => router.currentRoute.value.path;
const resolveRoute = (route) => {
  if (typeof route == "object") return route;
  return { toPath: route.toString() };
};

const visitRoute = (route) => {
  console.log("visitRoute", route);
  return new Promise((resolve, reject) => {
    if (!route) {
      //if(reject) reject()
      return;
    }
    const { toPath, onRouteReady, beforeRoute } = resolveRoute(route);
    if (!toPath) {
      //if(reject) reject()
      return;
    }
    if (beforeRoute) beforeRoute(toPath);
    const fromPath = currentRoutePath();
    const isSame = fromPath == toPath;
    if (isSame) {
      console.log("visitRoute toPath isSame", toPath);
      //if(reject) reject()
      return;
    }
    if (onRouteReady) onRouteReady(toPath);
    console.log("visitRoute toPath", toPath);
    router.push(toPath);
    if (resolve) resolve();
  });
};

setupRouter();

provide("appRoute", {
  visitRoute,
  visitPlaylist: (platform, id) => {
    router.push(`/playlist/${platform}/${id}`);
  },
  backward: () => router.back(),
  forward: () => router.forward(),
  visitSetting: () => visitRoute("/setting"),
});
</script>
<template>
  <slot></slot>
</template>

<style scoped></style>
