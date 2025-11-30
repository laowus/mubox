import { invoke } from "@tauri-apps/api/core";
import { Category } from "../common/Category.js";
import { Playlist } from "../common/Playlist.js";
import { Track } from "../common/Track";
import { Lyric } from "../common/Lyric";

const moduleReq = (module, method, param) => {
  return { module, method, param };
};

const topListReqBody = () => {
  return {
    _: Date.now(),
    uin: 0,
    format: "json",
    inCharset: "utf8",
    outCharset: "utf8",
    notice: 0,
    platform: "yqq.json",
    needNewCode: 1,
    g_tk: 5381,
    data: JSON.stringify({
      comm: {
        ct: 24,
        cv: 0,
      },
      req_1: moduleReq("musicToplist.ToplistInfoServer", "GetAll", {}),
    }),
  };
};

const topListDetailReqBody = (id, offset, limit, page) => {
  return {
    g_tk: 5381,
    data: JSON.stringify({
      comm: {
        ct: 24,
        cv: 0,
      },
      req_1: moduleReq("musicToplist.ToplistInfoServer", "GetDetail", {
        topid: id,
        offset,
        num: 100,
        period: getPerid(id),
      }),
    }),
  };
};

const playlistRadiosReqBody = () => {
  return {
    format: "json",
    inCharset: "utf8",
    outCharset: "utf8",
    notice: 0,
    platform: "yqq.json",
    needNewCode: 1,
    loginUin: 0,
    hostUin: 0,
    g_tk: 5381,
    data: JSON.stringify({
      comm: {
        ct: 24,
        cv: 0,
      },
      req_1: moduleReq("pf.radiosvr", "GetRadiolist", { ct: 24 }),
    }),
  };
};

const getPlaylistCover = (originUrl) => {
  if (!originUrl) return null;
  return originUrl.replace("/300?n=1", "/600?n=1");
};

const getAlbumCover = (albummid) => {
  if (!albummid) return null;
  return "https://y.qq.com/music/photo_new/T002R500x500M000" + albummid + ".jpg?max_age=2592000";
};

const getTrackTypeMeta = (typeName) => {
  return {
    m4a: {
      prefix: "C400",
      ext: ".m4a",
    },
    128: {
      prefix: "M500",
      ext: ".mp3",
    },
    320: {
      prefix: "M800",
      ext: ".mp3",
    },
    ape: {
      prefix: "A000",
      ext: ".ape",
    },
    flac: {
      prefix: "F000",
      ext: ".flac",
    },
  }[typeName];
};

const vkeyReqData = (trackInfo) => {
  //TODO
  const mediaId = trackInfo.mid;
  const songtype = [trackInfo.type];
  const filename = ["m4a"].map((typeName) => {
    const typeMeta = getTrackTypeMeta(typeName);
    return typeMeta.prefix + mediaId + mediaId + typeMeta.ext;
  });

  const guid = (Math.random() * 10000000).toFixed(0);
  const uin = "0";
  return {
    comm: {
      uin,
      format: "json",
      ct: 24,
      cv: 0,
    },
    req_1: moduleReq("vkey.GetVkeyServer", "CgiGetVkey", {
      filename,
      guid,
      songmid: [mediaId],
      songtype,
      uin,
      loginflag: 1,
      platform: "20",
    }),
  };
};

const vkeyReqBody = (trackInfo) => {
  return {
    "-": "getplaysongvkey",
    g_tk: 5381,
    loginUin: 0,
    hostUin: 0,
    format: "json",
    inCharset: "utf8",
    outCharset: "utf8",
    notice: 1,
    platform: "yqq.json",
    needNewCode: 0,
    data: JSON.stringify(vkeyReqData(trackInfo)),
  };
};

