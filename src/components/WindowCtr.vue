<script setup>
import { getCurrentWindow } from "@tauri-apps/api/window";

// 窗口控制函数
const minimizeApp = async () => {
  try {
    const window = getCurrentWindow();
    await window.minimize();
  } catch (error) {
    console.error("最小化失败:", error);
  }
};

const maximizeApp = async () => {
  try {
    const window = getCurrentWindow();
    const isMaximized = await window.isMaximized();
    if (isMaximized) {
      await window.unmaximize();
    } else {
      await window.maximize();
    }
  } catch (error) {
    console.error("最大化失败:", error);
  }
};

const closeApp = async () => {
  try {
    const window = getCurrentWindow();
    await window.close();
  } catch (error) {
    console.error("关闭失败:", error);
  }
};
</script>

<template>
  <div class="tool">
    <i class="iconfont icon-zuixiaohua" @click="minimizeApp"></i>
    <i class="iconfont icon-zuidahua" @click="maximizeApp"></i>
    <i class="iconfont icon-guanbi1" @click="closeApp"></i>
  </div>
</template>

<style scoped>
.tool {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-right: 20px;
  padding-left: 20px;
  gap: 10px;
}
.tool i {
  font-size: 16px;
  padding: 5px;
  color: var(--svg-color);
  cursor: pointer !important; /* 增加!important确保优先级 */
  -webkit-app-region: no-drag; /* 添加这个属性，确保在Tauri窗口中可以正常拖拽 */
}

.tool i:hover {
  color: #28c83f;
  color: var(--hl-color);
}
</style>
