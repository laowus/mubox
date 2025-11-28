<script setup>
import { inject } from "vue";

const { backward, forward } = inject("appRoute");
</script>

<template>
  <div class="navigator">
    <i class="iconfont icon-shangyige" @click="backward"></i>
    <i class="iconfont icon-xiayige" @click="forward"></i>
  </div>
</template>

<style scoped>
.navigator {
  display: flex;
  align-items: center;
}

.navigator i {
  color: var(--svg-color);
  cursor: pointer;
  margin-right: 10px;
  -webkit-app-region: none;
}

.navigator i:hover {
  color: #28c83f;
  color: var(--hl-color);
}
</style>
