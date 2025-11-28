import { defineStore } from "pinia";
import { usePlatformStore } from "./platformStore";

export const usePlaylistSquareStore = defineStore("playlistSquare", {
  state: () => ({
    //保存当前选中的分类项
    categoriesMap: new Map(),
    currentCategoryItem: {
      data: { key: "默认", value: "" },
      row: 0,
      col: 0,
    },
    ordersMap: new Map(),
    currentOrder: {
      key: null,
      value: null,
      index: 0,
    },
  }),
  getters: {
    currentPlatformCode(state) {
      const { currentPlatformCode } = usePlatformStore();
      return currentPlatformCode;
    },
    //获取当前平台的分类项
    currentCategoryCode(state) {
      return state.currentCategoryItem.data.value;
    },
  },
  actions: {
    putCategories(key, value) {
      this.categoriesMap.set(key, value);
    },
    putCurrentPlatformCategories(value) {
      this.putCategory(this.currentPlatformCode, value);
    },
    getCategories(key) {
      return this.categoriesMap.get(key);
    },
    currentPlatformCategories() {
      return this.getCategories(this.currentPlatformCode);
    },
    currentVender() {
      const { currentVender } = usePlatformStore();
      return currentVender();
    },
    updateCurrentCategoryItem(data, row, col) {
      this.currentCategoryItem.data = data;
      this.currentCategoryItem.row = row;
      this.currentCategoryItem.col = col;
    },
  },
});
