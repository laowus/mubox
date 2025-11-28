import { invoke } from "@tauri-apps/api/core";
import forge from "node-forge";
import CryptoJS from "crypto-js";
import { Category } from "../common/Category.js";
import { Playlist } from "../common/Playlist.js";
import { Track } from "../common/Track";
import { randomText } from "../common/Utils";

const DEFAULT_CATE = new Category("默认");
DEFAULT_CATE.add("全部", "");
const DOM_PARSER = new DOMParser();

//常量
const MODULUS = "00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b72" + "5152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbd" + "a92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe48" + "75d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7";
const NONCE = "0CoJUm6Qyw8W8jud";
const PUBLIC_KEY = "010001";
const IV = "0102030405060708";
const CHOICE = "012345679abcdef";

const BASE_URL = "https://music.163.com";

const rsaEncrypt = (src, publicKey, modulus) => {
  src = src.split("").reverse().join("");
  const m = new forge.jsbn.BigInteger(modulus, 16);
  const k = new forge.jsbn.BigInteger(publicKey, 16);
  const s = new forge.jsbn.BigInteger(forge.util.bytesToHex(src), 16);
  return s.modPow(k, m).toString(16).padStart(256, "0");
};

const aesEncrypt = (src, secKey, iv) => {
  secKey = CryptoJS.enc.Utf8.parse(secKey);
  iv = CryptoJS.enc.Utf8.parse(iv);
  src = CryptoJS.enc.Utf8.parse(src);
  const buffer = CryptoJS.AES.encrypt(src, secKey, { iv, mode: CryptoJS.mode.CBC });
  return buffer.toString();
};

const weapi = (text) => {
  if (typeof text === "object") text = JSON.stringify(text);
  let secretkey = randomText(CHOICE, 16);
  let base64Text = aesEncrypt(text, NONCE, IV);
  const params = aesEncrypt(base64Text, secretkey, IV);
  const encSecKey = rsaEncrypt(secretkey, PUBLIC_KEY, MODULUS);
  return { params, encSecKey };
};

const playlistParam = (id) => {
  return {
    id,
    offset: 0,
    total: true,
    limit: 1000,
    n: 1000,
    csrf_token: "",
  };
};

const trackIdsParam = (ids) => {
  const c = [];
  ids.forEach((id) => {
    c.push({ id });
  });
  return { c: JSON.stringify(c), ids: JSON.stringify(ids) };
};

const playParam = (id) => {
  return {
    ids: [id],
    level: "standard",
    encodeType: "aac",
    csrf_token: "",
  };
};

export class NetEase {
  static CODE = "netease";
  static TOPLIST_CODE = "排行榜";
  static RADIO_PREFIX = "DJR_";
  static header = {
    Referer: "https://music.163.com/",
    Origin: "https://music.163.com/",
  };

  //全部分类
  static categories() {
    return new Promise((resolve) => {
      const url = "https://music.163.com/discover/playlist";
      invoke("http_get_text", { url, header: NetEase.header }).then((res) => {
        const result = { platform: NetEase.CODE, data: [], orders: [] };
        result.data.push(DEFAULT_CATE);

        const doc = DOM_PARSER.parseFromString(res, "text/html");
        const listEl = doc.querySelectorAll("#cateListBox .f-cb");
        listEl.forEach((el) => {
          const cate = el.querySelector("dt").textContent;
          const category = new Category(cate);
          const fcEls = el.querySelectorAll(".s-fc1");
          fcEls.forEach((item) => {
            const text = item.textContent;
            category.add(text, text);
          });
          result.data.push(category);
        });
        const firstCate = result.data[0];
        firstCate.data.splice(1, 0, { key: "排行榜", value: NetEase.TOPLIST_CODE });
        resolve(result);
      });
    });
  }