//TODO 目前部分周期计算不准确
/* 获取更新周期 */
const getPerid = (id) => {
  const date = new Date();
  const yyyy = date.getFullYear();
  let mm = date.getMonth() + 1;
  let dd = date.getDate();
  const day = date.getDay();
  mm = mm < 10 ? "0" + mm : mm;
  const d0 = dd < 10 ? "0" + dd : dd;
  let period = yyyy + "-" + mm + "-" + d0;
  let week = 1;
  //默认每天
  switch (id) {
    //每天
    case 27:
    case 62:
      break;
    //每周几?
    case 4:
    case 52:
    case 67:
      let d2 = day < 6 ? dd - day + 1 : dd;
      d2 = d2 < 10 ? "0" + d2 : d2;
      period = yyyy + "-" + mm + "-" + d2;
      break;
    //
    case 130:
      break;
    //每n周?
    case 131:
      week = getWeek(period) - 8;
      week = week < 10 ? "0" + week : week;
      period = date.getFullYear() + "_" + week;
      break;
    //每周
    default:
      week = getWeek(period) - 1;
      week = week < 10 ? "0" + week : week;
      period = date.getFullYear() + "_" + week;
      break;
  }
  return period;
};

const getWeek = (dt) => {
  let d1 = new Date(dt);
  let d2 = new Date(d1.getFullYear() + "-" + "01-01");
  let millis = d1 - d2;
  let days = Math.ceil(millis / (24 * 60 * 60 * 1000));
  let num = Math.ceil(days / 7);
  return num;
};

/**
 * QQ音乐平台相关功能类
 * 用于处理QQ音乐的分类获取和其他平台特定操作
 */
export class QQ {
  // 平台编码标识
  static CODE = "qq";
  // 默认分类ID
  static DEFAULT_CATE = 10000000;
  // 排行榜分类ID
  static TOPLIST_CODE = 99999999;
  // 电台分类ID
  static RADIO_CODE = 88888888;
  // 最新分类ID
  static NEW_CODE = 22222222;
  // 排行榜前缀
  static TOPLIST_PREFIX = "TOP_";
  // 电台缓存数据
  static RADIO_CACHE = { channel: 0, data: [] };
  static header = {
    Referer: "https://y.qq.com/",
    Origin: "https://y.qq.com",
  };

  /**
   * 获取QQ音乐分类列表
   * @returns {Promise<Object>} 返回包含分类数据的Promise对象
   */
  static categories() {
    return new Promise((resolve, reject) => {
      // 初始化返回结果对象
      const result = { platform: QQ.CODE, data: [], orders: [] };

      const url = "https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_tag_conf.fcg";
      const reqBody = {
        format: "json",
        inCharset: "utf8",
        outCharset: "utf8",
      };

      // 调用Tauri原生API获取QQ音乐分类数据
      invoke("http_get_text", { url, header: QQ.header, reqBody })
        .then((res) => {
          // 处理API返回的数据，确保是JSON对象
          const json = typeof res === "string" ? JSON.parse(res) : res;
          // 用于缓存分类名称，避免重复添加
          const cateNameCached = [];
          // 获取分类列表数据
          const list = json.data.categories;

          // 遍历处理每个一级分类
          list.forEach((cate) => {
            // 获取分类组名称
            const cateName = cate.categoryGroupName;
            // 创建新的Category实例
            const category = new Category(cateName);
            // 获取该分类下的子项
            const items = cate.items;

            // 遍历处理每个子分类项
            items.forEach((item) => {
              // 获取子分类名称
              const name = item.categoryName;
              // 获取子分类ID
              const id = item.categoryId;
              // 将子分类添加到Category实例中
              category.add(name, id);
            });

            // 防止重复添加同名分类组
            if (cateNameCached.includes(cateName)) return;
            // 将分类添加到结果集
            result.data.push(category);
            // 记录已添加的分类名称
            cateNameCached.push(cateName);
          });

          // 在第一个分类中插入特殊分类：最新、排行榜、电台
          const firstCate = result.data[0];
          // 在索引1位置插入"最新"分类
          firstCate.data.splice(1, 0, { key: "最新", value: QQ.NEW_CODE });
          // 在索引2位置插入"排行榜"分类
          firstCate.data.splice(2, 0, {
            key: "排行榜",
            value: QQ.TOPLIST_CODE,
          });
          // 在索引3位置插入"电台"分类
          firstCate.data.splice(3, 0, { key: "电台", value: QQ.RADIO_CODE });

          // 成功解析后返回结果
          resolve(result);
        })
        .catch((err) => {
          // 处理错误
          reject(err);
        });
    });
  }

