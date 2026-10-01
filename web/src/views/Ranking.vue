<template>
  <div class="ranking-page">
    <header class="rk-hero">
      <button class="back press" @click="$router.back()">‹</button>
      <h1 class="rk-title display-title">山财美食<br />红黑榜</h1>
      <p class="rk-sub">按贝叶斯加权评分排序，评价越多越可信</p>
    </header>

    <div class="rk-tabs">
      <button
        class="rk-tab press"
        :class="{ on: tab === 'top' }"
        @click="tab = 'top'"
      >
        🏆 好评红榜
      </button>
      <button
        class="rk-tab press"
        :class="{ on: tab === 'bottom' }"
        @click="tab = 'bottom'"
      >
        💣 避雷黑榜
      </button>
    </div>

    <div class="rk-list">
      <div
        v-for="(s, i) in list"
        :key="tab + s.id"
        class="rk-row press"
        v-rise="i * 45"
        @click="$router.push(`/stall/${s.id}`)"
      >
        <span class="rk-no" :class="{ top3: i < 3, bottom: tab === 'bottom' }">
          {{ i + 1 }}
        </span>
        <span class="rk-emoji" :style="{ background: foodMeta(s.category).gradient }">
          {{ foodMeta(s.category).emoji }}
        </span>
        <div class="rk-info">
          <div class="rk-name">{{ s.name }}</div>
          <div class="rk-desc muted tiny">
            {{ s.category }} · {{ s.rating_count }} 评价 · ¥{{ s.avg_price }}/人
          </div>
        </div>
        <div class="rk-score" :class="{ bottom: tab === 'bottom' }">
          <span class="rs-star">★</span>{{ s.rating_avg }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { api } from '../api.js';
import { foodMeta } from '../lib/foodMeta.js';

export default {
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
    return { tab, list, foodMeta };
  },
};
</script>

<style scoped>
.rk-hero {
  position: relative;
  background: linear-gradient(160deg, #ff6a45, #d8330f);
  color: #fff;
  padding: 22px 20px 28px;
  border-radius: 0 0 30px 30px;
}
.back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 3px;
}
.rk-title { font-size: 34px; margin: 14px 0 8px; color: #fff; }
.rk-sub { font-size: 12px; margin: 0; opacity: 0.8; }

.rk-tabs { display: flex; gap: 10px; padding: 18px 16px 6px; }
.rk-tab {
  flex: 1;
  background: #fff;
  border-radius: var(--r-md);
  box-shadow: var(--shadow-card);
  padding: 12px;
  font-size: 14px;
  font-weight: 800;
  color: var(--ink-2);
}
.rk-tab.on {
  background: linear-gradient(135deg, #ff6a45, var(--primary-deep));
  color: #fff;
  box-shadow: var(--shadow-primary);
}

.rk-list { padding: 12px 16px 30px; }
.rk-row {
  display: flex;
  align-items: center;
  gap: 11px;
  background: #fff;
  border-radius: var(--r-md);
  box-shadow: var(--shadow-card);
  padding: 11px 14px;
  margin-bottom: 9px;
}
.rk-no {
  font-family: var(--font-black);
  font-size: 19px;
  width: 30px;
  text-align: center;
  color: var(--ink-3);
  flex: none;
}
.rk-no.top3 { color: var(--primary); font-size: 23px; }
.rk-no.bottom { color: #7a8aa0; }
.rk-emoji {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex: none;
}
.rk-info { flex: 1; min-width: 0; }
.rk-name {
  font-size: 14.5px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rk-desc { margin-top: 2px; }
.rk-score {
  font-family: var(--font-black);
  font-size: 17px;
  color: var(--yellow-deep);
  flex: none;
}
.rk-score.bottom { color: #7a8aa0; }
.rs-star { font-size: 13px; }
</style>