  //歌单(列表)广场
  static square(cate, offset, limit, page, order) {
    if (cate == NetEase.TOPLIST_CODE) return NetEase.toplist(cate, offset, limit, page);
    return new Promise((resolve) => {
      const url = "https://music.163.com/discover/playlist" + "?cat=" + encodeURIComponent(cate) + "&order=hot" + "&limit=" + limit + "&offset=" + offset;
      invoke("http_get_text", { url, header: NetEase.header }).then((res) => {
        const result = { platform: NetEase.CODE, cate, offset, limit, page, total: 0, data: [] };

        const doc = DOM_PARSER.parseFromString(res, "text/html");
        const listEl = doc.querySelectorAll("#m-pl-container li");
        listEl.forEach((el) => {
          let id = null,
            cover = null,
            title = null,
            itemUrl = null,
            listenNum = 0;
          const coverEl = el.querySelector(".u-cover img");
          const titleEl = el.querySelector(".dec a");
          const listenNumEl = el.querySelector(".bottom .nb");

          if (coverEl) {
            cover = coverEl.getAttribute("src").replace("140y140", "500y500");
          }

          if (titleEl) {
            title = titleEl.textContent;
            itemUrl = BASE_URL + titleEl.getAttribute("href");
            id = itemUrl.split("=")[1];
          }

          if (listenNumEl) {
            listenNum = parseInt(listenNumEl.textContent || 0);
          }

          if (id && itemUrl) {
            const playlist = new Playlist(id, NetEase.CODE, cover, title, itemUrl);
            playlist.listenNum = listenNum;
            result.data.push(playlist);
          }
        });
        const pgEls = doc.querySelectorAll("#m-pl-pager .u-page .zpgi");
        if (pgEls && pgEls.length > 0) {
          const totalEl = pgEls[pgEls.length - 1];
          if (totalEl) result.total = parseInt(totalEl.textContent);
        }
        resolve(result);
      });
    });
  }

  //歌单详情
  static playlistDetail(id, offset, limit, page) {
    // if (id.startsWith(Playlist.ANCHOR_RADIO_ID_PREFIX)) return NetEase.anchorRadioDetail(id, offset, limit, page);
    return new Promise((resolve, reject) => {
      const result = new Playlist();
      let url = "https://music.163.com/weapi/v3/playlist/detail";
      let param = playlistParam(id);
      let reqBody = weapi(param);

      invoke("http_post_text", { url, header: NetEase.header, reqBody }).then((res) => {
        const json = typeof res === "string" ? JSON.parse(res) : res;
        const playlist = json.playlist;
        result.id = playlist.id;
        result.platform = NetEase.CODE;
        result.title = playlist.name;
        result.cover = playlist.coverImgUrl;
        result.about = playlist.description;
        const ids = [];
        playlist.trackIds.forEach((track) => {
          ids.push(track.id);
        });
        result.total = ids.length;
        const end = Math.min(offset + limit, result.total);
        url = "https://music.163.com/weapi/v3/song/detail";
        param = trackIdsParam(ids.slice(offset, end));
        reqBody = weapi(param);
        invoke("http_post_text", { url, header: NetEase.header, reqBody }).then((res) => {
          const json = typeof res === "string" ? JSON.parse(res) : res;
          const songs = json.songs;
          songs.forEach((song) => {
            const artist = [];
            song.ar.forEach((e) => artist.push({ id: e.id, name: e.name }));
            const album = { id: song.al.id, name: song.al.name };
            const track = new Track(song.id, NetEase.CODE, song.name, artist, album, song.dt, song.al.picUrl);
            track.mv = song.mv;
            track.pid = id;
            result.addTrack(track);
          });
          resolve(result);
        });
      });
    });
  }

  static resolveAnchorRadio(id, track) {
    return new Promise((resolve, reject) => {
      if (id.startsWith(NetEase.RADIO_PREFIX)) id = track.songlistId;
      resolve(id);
    });
  }

  //歌曲播放详情：url、cover、lyric等
  static playDetail(id, track) {
    return new Promise((resolve, reject) => {
      NetEase.resolveAnchorRadio(id, track).then((resolvedId) => {
        const url = "https://music.163.com/weapi/song/enhance/player/url/v1?csrf_token=";
        const param = playParam(resolvedId);
        const reqBody = weapi(param);
        invoke("http_post_text", { url, header: NetEase.header, reqBody }).then((res) => {
          const json = typeof res === "string" ? JSON.parse(res) : res;
          const result = new Track(id);
          const song = json.data[0];
          result.url = song.url;
          resolve(result);
        });
      });
    });
  }
}
