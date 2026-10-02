<template>
  <div class="cd-page">
    <!-- Hero -->
    <header class="cd-hero">
      <button class="cd-back" @click="$router.back()">
        <Icon name="back" :size="20" />
      </button>
      <span class="cd-bgno">{{ '0' + canteen.id }}</span>

      <span class="cd-kicker" :style="{ color: accent, borderColor: accent }">
        CANTEEN / 校内餐厅
      </span>
      <h1 class="cd-name">
        {{ canteen.name }}
      </h1>

      <div class="cd-meta">
        <span><Icon name="location" :size="15" /> {{ canteen.location }}</span>
        <span><Icon name="clock" :size="15" /> 营业 {{ canteen.open_hours }}</span>
      </div>

      <Icon name="sparkle" :size="22" class="cd-deco floaty" :style="{ color: accent }" />
    </header>

    <!-- 楼层切换 -->
    <div class="floor-switch">
      <button
        v-for="(f, i) in floors"
        :key="f.id"
        class="fs-btn"
        :class="{ on: active === i }"
        @click="active = i"
      >
        <b>{{ f.name }}</b>
        <span>{{ f.stalls.length }} 窗口</span>
      </button>
    </div>

    <!-- 窗口流 -->
    <div class="cd-list">
      <FoodCard
        v-for="(s, i) in currentStalls"
        :key="s.id"
        :stall="s"
        :index="i"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api.js';
import Icon from '../components/Icon.vue';
import FoodCard from '../components/FoodCard.vue';

const ACCENTS = ['#ccff00', '#ff2e93', '#8061ff'];

export default {
  components: { Icon, FoodCard },
  setup() {
    const route = useRoute();
    const canteen = ref({ id: route.params.id });
    const floors = ref([]);
    const active = ref(0);

    const accent = computed(() => ACCENTS[Number(route.params.id) - 1] || ACCENTS[0]);
    const currentStalls = computed(() => floors.value[active.value]?.stalls || []);

    onMounted(async () => {
      const r = await api(`/api/canteens/${route.params.id}`);
      canteen.value = r.canteen;
      floors.value = r.floors;
    });

    return { canteen, floors, active, accent, currentStalls };
  },
};
</script>

<style scoped>
.cd-page {
  padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0) + 20px);
}

/* Hero */
.cd-hero {
  position: relative;
  padding: 18px 18px 24px;
  border-bottom: 2.5px solid var(--ink);
  overflow: hidden;
}
.cd-back {
  width: 38px;
  height: 38px;
  border: 2px solid var(--ink);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-2);
  margin-bottom: 18px;
}
.cd-back:active {
  background: var(--hot);
  color: #fff;
  border-color: #000;
}
.cd-bgno {
  position: absolute;
  right: 8px;
  top: 8px;
  font-family: var(--font-en);
  font-size: 120px;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.12);
  pointer-events: none;
}
.cd-kicker {
  display: inline-block;
  font-family: var(--font-en);
  font-size: 10.5px;
  border: 1.5px solid;
  border-radius: 2px;
  padding: 3px 9px;
  margin-bottom: 12px;
}
.cd-name {
  font-size: 34px;
  position: relative;
}
.cd-meta {
  position: relative;
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 12.5px;
  color: var(--ink-2);
}
.cd-meta span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.cd-deco {
  position: absolute;
  left: 150px;
  bottom: 14px;
}

/* 楼层切换 */
.floor-switch {
  display: flex;
  gap: 11px;
  padding: 18px 16px 2px;
}
.fs-btn {
  flex: 1;
  border: 2px solid var(--line);
  border-radius: 4px;
  background: var(--bg-2);
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: transform 0.1s, box-shadow 0.1s, background 0.12s, color 0.12s;
}
.fs-btn b {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 800;
}
.fs-btn span {
  font-size: 10.5px;
  color: var(--ink-2);
}
.fs-btn.on {
  background: var(--acid);
  color: #000;
  border-color: #000;
  box-shadow: 4px 4px 0 #000;
  transform: translate(-1px, -1px);
}
.fs-btn.on span {
  color: rgba(0, 0, 0, 0.7);
}

.cd-list {
  padding: 16px 16px 0;
}
</style>
