import { createRouter, createWebHashHistory } from "vue-router";
import PlaylistSquareView from "../views/PlaylistSquareView.vue";
import PlaylistDetailView from "../views/PlaylistDetailView.vue";
import SettingView from "../views/SettingView.vue";
import LocalMusicView from "../views/LocalMusicView.vue";
const routes = [
  {
    //默认
    path: "/",
    redirect: "/playlists/square/qq",
  },
  {
    //歌单广场
    path: "/playlists/square/:platform",
    component: PlaylistSquareView,
  },
  {
    //歌单详情
    path: "/playlist/:platform/:id",
    props: true,
    component: PlaylistDetailView,
  },

  {
    //设置
    path: "/setting",
    component: SettingView,
  },
  {
    //本地歌曲
    path: "/local",
    component: LocalMusicView,
  },
];

export const router = createRouter({
  //为了简单起见，在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes,
});
