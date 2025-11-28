<script setup>
import { storeToRefs } from "pinia";
import { onMounted, shallowRef } from "vue";
import Themes from "./Themes.vue";
import { useSettingStore } from "./store/settingStore.js";
import DefaultLayout from "./layout/DefaultLayout.vue";
import SimpleLayout from "./layout/SimpleLayout.vue";

const { isSimpleLayout } = storeToRefs(useSettingStore());
const currentAppLayout = shallowRef(null);

const setupLayout = () => {
  if (isSimpleLayout.value) {
    currentAppLayout.value = SimpleLayout;
  } else {
    currentAppLayout.value = DefaultLayout;
  }
};

onMounted(() => {
  setupLayout();
});
</script>
<template>
  <Themes>
    <keep-alive :max="2">
      <component :is="currentAppLayout"> </component>
    </keep-alive>
    <slot></slot>
  </Themes>
</template>

<style></style>