  //排行榜列表
  static toplist(cate, offset, limit, page, order) {
    return new Promise((resolve, reject) => {
      let result = { platform: QQ.CODE, cate, offset: 0, limit: 100, page: 1, total: 0, data: [] };
      if (page > 1) {
        resolve(result);
        return;
      }
      const url = "https://u.y.qq.com/cgi-bin/musicu.fcg";
      const reqBody = topListReqBody();
      console.log("toplist reqBody", reqBody);
      invoke("http_get_text", { url, header: QQ.header, reqBody }).then((res) => {
        const json = typeof res === "string" ? JSON.parse(res) : res;
        const groupList = json.req_1.data.group;
        console.log("toplist groupList", groupList);
        groupList.forEach((group) => {
          group.toplist.forEach((item) => {
            const id = QQ.TOPLIST_PREFIX + item.topId;
            const cover = item.frontPicUrl || item.headPicUrl;
            const detail = new Playlist(id, QQ.CODE, cover, item.title);
            detail.about = item.intro;
            result.data.push(detail);
          });
        });
        resolve(result);
      });
    });
  }

  //排行榜详情
  static toplistDetail(id, offset, limit, page) {
    console.log("toplistDetail id", id);
    return new Promise((resolve, reject) => {
      const result = new Playlist();
      const url = "https://u.y.qq.com/cgi-bin/musicu.fcg";
      const topid = parseInt(id.replace(QQ.TOPLIST_PREFIX, ""));
      const reqBody = topListDetailReqBody(topid, offset, limit, page);
      invoke("http_get_text", { url, header: QQ.header, reqBody }).then((res) => {
        const json = typeof res === "string" ? JSON.parse(res) : res;
        const playlist = json.req_1.data.data;
        result.id = playlist.topId;
        result.platform = QQ.CODE;
        result.title = playlist.title;
        result.cover = playlist.frontPicUrl || playlist.headPicUrl;
        result.about = playlist.intro;

        const songs = json.req_1.data.songInfoList;
        songs.forEach((song) => {
          const artist = song.singer.map((ar) => ({ id: ar.mid, name: ar.name }));
          const album = { id: song.album.mid, name: song.album.name };
          const duration = song.interval * 1000;
          const cover = getAlbumCover(song.album.mid);
          const track = new Track(song.mid, QQ.CODE, song.name, artist, album, duration, cover);
          track.pid = id;
          result.addTrack(track);
        });
        resolve(result);
      });
    });
  }

  //歌单电台列表
  static playlistRadios(cate, offset, limit, page) {
    console.log("playlistRadios cate", cate);
    return new Promise((resolve, reject) => {
      const result = { platform: QQ.CODE, cate, offset, limit, page, total: 0, data: [] };
      if (page > 1) {
        resolve(result);
        return;
      }
      const url = "https://u.y.qq.com/cgi-bin/musicu.fcg";
      const reqBody = playlistRadiosReqBody();
      invoke("http_get_text", { url, header: QQ.header, reqBody }).then((res) => {
        console.log("playlistRadios res", res);
        const json = typeof res === "string" ? JSON.parse(res) : res;
        const radioList = json.req_1.data.radio_list;
        radioList.forEach((group) => {
          group.list.forEach((item) => {
            const cid = item.id;
            const title = group.title + "| " + item.title;
            const playlist = new Playlist(cid, QQ.CODE, item.pic_url, title);
            //playlist.isRadioType = true
            playlist.type = Playlist.NORMAL_RADIO_TYPE;
            result.data.push(playlist);
          });
        });
        resolve(result);
      });
    });
  }

