import { defineStore } from "pinia";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { join, appDataDir } from "@tauri-apps/api/path";
import { readDir } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import { Track } from "../common/Track";
import CryptoJS from "crypto-js";

export const useLocalMusicStore = defineStore("localMusic", {
  state: () => ({
    localDirs: [],
    localTracks: [],
    isLoading: false,
  }),
  getters: {
    getLocalSongs() {
      return this.localTracks;
    },
  },
  actions: {
    async addFolders() {
      this.isLoading = true;
      const selected = await openDialog({
        title: "选择音乐文件夹",
        multiple: false,
        directory: true,
      });

      if (!selected) {
        this.isLoading = false;
        return;
      }

      try {
        if (!this.localDirs.includes(selected)) {
          this.localDirs.push(selected);
        }
        await this.scanAudioFiles(selected);
      } catch (error) {
        console.error("扫描音频文件失败:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async getAudioMetadata(fullPath) {
      try {
        return await invoke("get_audio_metadata", { fullPath: fullPath });
      } catch (error) {
        console.error(`获取音频元数据失败: ${error}`);
        return null;
      }
    },
    async scanAudioFiles(directory) {
      try {
        const entries = await readDir(directory, { recursive: true });
        const audioExtensions = ["mp3", "wav", "flac", "aac", "m4a"];
        for (const entry of entries) {
          const fullPath = await join(directory, entry.name);
          if (entry.isDirectory) {
            await this.scanAudioFiles(fullPath);
          } else if (entry.isFile) {
            const fileName = entry.name;
            const fileExt = fileName.split(".").pop()?.toLowerCase();
            if (fileExt && audioExtensions.includes(fileExt)) {
              const metadata = await this.getAudioMetadata(fullPath);
              if (metadata) {
                console.log("metadata", metadata);
                const hash = CryptoJS.MD5(metadata.title + metadata.duration).toString();
                const coverData = metadata.cover_data ? `data:${metadata.cover_mime_type};base64,${metadata.cover_data}` : "default_cover.png";

                const artistObj = metadata.artist && metadata.artist !== "未知艺术家" ? [{ id: "", name: metadata.artist }] : [];

                // 处理专辑格式 - 将字符串转换为对象
                const albumObj = metadata.album && metadata.album !== "未知专辑" ? { id: "", name: metadata.album } : { id: "", name: "" };

                const track = new Track(hash, "local", metadata.title !== "未知标题" ? metadata.title : fileName, artistObj, albumObj, metadata.duration, coverData, fullPath);
                console.log("track", track);

                if (!this.localTracks.some((t) => t.id === track.id)) {
                  this.localTracks.push(track);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`扫描目录 ${directory} 失败:`, error);
      }
    },
    async addFiles() {},
    removeItem(index) {},
    resetAll() {
      this.localDirs.length = 0;
      this.localTracks.length = 0;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ["localDirs", "localTracks"],
      },
    ],
  },
});
