<script setup>
const props = defineProps({
  cover: String,
  title: String,
  subtitle: String,
  playable: Boolean,
  playAction: Function,
});
</script>

<template>
  <div class="image-text-tile">
    <div class="cover-wrap">
      <img class="cover" v-lazy="cover" />
      <div class="cover-mask">
        <div class="play-btn" v-show="playable" @click.stop="playAction">
          <i class="iconfont icon-sanjiaoxing"></i>
        </div>
      </div>
    </div>
    <div class="title" v-html="title"></div>
    <div class="subtitle" v-show="subtitle" v-html="subtitle"></div>
  </div>
</template>

<style scoped>
.image-text-tile {
  margin: 15px 12px;
}

.image-text-tile .cover {
  width: 165px;
  height: 165px;
  line-height: 165px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0px 0px 3px #161616;
  background-color: var(--text-color);
}

.image-text-tile .cover-wrap:hover {
  transform: scale(1.05) translateY(-4px);
}

.image-text-tile .title {
  width: 165px;
  margin-top: 12px;
  text-align: left;
  cursor: pointer;
  line-height: 23px;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.image-text-tile .title:hover {
  background: var(--btn-bg);
  -webkit-background-clip: text;
  color: transparent;
}

.image-text-tile .subtitle {
  width: 165px;
  text-align: left;
  line-height: 25px;
  color: #989898;
  font-size: 13px;
  font-weight: 520;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.image-text-tile i {
  color: var(--svg-color);
  cursor: pointer;
  -webkit-app-region: no-drag;
}

.image-text-tile .cover-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-text-tile .cover-wrap .cover-mask {
  position: absolute;
  margin: auto;
  z-index: 2;
  visibility: hidden;
}

.image-text-tile .cover-wrap:hover .cover-mask {
  visibility: visible;
}

.image-text-tile .cover-wrap .selectable {
  visibility: visible;
  top: 10px;
  left: 10px;
  width: 25px;
  height: 25px;
  background: var(--checkbox-bg);
  border-radius: 6px;
  display: flex;
  justify-content: flex-start;
  cursor: pointer;
}

.image-text-tile .cover-mask .checkbox {
}

.image-text-tile .checkbox svg {
  fill: var(--hl-color);
}

.image-text-tile .cover-wrap .play-btn {
  border-radius: 10rem;
  width: 43px;
  height: 43px;
  background: linear-gradient(to top right, #28c83f, #1ca388);
  background: var(--btn-bg);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.image-text-tile .cover-wrap .play-btn:hover {
  background: var(--btn-hover-bg);
}

.image-text-tile .cover-wrap .play-btn i {
  margin-top: 1px;
  margin-left: 2px;
  color: var(--svg-btn-color) !important;
}
</style>
