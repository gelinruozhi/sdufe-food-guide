<template>
  <div class="canteen-page">
    <!-- Hero -->
    <header class="ch" :style="{ background: style.gradient }">
      <button class="back press" @click="$router.back()">‹</button>
      <span class="ch-emoji float">{{ style.emoji }}</span>
      <h1 class="ch-name">{{ canteen.name }}</h1>
      <p class="ch-loc">{{ canteen.location }}</p>
      <p class="ch-hours">营业时间 {{ canteen.open_hours }}</p>
    </header>

    <!-- 楼层选择 -->
    <div class="floor-tabs">
      <button
        v-for="(f, i) in floors"
        :key="f.id"
        class="floor-tab press"
        :class="{ on: active === i }"
        @click="active = i"
      >
        <span class="ft-no">{{ f.name }}</span>
        <span class="ft-count">{{ f.stalls.length }} 个窗口</span>
      </button>
    </div>

    <!-- 窗口流 -->
    <div class="stall-list">
      <FoodCard
        v-for="(s, i) in currentStalls"
        :key="s.id"
        :stall="s"
        v-rise="i * 50"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api.js';
import FoodCard from '../components/FoodCard.vue';

const STYLES = [
  { emoji: '🏛️', gradient: 'linear-gradient(160deg,#ff8a5c,#e8420f)' },
  { emoji: '🏫', gradient: 'linear-gradient(160deg,#6fb4f0,#3f86d6)' },
  { emoji: '🏢', gradient: 'linear-gradient(160deg,#5bd6a3,#1a9e63)' },
];

export default {
  components: { FoodCard },
  setup() {
    const route = useRoute();
    const canteen = ref({});
    const floors = ref([]);
    const active = ref(0);

    const style = computed(() => STYLES[Number(route.params.id) - 1] || STYLES[0]);
    const currentStalls = computed(() => floors.value[active.value]?.stalls || []);

    onMounted(async () => {
      const r = await api(`/api/canteens/${route.params.id}`);
      canteen.value = r.canteen;
      floors.value = r.floors;
    });

    return { canteen, floors, active, style, currentStalls };
  },
};
</script>

<style scoped>
.ch {
  position: relative;
  padding: 20px 20px 26px;
  border-radius: 0 0 30px 30px;
  overflow: hidden;
  color: #fff;
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
.ch-emoji {
  position: absolute;
  right: 24px;
  top: 26px;
  font-size: 60px;
  opacity: 0.9;
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.2));
}
.ch-name { font-size: 26px; font-weight: 900; margin: 16px 0 4px; }
.ch-loc { font-size: 13px; margin: 0; opacity: 0.9; }
.ch-hours { font-size: 12px; margin: 6px 0 0; opacity: 0.75; }

.floor-tabs {
  display: flex;
  gap: 10px;
  padding: 18px 16px 4px;
}
.floor-tab {
  flex: 1;
  background: #fff;
  border-radius: var(--r-md);
  box-shadow: var(--shadow-card);
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: all 0.2s;
}
.floor-tab.on {
  background: linear-gradient(135deg, #ff6a45, var(--primary-deep));
  box-shadow: var(--shadow-primary);
  transform: translateY(-2px);
}
.ft-no { font-weight: 900; font-size: 15px; }
.ft-count { font-size: 11px; color: var(--ink-2); }
.floor-tab.on .ft-count { color: rgba(255, 255, 255, 0.8); }

.stall-list { padding: 12px 16px 30px; }
.list-enter-active { transition: none; }
</style>
