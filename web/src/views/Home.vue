<template>
  <div class="home">
    <!-- ============ Hero ============ -->
    <header class="hero">
      <span class="blob b1">🍜</span>
      <span class="blob b2">🍔</span>
      <span class="blob b3">🧋</span>
      <span class="circle c1" />
      <span class="circle c2" />

      <p class="hero-hi">{{ greet }}，山财干饭人</p>
      <h1 class="hero-title display-title">今天<br />吃什么？</h1>

      <!-- 翻牌决策卡 -->
      <div class="decide">
        <div class="decide-card" :class="{ rolling, landed: justLanded }">
          <template v-if="!picked">
            <span class="decide-q">?</span>
            <p class="decide-hint">选择困难？让命运安排</p>
          </template>
          <template v-else>
            <div class="decide-emoji" :style="{ background: curMeta.gradient }">
              {{ curMeta.emoji }}
            </div>
            <div class="decide-name">{{ cur.name }}</div>
            <div class="decide-meta">
              <span class="dm-star">★ {{ cur.rating_avg || '暂无' }}</span>
              <span class="dm-dot">·</span>
              <span>¥{{ cur.avg_price }}/人</span>
              <span class="dm-dot">·</span>
              <span>{{ cur.category }}</span>
            </div>
          </template>
        </div>

        <button class="btn btn-yellow btn-block decide-btn" :disabled="rolling" @click="roll">
          {{ rolling ? '翻牌中…' : picked ? '再翻一次' : '帮我翻一个' }}
        </button>
        <button v-if="picked && !rolling" class="decide-go" @click="goStall">
          去看看这家 ›
        </button>
      </div>
    </header>

    <div class="home-body">
      <!-- ============ 校内餐厅 ============ -->
      <div class="section-title">
        <h3>校内餐厅</h3>
        <span class="more">3 个餐厅 · 6 个楼层</span>
      </div>

      <router-link
        v-for="(c, i) in canteens"
        :key="c.id"
        :to="`/canteen/${c.id}`"
        class="canteen-card press card"
      >
        <div class="canteen-icon" :style="{ background: CANTEEN_STYLE[i].gradient }">
          {{ CANTEEN_STYLE[i].emoji }}
        </div>
        <div class="canteen-info">
          <div class="canteen-name">{{ c.name }}</div>
          <div class="muted tiny canteen-loc">{{ c.location }}</div>
          <div class="canteen-floors">
            <span v-for="f in c.floors" :key="f.id" class="chip chip-sm">
              {{ f.name }} · {{ f.stall_count }} 窗口
            </span>
          </div>
        </div>
        <span class="canteen-arrow">›</span>
      </router-link>

      <!-- ============ 好评红榜 ============ -->
      <div class="section-title">
        <h3>本周好评红榜</h3>
        <router-link class="more" to="/ranking">红黑榜 ›</router-link>
      </div>

      <div class="top3">
        <router-link
          v-for="(s, i) in top"
          :key="s.id"
          :to="`/stall/${s.id}`"
          class="top-card press"
          :class="{ champ: i === 0 }"
        >
          <span class="medal">{{ ['🥇', '🥈', '🥉'][i] }}</span>
          <div class="top-emoji" :style="{ background: foodMeta(s.category).gradient }">
            {{ foodMeta(s.category).emoji }}
          </div>
          <div class="top-name">{{ s.name }}</div>
          <div class="top-score">★ {{ s.rating_avg }}</div>
        </router-link>
      </div>

      <!-- ============ 共建引导 ============ -->
      <div class="cta-banner press" @click="$router.push('/contribute')">
        <div class="cta-text">
          <b>发现好吃的小店？</b>
          <p>和同学一起把它加进美食地图</p>
        </div>
        <span class="cta-plus">＋</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api.js';
import { foodMeta } from '../lib/foodMeta.js';

