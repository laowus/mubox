import { defineStore } from "pinia";
import { useThemeStore } from "./themeStore";

//TODO 本地缓存导致Store State数据不一致
export const useSettingStore = defineStore("setting", {
  state: () => ({
    /* 主题 */
    theme: {
      index: 0,
      type: 0,
    },
    layout: {
      index: 0,
      fallbackIndex: 0,
    },
  }),
  getters: {
    isDefaultLayout() {
      //默认布局，目前包含2种
      const index = this.layout.index;
      return index == 0 || index == 1;
    },
    isDefaultClassicLayout() {
      const index = this.layout.index;
      return index == 1;
    },
    isSimpleLayout() {
      const index = this.layout.index;
      return index == 2;
    },
  },
  actions: {
    setThemeIndex(index, type) {
      this.theme.index = index || 0;
      this.theme.type = type || 0;
    },
    presetThemes() {
      const { getPresetThemes } = useThemeStore();
      return getPresetThemes();
    },
    getCurrentThemeId() {
      const { getTheme } = useThemeStore();
      const { type, index } = this.theme;
      return getTheme(type, index).id;
    },
  },
});
