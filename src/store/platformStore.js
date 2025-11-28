import { defineStore } from "pinia";
import { QQ } from "../vendor/qq";
import { NetEase } from "../vendor/netease";
import { KuGou } from "../vendor/kugou";
import { LocalMusic } from "../vendor/localmusic";

//weight权重，范围：1 - 10
const T_TYPES = [
  {
    code: "songs",
    name: "歌曲",
    weight: 5,
  },
  {
    code: "playlists",
    name: "歌单",
    weight: 8, //包括歌单电台
  },
  {
    code: "albums",
    name: "专辑",
    weight: 3,
  },
  {
    code: "artists",
    name: "歌手",
    weight: 5,
  },
  {
    code: "fmRadios",
    name: "广播电台",
    weight: 3,
  },
  {
    code: "anchorRadios",
    name: "主播电台",
    weight: 3,
  },
];

const randomMusicTypes = T_TYPES.slice(1);
randomMusicTypes.splice(1, 2);

//音乐平台
const ALL_PLATFORMS = [
  {
    code: "all",
    name: "全部平台",
    shortName: "ALL",
    online: null,
    types: null,
  },
  {
    code: QQ.CODE,
    name: "QQ音乐",
    shortName: "QQ",
    online: true,
    types: ["playlists", "artists", "albums"],
    weight: 8,
  },
  {
    code: NetEase.CODE,
    name: "网易云音乐",
    shortName: "WY",
    online: true,
    types: ["playlists", "artists", "albums", "anchorRadios"],
    weight: 8,
  },
  {
    code: KuGou.CODE,
    name: "酷狗音乐",
    shortName: "KG",
    online: true,
    types: ["playlists", "artists", "albums"],
    weight: 8,
  },
  {
    code: LocalMusic.CODE,
    name: "本地歌曲",
    shortName: "LO",
    online: false,
    types: null,
  },
];

const playlistPlatforms = ALL_PLATFORMS.slice(1);

const vendors = {
  qq: QQ,
  netease: NetEase,
  kugou: KuGou,
  local: LocalMusic,
};

//平台相关Store
export const usePlatformStore = defineStore("platform", {
  //State
  state: () => ({
    currentPlatformIndex: 0,
    vendors,
  }),
  //Getters
  getters: {
    platforms() {
      return (scope) => {
        scope = (scope || "").toString().trim();
        return playlistPlatforms;
      };
    },
    currentPlatform() {
      return this.platforms()[this.currentPlatformIndex];
    },
    currentPlatformCode() {
      return this.currentPlatform ? this.currentPlatform.code : "";
    },
    randomMusicTypes() {
      return randomMusicTypes;
    },
  },
  //Actions
  actions: {
    updateCurrentPlatform(index) {
      this.currentPlatformIndex = index;
    },
    updateCurrentPlatformByCode(code) {
      if (!code || code.trim().length < 1) {
        this.updateCurrentPlatform(-1);
        return;
      }
      const platformArr = this.platforms();
      for (var i = 0; i < platformArr.length; i++) {
        if (code === platformArr[i].code) {
          this.updateCurrentPlatform(i);
          return;
        }
      }
      this.updateCurrentPlatform(-1);
    },
    getVendor(platform) {
      platform = (platform || "").toString().trim().toLowerCase();
      return this.vendors[platform];
    },
    currentVender() {
      return this.getVendor(this.currentPlatformCode);
    },
    isQQ(platform) {
      if (!this.isPlatformValid(platform)) return false;
      return platform.trim() == QQ.CODE;
    },
    isNetEase(platform) {
      if (!this.isPlatformValid(platform)) return false;
      return platform.trim() == NetEase.CODE;
    },
    isArtistDetailVisitable(platform) {
      if (!this.isPlatformValid(platform)) return false;
      return !this.isLocalMusic(platform);
    },
    isAlbumDetailVisitable(platform) {
      if (!this.isPlatformValid(platform)) return false;
      return !this.isDouBan(platform) || !this.isLocalMusic(platform);
    },
    isPlatformValid(platform) {
      return platform && platform.trim().length > 0;
    },
    isPlaylistType(type) {
      return type === "playlists";
    },
    isAnchorRadioType(type) {
      return type === "anchorRadios";
    },
    isFMRadioType(type) {
      return type === "fmRadios";
    },
    isLocalMusic(platform) {
      if (!this.isPlatformValid(platform)) return false;
      return platform.trim() == LocalMusic.CODE;
    },
    getPlatformName(platform) {
      const result = ALL_PLATFORMS.filter((item) => item.code == platform);
      return !result || result.length != 1 ? null : result[0].name;
    },
    getPlatformShortName(platform) {
      const result = ALL_PLATFORMS.filter((item) => item.code == platform);
      return !result || result.length != 1 ? null : result[0].shortName;
    },
  },
});
