<script setup>
import { onActivated, onMounted, ref, shallowRef, watch } from "vue";

const { platforms, tabs, activeTab, currentPlatformIndex, tabTipText } = storeToRefs(useSearchStore());

const props = defineProps({
  keyword: String,
});

onActivated(() => visitTab(0));
</script>

<template>
  <div id="search-view">
    <div class="header">
      <div class="keyword">
        <b>搜 </b><span class="text">{{ keyword }}</span>
      </div>
    </div>
  </div>
</template>

<style>
#search-view {
  display: flex;
  flex-direction: column;
  padding: 20px 33px 15px 33px;
  overflow: scroll;
  flex: 1;
}

#search-view .header {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

#search-view .keyword {
  text-align: left;
  display: flex;
  font-size: 28px;
  font-weight: bold;
  line-height: 36px;
}

#search-view .keyword b {
  margin-right: 12px;
}

#search-view .keyword .text {
  background: var(--hl-text-bg);
  background: var(--hl-color);
  -webkit-background-clip: text;
  color: transparent;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

#search-view .platform {
  margin-top: 20px;
  margin-bottom: 6px;
  text-align: left;
}

#search-view .platform .item {
  margin-right: 20px;
  border-radius: 10rem;
  padding: 6px 15px;
  /* border: 1px solid var(--border-color); */
  cursor: pointer;
}

#search-view .platform .item:hover {
  color: var(--text-color);
  background: var(--list-item-hover);
}

#search-view .platform .active {
  border-color: var(--hl-color);
  /* background: var(--hl-text-bg) !important;
    color: var(--svg-btn-color) !important; */
  background: var(--btn-bg) !important;
  color: var(--svg-btn-color) !important;
}

#search-view .tab-nav {
  display: flex;
  position: relative;
  height: 30px;
  margin-bottom: 3px;
  border-bottom: 1px solid var(--border-color);
}

#search-view .tab {
  font-size: 16px;
  padding-left: 6px;
  padding-right: 6px;
  margin-right: 15px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

#search-view .tab-nav .active {
  border-color: var(--hl-color);
}

#search-view .tab-nav .tip {
  font-size: 15px;
  position: absolute;
  right: 10px;

  /*background: var(--hl-text-bg);*/
  background: var(--btn-bg);
  background: var(--hl-color);
  -webkit-background-clip: text;
  color: transparent;
}
</style>
