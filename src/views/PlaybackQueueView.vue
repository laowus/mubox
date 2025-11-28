<script setup>
import { onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import PlaybackQueueItem from "../components/PlaybackQueueItem.vue";
import { usePlayStore } from "../store/playStore";
import { useAppCommonStore } from "../store/appCommonStore";
import EventBus from "../common/EventBus";

const { queueTracks, playingIndex, queueTracksSize } = storeToRefs(usePlayStore());
const { resetQueue } = usePlayStore();
const { showToast, hidePlaybackQueueView, hidePlayingView } = useAppCommonStore();

const pbqRef = ref(null),
  listRef = ref(null);

const onQueueEmpty = () => {
  showToast(
    "播放列表已被清空！",
    () => {
      hidePlaybackQueueView();
    },
    666,
  );
};

EventBus.on("playbackQueue-empty", onQueueEmpty);

const targetPlaying = () => {
  if (queueTracksSize < 1) return;
  const queueItemsWrap = document.querySelector(".playback-queue-view .center");
  const clientHeight = queueItemsWrap.clientHeight;
  const scrollHeight = queueItemsWrap.scrollHeight;
  const maxScroll = scrollHeight - clientHeight;
  queueItemsWrap.scrollTop = maxScroll * (playingIndex.value / (queueTracksSize.value - 1));
};

const clearAll = () => {
  resetQueue();
  onQueueEmpty();
};
</script>
<template>
  <div class="playback-queue-view" @click.stop="" ref="pbqRef">
    <div class="header">
      <div class="title">当前播放</div>
      <div class="detail">
        <div class="subtext">共{{ queueTracks.length }}首</div>
        <div class="action">
          <div class="target-btn text-btn" @click="targetPlaying">
            <span><i class="iconfont icon-Location"></i> 定位</span>
          </div>
          <div class="clear-btn text-btn" @click="clearAll">
            <span><i class="iconfont icon-shanchu"></i> 清空</span>
          </div>
        </div>
      </div>
    </div>
    <div class="center" ref="listRef">
      <template v-for="(item, index) in queueTracks">
        <PlaybackQueueItem :data="item" :active="playingIndex == index"> </PlaybackQueueItem>
      </template>
    </div>
  </div>
</template>

<style>
.playback-queue-view {
  display: flex;
  flex-direction: column;
  -webkit-app-region: none;
}

.playback-queue-view .header {
  padding: 20px 15px 10px 10px;
  border-bottom: 0.1px solid var(--border-color);
}

.playback-queue-view .detail {
  margin-top: 8px;
  margin-left: 3px;
  text-align: left;
  font-size: var(--text-sub-size);
  display: flex;
}

.playback-queue-view .subtext {
  color: var(--text-sub-color);
}

.playback-queue-view .action {
  display: flex;
  flex-direction: row;
  position: absolute;
  right: 18px;
}

.playback-queue-view .text-btn {
  text-align: left;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-items: center;
  cursor: pointer;
  margin-left: 20px;
}

.playback-queue-view .text-btn svg {
  margin-right: 3px;
  fill: var(--svg-color);
}

.playback-queue-view .text-btn:hover {
  color: var(--hl-color);
}

.playback-queue-view .text-btn:hover svg {
  fill: var(--hl-color);
}

/*
.playback-queue-view .text-btn span {
    display: none;
}

.playback-queue-view .target-btn:hover span,
.playback-queue-view .clear-btn:hover span {
    display: flex;
}
*/

.playback-queue-view .header .title {
  text-align: left;
  font-size: 23px;
  font-weight: bold;
  background: var(--hl-text-bg);
  -webkit-background-clip: text;
  color: transparent;
}

.playback-queue-view .center {
  flex: 1;
  overflow: scroll;
}
</style>
