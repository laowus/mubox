import { invoke } from "@tauri-apps/api/core";
import { Category } from "../common/Category";
import { Playlist } from "../common/Playlist";
import { Track } from "../common/Track";
import { Lyric } from "../common/Lyric";
import CryptoJS from "crypto-js";

const REQ_ID = "e2db8a61-afdb-11ec-9d7b-c9324a8678ec";

const COOKIES = {
  kg_mid: "b1ce9c8ff7a5081551d9fe09a396d9c1",
  kg_dfid: "11TXg30ah9CE2JoRol2OeAmD",
  kg_dfid_collect: "d41d8cd98f00b204e9800998ecf8427",
};

const signParam = (param) => {
  const md5Key = "NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt";
  param = param.split("&").sort().join("");
  return md5Key + param + md5Key;
};

const getSignature = (param) => {
  return CryptoJS.MD5(signParam(param)).toString().toUpperCase();
};

const getDataUrl = (hash, albumId) => {
  return "https://wwwapi.kugou.com/yy/index.php?r=play/getdata" + "&hash=" + hash + "&dfid=" + COOKIES.kg_dfid + "&appid=1014" + "&mid=" + COOKIES.kg_mid + "&platid=4" + "&album_id=" + albumId + "&_=";
};

const getCustomCover = (origin) => {
  if (!origin) return origin;
  //http://c1.kgimg.com/custom/150/20201207/20201207134716994336.jpg
  //https://imge.kugou.com/temppic/20130807/20130807185439172736.png
  //https://imge.kugou.com/stdmusic/20180712/20180712154305100613.jpg
  const keys = ["/custom/150/", "/temppic/", "/{size}", "/stdmusic/"];
  const size = "480";
  if (origin.includes(keys[0])) {
    return "https://imgessl.kugou.com/custom/" + size + "/" + origin.split(keys[0])[1];
  } else if (origin.includes(keys[1])) {
    return "https://imgessl.kugou.com/custom/" + size + "/" + origin.split(keys[1])[1];
  } else if (origin.includes(keys[2])) {
    return origin.replace(keys[2], "/" + size);
  } else if (origin.includes(keys[3])) {
    return "https://imge.kugou.com/stdmusic/" + size + "/" + origin.split(keys[3])[1];
  }
  return origin;
};

