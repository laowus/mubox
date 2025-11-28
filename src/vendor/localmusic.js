const FILE_PREFIX = "file:///";

export class LocalMusic {
  static CODE = "local";

  //歌曲详情
  static playDetail(id, track) {
    return new Promise((resolve, reject) => {
      let url = track.url;
      // if (!url.includes(FILE_PREFIX)) {
      //   track.url = FILE_PREFIX + url;
      // }
      resolve(track);
    });
  }
}
