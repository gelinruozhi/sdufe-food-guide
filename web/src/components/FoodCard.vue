<template>
  <router-link class="fc press card" :to="`/stall/${stall.id}`">
    <div class="fc-cover" :style="!stall.cover ? { background: meta.gradient } : null">
      <img v-if="stall.cover" :src="stall.cover" :alt="stall.name" />
      <span v-else class="fc-emoji float">{{ meta.emoji }}</span>
      <span v-if="stall.stall_type === 'outside'" class="fc-sticker">校外</span>
      <span v-else class="fc-sticker fc-sticker-in">校内</span>
    </div>
    <div class="fc-body">
      <div class="fc-name">{{ stall.name }}</div>
      <div class="fc-rate">
        <template v-if="stall.rating_count">
          <span class="fc-star">★</span>
          <b>{{ stall.rating_avg }}</b>
          <span class="muted tiny">{{ stall.rating_count }} 条评价</span>
        </template>
        <span v-else class="muted tiny">暂无评分，等你来评</span>
      </div>
      <div class="fc-foot">
        <span class="chip">{{ stall.category }}</span>
        <span class="fc-price">¥{{ stall.avg_price }}<i>/人</i></span>
      </div>
    </div>
  </router-link>
</template>

<script>
import { computed } from 'vue';
import { foodMeta } from '../lib/foodMeta.js';

export default {
  props: { stall: { type: Object, required: true } },
  setup(props) {
    const meta = computed(() => foodMeta(props.stall.category));
    return { meta };
  },
};
</script>

<style scoped>
.fc {
  display: flex;
  align-items: stretch;
  overflow: hidden;
  margin-bottom: 12px;
  border-radius: var(--r-md);
}
.fc-cover {
  position: relative;
  width: 108px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.fc-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.fc-emoji {
  font-size: 46px;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.15));
}
.fc-sticker {
  position: absolute;
  top: 8px;
  left: -6px;
  background: var(--yellow);
  color: #5a3a00;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 9px 2px 7px;
  border-radius: 0 6px 6px 0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  transform: rotate(-4deg);
}
.fc-sticker-in {
  background: #fff;
  color: var(--primary-deep);
}
.fc-body {
  flex: 1;
  min-width: 0;
  padding: 11px 13px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.fc-name {
  font-size: 15.5px;
  font-weight: 900;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fc-rate {
  display: flex;
  align-items: center;
  gap: 5px;
}
.fc-star {
  color: var(--yellow-deep);
  font-size: 14px;
}
.fc-rate b {
  font-size: 14px;
}
.fc-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.fc-price {
  color: var(--primary-deep);
  font-weight: 900;
  font-size: 15px;
}
.fc-price i {
  font-style: normal;
  font-weight: 600;
  font-size: 10.5px;
  color: var(--ink-2);
}
</style>
