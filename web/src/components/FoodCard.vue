<template>
  <router-link
    class="fc"
    :to="`/stall/${stall.id}`"
    :style="{ boxShadow: `4px 4px 0 ${SHADOWS[index % SHADOWS.length]}` }"
  >
    <div class="fc-art">
      <img v-if="stall.cover" :src="stall.cover" :alt="stall.name" />
      <FoodArt v-else :category="stall.category" icon-size="44" spark-size="13" />
    </div>
    <div class="fc-body">
      <div class="fc-top">
        <span class="fc-name">{{ stall.name }}</span>
        <span class="fc-badge" :class="stall.stall_type">
          {{ stall.stall_type === 'outside' ? '校外' : '校内' }}
        </span>
      </div>
      <div class="fc-rate">
        <template v-if="stall.rating_count">
          <Icon name="starFill" :size="13" class="fc-star" />
          <b>{{ stall.rating_avg }}</b>
          <span class="muted tiny">{{ stall.rating_count }} 条</span>
        </template>
        <span v-else class="muted tiny">暂无评分</span>
      </div>
      <div class="fc-foot">
        <span class="fc-cat">{{ stall.category }}</span>
        <span class="fc-price">¥{{ stall.avg_price }}<i>/人</i></span>
      </div>
    </div>
  </router-link>
</template>

<script>
import Icon from './Icon.vue';
import FoodArt from './FoodArt.vue';

const SHADOWS = ['#ccff00', '#ff2e93', '#8061ff', '#19e0ff'];

export default {
  name: 'FoodCard',
  components: { Icon, FoodArt },
  props: {
    stall: { type: Object, required: true },
    index: { type: Number, default: 0 },
  },
  data: () => ({ SHADOWS }),
};
</script>

<style scoped>
.fc {
  display: flex;
  overflow: hidden;
  margin-bottom: 13px;
  border-radius: 4px;
  background: var(--surface);
  border: 2px solid var(--ink);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
.fc:active {
  transform: translate(4px, 4px);
  box-shadow: 0 0 0 var(--black) !important;
}
.fc-art {
  position: relative;
  width: 100px;
  flex: none;
}
.fc-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.fc-body {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.fc-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 7px;
}
.fc-name {
  font-family: var(--font-display);
  font-size: 14.5px;
  font-weight: 800;
  line-height: 1.25;
}
.fc-badge {
  flex: none;
  font-size: 9.5px;
  font-weight: 800;
  border-radius: 2px;
  padding: 2px 6px;
  border: 1.5px solid var(--black);
}
.fc-badge.inside {
  background: var(--acid);
  color: var(--black);
}
.fc-badge.outside {
  background: var(--hot);
  color: #fff;
}
.fc-rate {
  display: flex;
  align-items: center;
  gap: 5px;
}
.fc-star {
  color: var(--acid);
}
.fc-rate b {
  font-size: 13.5px;
  font-family: var(--font-display);
}
.fc-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.fc-cat {
  font-size: 10.5px;
  color: var(--ink-2);
  border: 1.5px solid var(--line);
  border-radius: 2px;
  padding: 1px 7px;
}
.fc-price {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 14px;
  color: var(--acid);
}
.fc-price i {
  font-style: normal;
  font-weight: 400;
  font-size: 9.5px;
  color: var(--ink-2);
}
</style>
