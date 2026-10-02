<template>
  <div class="ranking-page">
    <header class="rk-hero">
      <button class="back" @click="$router.back()">
        <Icon name="back" :size="20" />
      </button>
      <h1 class="rk-hero-type">
        美食<br /><span :class="tab === 'top' ? 'stroke-acid' : 'stroke-hot'">红黑榜</span>
      </h1>
      <p class="rk-sub">贝叶斯加权评分 · 评价越多越可信</p>
      <Icon name="sparkle" :size="20" class="rk-deco floaty" />
    </header>

    <div class="rk-tabs">
      <button class="rk-tab" :class="{ on: tab === 'top' }" @click="tab = 'top'">
        <Icon name="bolt" :size="17" /> 好评封神榜
      </button>
      <button class="rk-tab" :class="{ on: tab === 'bottom' }" @click="tab = 'bottom'">
        <Icon name="flag" :size="17" /> 避雷榜
      </button>
    </div>

    <div class="rk-panel panel">
      <div
        v-for="(s, i) in list"
        :key="tab + s.id"
        class="rk-row"
        @click="$router.push(`/stall/${s.id}`)"
      >
        <span class="rk-no" :class="{ hot3: i < 3, blacklist: tab === 'bottom' }">
          {{ String(i + 1).padStart(2, '0') }}
        </span>
        <span class="rk-art">
          <FoodArt :category="s.category" icon-size="26" spark-size="8" :stroke-width="2.4" />
        </span>
        <div class="rk-info">
          <div class="rk-name">{{ s.name }}</div>
          <div class="rk-desc muted tiny">
            {{ s.category }} · {{ s.rating_count }} 评价 · ￥{{ s.avg_price }}
          </div>
        </div>
        <div class="rk-score" :class="{ blacklist: tab === 'bottom' }">
          <Icon name="starFill" :size="11" />
          {{ s.rating_avg }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { api } from '../api.js';
import Icon from '../components/Icon.vue';
import FoodArt from '../components/FoodArt.vue';

export default {
  components: { Icon, FoodArt },
  setup() {
    const tab = ref('top');
    const top = ref([]);
    const bottom = ref([]);

    onMounted(async () => {
      const [t, b] = await Promise.all([
        api('/api/stalls/ranking/top'),
        api('/api/stalls/ranking/bottom'),
      ]);
      top.value = t.stalls;
      bottom.value = b.stalls;
    });

    const list = computed(() => (tab.value === 'top' ? top.value : bottom.value));
    return { tab, list };
  },
};
</script>

<style scoped>
.ranking-page {
  padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0) + 20px);
}

/* Hero */
.rk-hero {
  position: relative;
  padding: 18px 18px 24px;
  border-bottom: 2.5px solid var(--ink);
  overflow: hidden;
}
.back {
  width: 38px;
  height: 38px;
  border: 2px solid var(--ink);
  border-radius: 4px;
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.back:active {
  background: var(--hot);
  color: #fff;
  border-color: #000;
}
.rk-hero-type {
  font-family: var(--font-en);
  line-height: 0.95;
  font-size: clamp(40px, 13vw, 64px);
}
.stroke-hot {
  color: transparent;
  -webkit-text-stroke: 1.5px var(--hot);
}
.rk-sub {
  font-size: 12px;
  color: var(--ink-2);
  margin-top: 12px;
}
.rk-deco {
  position: absolute;
  right: 24px;
  bottom: 20px;
  color: var(--cyan);
}

/* Tabs */
.rk-tabs {
  display: flex;
  gap: 11px;
  padding: 18px 16px 0;
}
.rk-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 2px solid var(--line);
  border-radius: 4px;
  background: var(--bg-2);
  color: var(--ink-2);
  padding: 11px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 13.5px;
  transition: transform 0.1s, box-shadow 0.1s, background 0.12s, color 0.12s;
}
.rk-tab.on {
  background: var(--acid);
  color: #000;
  border-color: #000;
  box-shadow: 4px 4px 0 #000;
  transform: translate(-1px, -1px);
}
.rk-tab:nth-child(2).on {
  background: var(--hot);
  color: #fff;
}

/* 行式列表 */
.rk-panel {
  margin: 16px;
  padding: 2px 14px;
}
.rk-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1.5px solid var(--line);
}
.rk-row:last-child {
  border-bottom: none;
}
.rk-no {
  font-family: var(--font-en);
  font-size: 17px;
  color: var(--ink-3);
  width: 28px;
  flex: none;
}
.rk-no.hot3 {
  color: var(--acid);
}
.rk-no.blacklist {
  color: var(--hot);
}
.rk-art {
  width: 40px;
  height: 40px;
  flex: none;
  border: 2px solid #000;
  border-radius: 3px;
  overflow: hidden;
}
.rk-info {
  flex: 1;
  min-width: 0;
}
.rk-name {
  font-size: 13.5px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rk-desc {
  margin-top: 3px;
}
.rk-score {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 12.5px;
  color: var(--acid);
}
.rk-score.blacklist {
  color: var(--hot);
}
</style>
