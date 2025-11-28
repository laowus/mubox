<script setup>
import { inject } from "vue";

const { visitArtist } = inject("appRoute");

const props = defineProps({
  visitable: Boolean,
  platform: String,
  data: Array,
  trackId: String,
});
</script>
<template>
  <div class="artist-ctl" v-show="data && data.length > 0">
    <template v-for="(item, index) in data">
      <span class="artist-item" :class="{ visitable: visitable }" v-html="item.name"> </span>
      <template v-if="index < data.length - 1">、</template>
    </template>
  </div>
</template>

<style scoped>
.artist-ctl {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  /* -webkit-app-region: none; */
  text-align: left;
}

.artist-ctl .visitable {
  cursor: pointer;
}

.artist-ctl .visitable:hover {
  background: var(--hl-text-bg);
  -webkit-background-clip: text;
  color: transparent;
}
</style>
