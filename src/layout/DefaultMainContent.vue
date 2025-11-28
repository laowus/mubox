<script setup>
const excludes = ["LocalMusicView"];
</script>

<template>
  <div id="main-content">
    <router-view v-slot="{ Component }">
      <keep-alive :max="12" :exclude="excludes">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<style>
#main-content {
  display: flex;
  flex: 1;
  overflow: auto;
  /*margin-right: 2px;*/
}
</style>
