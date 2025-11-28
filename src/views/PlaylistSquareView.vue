<script setup>
import { storeToRefs } from "pinia";
// 导入Vue相关的响应式API和生命周期钩子
import { onMounted, reactive, ref, watch, onActivated } from "vue";
// 导入播放列表分类栏组件
import PlaylistCategoryBar from "../components/PlaylistCategoryBar.vue";
// 导入播放列表控制组件
import PlaylistsControl from "../components/PlaylistsControl.vue";
import Back2TopBtn from "../components/Back2TopBtn.vue";
// 导入事件总线，用于组件间通信
import EventBus from "../common/EventBus.js";
// 导入播放列表广场的状态管理store
import { usePlaylistSquareStore } from "../store/playlistSquareStore";

// 从store中解构出获取当前平台分类和存储分类的方法
const { currentVender, currentPlatformCategories, putCategories } = usePlaylistSquareStore();
const { currentPlatformCode, currentCategoryCode, currentOrder } = storeToRefs(usePlaylistSquareStore());

const squareContentRef = ref(null);
const back2TopBtnRef = ref(null);

// 响应式数组，用于存储全部分类数据
const categories = reactive([]);

const playlists = reactive([]);
const pagination = { offset: 0, limit: 35, page: 1 };
let markScrollTop = 0;

// 响应式引用，用于控制分类加载状态
const isLoadingCategories = ref(true);
const isLoadingContent = ref(true);

/**
 * 设置分类加载状态
 * @param {boolean} value - 加载状态值
 */
const setLoadingCategories = (value) => {
  // 更新加载状态
  isLoadingCategories.value = value;
};

const setLoadingContent = (value) => {
  isLoadingContent.value = value;
};

const resetPagination = () => {
  playlists.length = 0;
  pagination.offset = 0;
  pagination.page = 1;
};

const resetScrollState = () => {
  markScrollTop = 0;
  if (squareContentRef.value) squareContentRef.value.scrollTop = markScrollTop;
};

/**
 * 加载分类数据
 * 优先从缓存获取，如果缓存不存在则从网络获取并缓存
 */
const loadCategories = async () => {
  // 设置为加载中状态
  setLoadingCategories(true);
  // 清空现有分类数据
  categories.length = 0;

  // 尝试从store获取缓存的分类数据
  let cachedCates = currentPlatformCategories();

  // 如果缓存不存在，则从网络获取数据，并缓存到本地
  if (!cachedCates) {
    const vendor = currentVender();
    if (!vendor || !vendor.categories) return;
    const result = await vendor.categories();

    // 数据不存在则直接返回
    if (!result) return;

    // 提取返回结果中的数据部分
    cachedCates = result.data;

    // 数据部分不存在则直接返回
    if (!cachedCates) return;

    // 将获取到的分类数据缓存到store中
    putCategories(result.platform, result.data);
  }

  // 将分类数据添加到响应式数组中
  categories.push(...cachedCates);

  // 触发分类更新事件，通知子组件数据已更新
  EventBus.emit("playlistCategory-update");

  // 设置为加载完成状态
  setLoadingCategories(false);
};

// 组件挂载完成后加载分类数据
onMounted(() => {
  loadCategories();
});

const resetCommom = () => {
  resetPagination();
  resetScrollState();
  resetBack2TopBtn();
};

const loadContent = async (noLoadingMask) => {
  const vendor = currentVender();
  if (!vendor || !vendor.square) return;
  if (!noLoadingMask) setLoadingContent(true);
  //获取缓存的分类数据
  const cate = currentCategoryCode.value;
  const offset = pagination.offset;
  const limit = pagination.limit;
  const page = pagination.page;
  const order = currentOrder.value.value;

  const result = await vendor.square(cate, offset, limit, page, order);
  if (!result) return;
  if (currentPlatformCode.value != result.platform) return;
  if (currentCategoryCode.value != result.cate) return;
  playlists.push(...result.data);
  setLoadingContent(false);
};
/**
 * 刷新内容的方法
 * 当收到刷新事件时执行
 */
const refreshData = () => {
  resetCommom();
  loadContent();
};

const markScrollState = () => {
  if (squareContentRef.value) markScrollTop = squareContentRef.value.scrollTop;
};

const nextPage = () => {
  pagination.offset = pagination.page * pagination.limit;
  pagination.page = pagination.page + 1;
};

const loadMoreContent = () => {
  nextPage();
  loadContent(true);
};

const scrollToLoad = () => {
  if (isLoadingContent.value) return;
  const scrollTop = squareContentRef.value.scrollTop;
  const scrollHeight = squareContentRef.value.scrollHeight;
  const clientHeight = squareContentRef.value.clientHeight;
  markScrollState();
  const allowedError = 10; //允许误差
  if (scrollTop + clientHeight + allowedError >= scrollHeight) {
    loadMoreContent();
  }
};

const onScroll = () => {
  scrollToLoad();
};

const restoreScrollState = () => {
  EventBus.emit("imageTextTile-load");
  if (markScrollTop < 1) return;
  if (squareContentRef.value) squareContentRef.value.scrollTop = markScrollTop;
};

const resetBack2TopBtn = () => {
  if (back2TopBtnRef.value) back2TopBtnRef.value.setScrollTarget(squareContentRef.value);
};

onActivated(() => {
  restoreScrollState();
});

/* 生命周期、监听 */
watch(currentPlatformCode, (nv, ov) => {
  console.log("PlaylistSquareView watch currentPlatformCode", nv, ov);
  if (!nv) return;
  resetCommom();
  loadCategories();
});

// 监听播放列表刷新事件
EventBus.on("playlistSquare-refresh", refreshData);
</script>

<template>
  <!-- 播放列表广场视图容器 -->
  <div class="playlist-square-view" ref="squareContentRef" @scroll="onScroll">
    <PlaylistCategoryBar :data="categories" :loading="isLoadingCategories"></PlaylistCategoryBar>
    <PlaylistsControl :data="playlists" :loading="isLoadingContent"></PlaylistsControl> <Back2TopBtn ref="back2TopBtnRef"></Back2TopBtn>
  </div>
</template>

<style>
/* 播放列表广场视图样式 */
.playlist-square-view {
  padding: 25px 33px 15px 33px; /* 上下左右内边距 */
  overflow: auto; /* 内容溢出时显示滚动条 */
}
</style>