  //歌单广场(列表)
  static square(cate, offset, limit, page) {
    console.log("square cate", cate);
    const originCate = cate || 0;
    let resolvedCate = cate;
    if (typeof resolvedCate == "string") resolvedCate = parseInt(resolvedCate.trim());
    resolvedCate = resolvedCate > 0 ? resolvedCate : QQ.DEFAULT_CATE;
    //榜单
    if (resolvedCate == QQ.TOPLIST_CODE) return QQ.toplist(cate, offset, limit, page);
    // //电台
    if (resolvedCate == QQ.RADIO_CODE) return QQ.playlistRadios(cate, offset, limit, page);
    //普通歌单
    let sortId = 5; //最热
    if (resolvedCate == QQ.NEW_CODE) {
      sortId = 2; //最新
      resolvedCate = QQ.DEFAULT_CATE;
    }
    return new Promise((resolve, reject) => {
      const result = { platform: QQ.CODE, cate: originCate, offset, limit, page, total: 0, data: [] };
      const url = "https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg";
      const reqBody = {
        format: "json",
        inCharset: "utf8",
        outCharset: "utf8",
        sortId: sortId, //5 => 最热, 2 => 最新
        categoryId: resolvedCate,
        sin: offset,
        ein: offset + limit - 1,
      };
      invoke("http_get_text", { url, header: QQ.header, reqBody }).then((res) => {
        // 处理API返回的数据，确保是JSON对象
        const json = typeof res === "string" ? JSON.parse(res) : res;
        result.total = Math.ceil(json.data.sum / limit);
        const list = json.data.list;
        list.forEach((item) => {
          const cover = item.imgurl;
          const playlist = new Playlist(item.dissid, QQ.CODE, cover, item.dissname);
          playlist.about = item.introduction;
          playlist.listenNum = item.listennum;
          result.data.push(playlist);
        });
        resolve(result);
      });
    });
  }

  //歌单详情
  static playlistDetail(id, offset, limit, page) {
    if (id.startsWith(QQ.TOPLIST_PREFIX)) {
      return QQ.toplistDetail(id, offset, limit, page);
    }
    return new Promise((resolve, reject) => {
      const result = new Playlist();
      const url = "http://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg";
      const reqBody = {
        format: "json",
        type: 1,
        utf8: 1,
        disstid: id, // 歌单的id
        loginUin: 0,
      };
      invoke("http_get_text", { url, header: QQ.header, reqBody }).then((res) => {
        console.log(res);
        const json = typeof res === "string" ? JSON.parse(res) : res;
        const playlist = json.cdlist[0];
        result.id = id;
        result.dissid = playlist.dissid;
        result.platform = QQ.CODE;
        result.title = playlist.dissname;
        result.cover = getPlaylistCover(playlist.logo);
        result.about = playlist.desc;
        const songs = playlist.songlist;
        songs.forEach((song) => {
          const artist = song.singer.map((e) => ({ id: e.mid, name: e.name }));
          const album = { id: song.albummid, name: song.albumname };
          const duration = song.interval * 1000;
          const cover = getAlbumCover(song.albummid);
          const track = new Track(song.songmid, QQ.CODE, song.songname, artist, album, duration, cover);
          track.mv = song.vid;
          track.pid = id;
          track.payPlay = song.pay.payplay == 1;
          track.payDownload = song.pay.paydownload == 1;
          result.addTrack(track);
        });
        resolve(result);
      });
    });
  }

  //歌曲播放详情：url、cover、lyric等
  static playDetail(id, track) {
    return new Promise((resolve, reject) => {
      let url = "http://u.y.qq.com/cgi-bin/musicu.fcg";
      const reqBody = {
        format: "json",
        data: JSON.stringify({
          songinfo: moduleReq("music.pf_song_detail_svr", "get_song_detail_yqq", {
            song_mid: id,
          }),
        }),
      };
      invoke("http_get_text", { url, header: QQ.header, reqBody }).then((res) => {
        const json = typeof res === "string" ? JSON.parse(res) : res;
        const trackInfo = json.songinfo.data.track_info;
        QQ.getVKeyJson(trackInfo).then((json) => {
          const data = json.req_1.data;
          const urlInfo = data.midurlinfo[0];
          const vkey = urlInfo.vkey.trim();
          const result = new Track(id, QQ.CODE);
          if (vkey.length > 0) {
            result.url = data.sip[0] + urlInfo.purl;
          }
          resolve(result);
        });
      });
    });
  }

  //获取VKey、purl和sip服务器等信息
  static getVKeyJson(trackInfo) {
    return new Promise((resolve, reject) => {
      let url = "https://u.y.qq.com/cgi-bin/musicu.fcg";
      const reqBody = vkeyReqBody(trackInfo);
      invoke("http_get_text", { url, header: QQ.header, reqBody }).then((res) => {
        const json = typeof res === "string" ? JSON.parse(res) : res;
        resolve(json);
      });
    });
  }
}