const jsonify = (text) => {
  //text = text ? text.trim() : ''
  text = text
    .replace(/\/\/ \S*/g, "") //注释
    .replace(/\s/g, "") //空白符
    .replace(/'/g, '"')
    .replace("{", '{"')
    .replace("}", '"}')
    .replace(/,/g, '","')
    .replace(/:/g, '":"')
    .replace(/""/g, '"')
    .replace('https":"', "https:");
  return JSON.parse(text);
};

const DOM_PARSER = new DOMParser();
//客户端API
export class KuGou {
  static CODE = "kugou";
  static TOPLIST_CODE = "0-0-0";
  static RADIO_CODE = "f-m-0";
  static TOPLIST_PREFIX = "TOP_";
  static RADIO_CACHE = { channel: 0, data: [], page: 1 };
  static header = {
    Referer: "https://www.kugou.com/",
    Origin: "https://www.kugou.com/",
  };

  //全部歌单分类
  static categories() {
    return new Promise((resolve, reject) => {
      const result = { platform: KuGou.CODE, data: [], orders: [] };
      const url = "http://mac.kugou.com/v2/musicol/yueku/v1/special/index/getData/getData.html&cdn=cdn&t=5&c=";

      invoke("http_get_text", { url, header: KuGou.header }).then((res) => {
        const doc = DOM_PARSER.parseFromString(res, "text/html");
        const menulist = doc.querySelectorAll(".pc_specail_menu") || doc.querySelectorAll(".pc_special_menu");
        menulist.forEach((menu) => {
          const cateName = menu.querySelector("h3").textContent;
          const category = new Category(cateName);
          const list = menu.querySelectorAll(".pc_specail_menu_content a") || menu.querySelectorAll(".pc_special_menu_content a");
          list.forEach((item) => {
            const name = item.textContent;
            const value = item.getAttribute("href").split("&c=")[1].split("'")[0];
            category.add(name, value);
          });
          result.data.push(category);
        });
        result.data[0].add("榜单", KuGou.TOPLIST_CODE).add("电台", KuGou.RADIO_CODE);

        result.orders.push(
          ...[
            { key: "推荐", value: "5" },
            { key: "最热", value: "6" },
            { key: "最新", value: "7" },
            { key: "热藏", value: "3" },
            { key: "飙升", value: "8" },
          ],
        );
        resolve(result);
      });
    });
  }

  //歌单(列表)广场
  static square(cate, offset, limit, page, order) {
    const originCate = cate;
    let resolvedCate = (cate || "").toString().trim();
    order = order || 5;
    //普通歌单
    return new Promise((resolve, reject) => {
      const result = { platform: KuGou.CODE, cate: originCate, order, offset, limit, page, total: 0, data: [] };
      const url = "http://mac.kugou.com/v2/musicol/yueku/v1/special/index/getData/getData.html&cdn=cdn&p=" + page + "&pagesize=20&t=" + order + "&c=" + resolvedCate;
      invoke("http_get_text", { url, header: KuGou.header }).then((res) => {
        const doc = DOM_PARSER.parseFromString(res, "text/html");
        let key = "global.special =";
        const scripts = doc.getElementsByTagName("script");
        let scriptText = null;
        for (var i = 0; i < scripts.length; i++) {
          const scriptCon = scripts[i].innerHTML;
          if (scriptCon && scriptCon.includes(key)) {
            scriptText = scriptCon;
            break;
          }
        }
        if (scriptText) {
          const globalData = Function(scriptText + " return global")();
          result.total = Math.ceil(parseInt(globalData.total) / limit);

          const list = globalData.special;
          list.forEach((item) => {
            const id = item.specialid;
            const cover = getCustomCover(item.img);
            const title = item.specialname;
            const about = item.intro;
            const playlist = new Playlist(id, KuGou.CODE, cover, title, null, about);
            result.data.push(playlist);
          });
        }
        resolve(result);
      });
    });
  }

  //歌单详情
  static playlistDetail(id, offset, limit, page) {
    id = (id + "").trim();
    if (id.startsWith(KuGou.TOPLIST_PREFIX)) return KuGou.toplistDetail(id, offset, limit, page);
    return new Promise((resolve, reject) => {
      const url = "https://www.kugou.com/yy/special/single/" + id + ".html";

      invoke("http_get_text", { url, header: KuGou.header }).then((res) => {
        const doc = DOM_PARSER.parseFromString(res, "text/html");
        let cover = doc.querySelector(".specialPage .pic img").getAttribute("_src");
        cover = getCustomCover(cover);
        const title = doc.querySelector(".specialPage .pic img").getAttribute("alt");
        const about = doc.querySelector(".specialPage .more_intro").textContent;

        const result = new Playlist(id, KuGou.CODE, cover, title, null, about);
        //Tracks
        let key = "var data=";
        const scripts = doc.head.getElementsByTagName("script");
        let scriptText = null;
        for (var i = 0; i < scripts.length; i++) {
          const scriptCon = scripts[i].innerHTML;
          if (scriptCon && scriptCon.includes(key)) {
            scriptText = scriptCon;
            break;
          }
        }
        if (scriptText) {
          const json = Function(scriptText + " return data")();

          json.forEach((item) => {
            const artist = [];
            const album = { id: item.album_id, name: item.album_name };
            const duration = item.duration;
            let trackCover = null;
            const authors = item.authors;
            if (authors && authors.length > 0) {
              trackCover = getCustomCover(authors[0].sizable_avatar);
              const arData = authors.map((ar) => ({
                id: ar.author_id,
                name: ar.author_name,
              }));
              artist.push(...arData);
            }
            const track = new Track(item.audio_id, KuGou.CODE, item.songname, artist, album, duration, trackCover);
            track.hash = item.hash;
            track.pid = id;
            track.payPlay = item.vip != 0;
            result.addTrack(track);
          });
        }
        resolve(result);
      });
    });
  }

  //歌曲播放详情：url、cover、lyric等
  static playDetail(id, track) {
    return new Promise((resolve, reject) => {
      const url = getDataUrl(track.hash, track.album.id);
      invoke("http_get_text", { url, header: KuGou.header }).then((res) => {
        const json = JSON.parse(res);
        const result = new Track(id, KuGou.CODE);
        result.url = json.data.play_url;
        result.cover = json.data.img;
        const lyricText = json.data.lyrics;
        result.lyric = Lyric.parseFromText(lyricText);
        if (json.data.authors) {
          result.artist = json.data.authors.map((ar) => ({ id: ar.author_id, name: ar.author_name }));
        }
        resolve(result);
      });
    });
  }
}
