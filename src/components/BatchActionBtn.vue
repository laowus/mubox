<script setup>
import SvgTextButton from "../components/SvgTextButton.vue";
const props = defineProps({
  deleteBtn: Boolean,
});
</script>

<template>
  <SvgTextButton class="batch-action-btn" text="删除所有">
    <template #left-img>
      <svg width="15" height="15" viewBox="0 0 160 125" xmlns="http://www.w3.org/2000/svg">
        <g id="Layer_2" data-name="Layer 2">
          <g id="Layer_1-2" data-name="Layer 1"><path d="M55,20h95a10,10,0,0,0,0-20H55a10,10,0,0,0,0,20ZM20,0H10a10,10,0,0,0,0,20H20A10,10,0,0,0,20,0ZM55,70h75a10,10,0,0,0,0-20H55a10,10,0,0,0,0,20ZM20,50H10a10,10,0,0,0,0,20H20a10,10,0,0,0,0-20Zm130,55H55a10,10,0,0,0,0,20h95a10,10,0,0,0,0-20ZM20,105H10a10,10,0,0,0,0,20H20a10,10,0,0,0,0-20Z" /></g>
        </g>
      </svg>
    </template>
    <template #right-img>
      <i class="iconfont icon-shanchu" v-show="deleteBtn"></i>
    </template>
  </SvgTextButton>
</template>

<style></style>
