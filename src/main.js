import { createApp } from "vue";
import App from "./App.vue";

//Pinia
import { createPinia } from "pinia";
import piniaPersist from "pinia-plugin-persist";
import ImageTextTile from "./components/ImageTextTile.vue";
import SongItem from "./components/SongItem.vue";
import PlayControl from "./components/PlayControl.vue";
import ProgressBar from "./components/ProgressBar.vue";
import SliderBar from "./components/SliderBar.vue";
import PlaybackQueueView from "./views/PlaybackQueueView.vue";
//Router
import { router } from "./route/router";
//LazyLoad
import VueLazyLoad from "vue3-lazyload";
//播放器
import { Player } from "./common/Player";

import "./assets/iconfont/iconfont.css";

const pinia = createPinia();
pinia.use(piniaPersist);

//播放器：初始化并配置
Player.initAndSetup();

//应用：创建、配置
const app = createApp(App);

//全局异常处理器
app.config.errorHandler = (err, vm, info) => {
  // 处理错误
  // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
  console.log(err, vm, info);
};
app
  .use(pinia)
  .use(router)
  .use(VueLazyLoad, {
    loading: "default_cover.png",
    error: "default_cover.png",
    log: false,
    lifecycle: {
      error: (el) => {
        //console.log(el)
      },
    },
  })
  .component("SliderBar", SliderBar)
  .component("ProgressBar", ProgressBar)
  .component("ImageTextTile", ImageTextTile)
  .component("SongItem", SongItem)
  .component("PlayControl", PlayControl)
  .component("PlaybackQueueView", PlaybackQueueView)
  .mount("#app");
