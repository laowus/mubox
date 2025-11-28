<script setup>
import { inject, ref } from "vue";

const { visitSearch } = inject("appRoute");

const keywordRef = ref(null);
const hasText = ref(false);

const visitSearchView = () => {
  const kwInputEl = keywordRef.value;
  const keyword = kwInputEl.value.trim();
  if (keyword.length > 0) visitSearch(keyword);
};

const toggleClearBtn = () => {
  const data = keywordRef.value.value;
  hasText.value = data && data.length > 0;
};

const clear = () => {
  keywordRef.value.value = "";
  hasText.value = false;
};
</script>

<template>
  <div class="search-bar" @keydown.enter="visitSearchView" @keydown.stop="">
    <div class="search-btn" @click="visitSearchView">
      <i class="iconfont icon-search"></i>
    </div>
    <input type="text" class="keyword" placeholder="现在想听点什么~" ref="keywordRef" @input="toggleClearBtn" />
    <div class="clear-btn">
      <i class="iconfont icon-guanbi1"></i>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  height: 28px;
  -webkit-app-region: none;
}

.search-bar .search-btn,
.search-bar .keyword,
.search-bar .clear-btn {
  border: 1px solid var(--searchbar-border-color);
  height: 28px;
}

.search-bar .search-btn {
  border-radius: 10rem 0 0 10rem;
  border-right: 0px;
  width: 28px;
  background: var(--search-btn-bg);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.search-bar .search-btn:hover {
  background: var(--search-btn-hover-bg);
}

.search-bar .search-btn svg {
  /* margin-top: 7px; 
    margin-left: 3px;
    */
  margin-top: 1px;
  margin-left: 3px;
  fill: var(--search-btn-svg-color);
}

.search-bar .search-btn:hover svg {
  fill: var(--search-btn-hover-svg-color);
}

.search-bar .keyword {
  font-size: 15px;
  padding-left: 5px;
  padding-right: 6px;
  outline: 0;
  width: 115px;
  border-left: 0px;
  border-right: 0px;
  background: var(--searchbar-bg);
  color: var(--searchbar-text-color);
}

.search-bar .clear-btn {
  border-radius: 0 10rem 10rem 0;
  width: 18px;
  border-left: 0px;
  background: var(--searchbar-bg);
}

.search-bar .clear-btn svg {
  margin-top: 9.5px;
  margin-right: 5px;
  fill: #666;
  visibility: visible;
  cursor: pointer;
}

.search-bar .keyword::-webkit-input-placeholder {
  /* color: var(--searchbar-placeholder-color); */
}
</style>
