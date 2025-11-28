<script setup>
// 导入所需的依赖
import { storeToRefs } from "pinia"; // Pinia状态管理中的storeToRefs函数，用于解构store中的响应式属性
import { reactive } from "vue"; // Vue的响应式API
import EventBus from "../common/EventBus.js"; // 事件总线，用于组件间通信
import { usePlaylistSquareStore } from "../store/playlistSquareStore"; // 导入播放列表广场的状态管理
import CategoryBarLoadingMask from "./CategoryBarLoadingMask.vue";

// 从store中解构出当前选中的分类项（响应式）
const { currentCategoryItem } = storeToRefs(usePlaylistSquareStore());
// 从store中解构出更新当前分类项的方法
const { updateCurrentCategoryItem } = usePlaylistSquareStore();

// 定义组件的props
const props = defineProps({
  data: Array, // 分类数据数组
  loading: Boolean, // 加载状态
});

/**
 * 判断当前分类项是否与之前选中的分类项不同
 * @param {Object} item - 当前分类项
 * @param {number} row - 当前分类项的行索引
 * @param {number} col - 当前分类项的列索引
 * @returns {boolean} - 是否为不同的分类
 */
const isDiffCate = (item, row, col) => {
  const prevCate = currentCategoryItem.value;
  return prevCate ? prevCate.data.value != item.value || prevCate.row != row || prevCate.col != col : true;
};

/**
 * 访问分类项，更新选中状态并触发刷新
 * @param {Object} item - 要访问的分类项
 * @param {number} row - 分类项的行索引
 * @param {number} col - 分类项的列索引
 * @param {boolean} forceRefresh - 是否强制刷新
 */
const visitCateItem = (item, row, col, forceRefresh) => {
  // 判断是否需要刷新：不同分类或强制刷新
  const needRefresh = isDiffCate(item, row, col) || forceRefresh;
  // 更新当前选中的分类项
  updateCurrentCategoryItem(item, row, col);
  // 如果需要刷新，触发刷新事件
  if (needRefresh) {
    EventBus.emit("playlistSquare-refresh");
  }
};

// 响应式的扁平化数据数组，用于存储处理后的一维分类数据
const flatData = reactive([]);

/**
 * 获取扁平化的分类数据
 * 将二维分类数据转换为一维数组，并为每个分类项添加行列索引
 * @returns {Array} - 扁平化后的分类数据数组
 */
const getFlatData = () => {
  // 避免重复计算，仅在flatData为空时处理数据
  if (flatData.length <= 0) {
    // 记录源数组原始坐标 这里添加了row和col属性
    props.data.forEach((cate, row) => {
      cate.data.forEach((item, col) => {
        // 为每个分类项添加行列索引信息
        item.row = row;
        item.col = col;
        // 添加到扁平化数组中
        flatData.push(item);
      });
    });
  }

  return flatData;
};

/**
 * 加载第一个分类数据
 * 作为默认选中项并触发数据加载
 */
const loadFirstCateData = () => {
  // 获取扁平化数据
  const flatData = getFlatData();
  // 数据为空时直接返回
  if (!flatData || flatData.length < 1) return;
  // 获取第一个分类项
  const firstItem = flatData[0];
  // 访问第一个分类项，强制刷新
  visitCateItem(firstItem, firstItem.row, firstItem.col, true);
};

/**
 * 监听父组件的数据更新事件
 * 当分类数据更新时，清空现有数据并重新加载第一个分类
 */
EventBus.on("playlistCategory-update", () => {
  console.log("playlistCategory-update");
  // 清空扁平化数据数组
  flatData.length = 0;
  // 重新加载第一个分类
  loadFirstCateData();
});
</script>

<template>
  <div class="playlist-category-bar">
    <!-- 仅在非加载状态下显示分类内容 -->
    <div v-show="!loading">
      <!-- 遍历扁平化后的分类数据 -->
      <i class="iconfont icon-quanbu"></i>
      <template v-for="item in getFlatData()" v-show="data.length > 0">
        <!-- 使用v-html渲染分类项的key属性 -->
        <span
          @click="visitCateItem(item, item.row, item.col)"
          :class="{
            active: item.row == currentCategoryItem.row && item.col == currentCategoryItem.col,
          }"
          v-html="item.key"
        >
        </span>
      </template>
    </div>
    <CategoryBarLoadingMask :count="16" v-show="loading"></CategoryBarLoadingMask>
  </div>
</template>

<style scoped>
/* 分类栏容器样式 */
.playlist-category-bar {
  margin-left: 10px;
  height: 36px;
  overflow: hidden;
  text-align: left;
}

/* 分类项样式 */
.playlist-category-bar span {
  padding: 6px 15px;
  margin-right: 8px;
  vertical-align: middle;
  text-align: center;
  line-height: 36px;
  font-size: var(--text-size);
  cursor: pointer;
  white-space: nowrap;
  border-radius: 10rem;
  color: var(--text-color);
}

/* 分类项悬停效果 */
.playlist-category-bar span:hover {
  background: var(--list-item-hover);
  color: var(--text-color);
}

/* SVG图标的基本样式 */
.playlist-category-bar i {
  color: var(--svg-color);
  margin-right: 15px;
  cursor: pointer;
  transform: translateY(3px);
}

/* SVG图标悬停效果 */
.playlist-category-bar i:hover {
  color: var(--hl-color);
}

/* 激活状态的分类项样式 */
.playlist-category-bar .active {
  border-color: var(--hl-color);
  border-color: transparent;
  background: var(--btn-bg) !important;
  color: var(--svg-btn-color) !important;
}
</style>