const CANTEEN_STYLE = [
  { emoji: '🏛️', gradient: 'linear-gradient(135deg,#ff8a5c,#ff5a36)' },
  { emoji: '🏫', gradient: 'linear-gradient(135deg,#5aa9e6,#4d9de0)' },
  { emoji: '🏢', gradient: 'linear-gradient(135deg,#3ddc97,#22b573)' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default {
  setup() {
    const router = useRouter();
    const canteens = ref([]);
    const pool = ref([]);
    const top = ref([]);

    const picked = ref(false);
    const rolling = ref(false);
    const justLanded = ref(false);
    const cur = ref({});

    const curMeta = computed(() => foodMeta(cur.value.category));

    const hour = new Date().getHours();
    const greet =
      hour < 6 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';

    onMounted(async () => {
      const [c, s, t] = await Promise.all([
        api('/api/canteens'),
        api('/api/stalls?pageSize=100&sort=bayes'),
        api('/api/stalls/ranking/top?limit=3'),
      ]);
      canteens.value = c.canteens;
      pool.value = s.stalls.filter((x) => x.rating_count > 0);
      top.value = t.stalls;
    });

    async function roll() {
      if (rolling.value || !pool.value.length) return;
      rolling.value = true;
      picked.value = true;
      justLanded.value = false;

      let ticks = 0;
      while (ticks < 12) {
        cur.value = sample(pool.value);
        await sleep(55 + ticks * ticks * 2.2);
        ticks++;
      }
      cur.value = sample(pool.value);
      rolling.value = false;
      justLanded.value = true;
      setTimeout(() => (justLanded.value = false), 550);
    }

    function goStall() {
      router.push(`/stall/${cur.value.id}`);
    }

    return {
      CANTEEN_STYLE, foodMeta, greet,
      canteens, top, picked, rolling, justLanded, cur, curMeta,
      roll, goStall,
    };
  },
};
</script>

<style scoped>
/* ---------- Hero ---------- */
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #ff6a45 0%, #f04423 60%, #d8330f 100%);
  padding: 24px 20px 30px;
  border-radius: 0 0 34px 34px;
}
.blob {
  position: absolute;
  font-size: 40px;
  opacity: 0.16;
  pointer-events: none;
}
.b1 { top: 20px; right: 26px; }
.b2 { top: 96px; right: 96px; font-size: 30px; }
.b3 { bottom: 96px; right: 30px; font-size: 34px; }
.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}
.c1 { width: 170px; height: 170px; top: -70px; left: -60px; }
.c2 { width: 110px; height: 110px; bottom: 30px; left: -40px; }

.hero-hi {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13.5px;
  font-weight: 600;
  margin: 0 0 6px;
}
.hero-title {
  color: #fff;
  font-size: 40px;
  margin: 0;
  text-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

/* 翻牌卡 */
.decide {
  position: relative;
  margin-top: 24px;
}
.decide-card {
  background: #fff;
  border-radius: 24px;
  box-shadow: var(--shadow-pop);
  padding: 20px 16px 18px;
  text-align: center;
  min-height: 132px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.decide-q {
  font-family: var(--font-black);
  font-size: 44px;
  color: var(--primary);
  line-height: 1;
}
.decide-hint {
  color: var(--ink-2);
  font-size: 13px;
  margin: 8px 0 0;
}
.decide-card.rolling {
  animation: cardJitter 0.14s linear infinite;
}
@keyframes cardJitter {
  50% { transform: scale(1.015) rotate(0.4deg); }
}
.decide-card.landed {
  animation: cardLand 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes cardLand {
  from { transform: scale(0.85); opacity: 0.4; }
}
.decide-emoji {
  width: 62px;
  height: 62px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.14);
}
.decide-name {
  font-size: 19px;
  font-weight: 900;
  margin: 10px 0 3px;
}
.decide-meta {
  font-size: 12.5px;
  color: var(--ink-2);
  display: flex;
  gap: 5px;
  align-items: center;
}
.dm-star { color: var(--yellow-deep); font-weight: 800; }
.dm-dot { color: var(--ink-3); }
.decide-btn {
  margin-top: 12px;
}
.decide-go {
  display: block;
  margin: 10px auto 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12.5px;
  font-weight: 700;
}

/* ---------- 主体 ---------- */
.home-body {
  padding: 26px 16px calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0) + 14px);
}

/* 餐厅卡 */
.canteen-card {
  display: flex;
  align-items: center;
  padding: 13px 12px;
  margin-bottom: 11px;
  position: relative;
}
.canteen-icon {
  width: 56px;
  height: 56px;
  border-radius: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex: none;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
}
.canteen-info { flex: 1; min-width: 0; margin-left: 12px; }
.canteen-name { font-size: 16px; font-weight: 900; }
.canteen-loc { margin: 2px 0 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.canteen-floors { display: flex; gap: 6px; flex-wrap: wrap; }
.chip-sm { padding: 2px 9px; font-size: 10.5px; }
.canteen-arrow {
  font-size: 24px;
  color: var(--ink-3);
  font-weight: 300;
  margin-right: 4px;
}

/* 红榜前三 */
.top3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
}
.top-card {
  background: #fff;
  border-radius: var(--r-md);
  box-shadow: var(--shadow-card);
  padding: 14px 6px 12px;
  text-align: center;
  position: relative;
}
.top-card.champ {
  transform: translateY(-9px);
  box-shadow: var(--shadow-primary);
}
.medal { font-size: 22px; display: block; }
.top-emoji {
  width: 48px;
  height: 48px;
  border-radius: 15px;
  margin: 7px auto 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}
.top-name {
  font-size: 12px;
  font-weight: 800;
  line-height: 1.3;
  height: 31px;
  overflow: hidden;
}
.top-score {
  font-size: 12px;
  font-weight: 900;
  color: var(--yellow-deep);
  margin-top: 3px;
}

/* 共建引导 */
.cta-banner {
  margin-top: 24px;
  border-radius: var(--r-md);
  padding: 18px 20px;
  background: linear-gradient(120deg, #2b2118, #43342a);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cta-text b { font-size: 16px; }
.cta-text p { margin: 4px 0 0; font-size: 12px; color: rgba(255, 255, 255, 0.65); }
.cta-plus {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font-size: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 300;
}
</style>
