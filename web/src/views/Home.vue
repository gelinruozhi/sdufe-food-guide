<template>
  <div class="home">
    <!-- ===== 顶部跑马灯 ===== -->
    <div class="ticker">
      <div class="marquee-track">
        <span v-for="n in 2" :key="n" class="ticker-inner">
          食在山财 EAT LAB <i>✦</i> 学生共建 <i>✦</i> 拒绝踩雷 <i>✦</i> 今天吃什么 <i>✦</i>
          38 个窗口等你翻牌 <i>✦</i>
        </span>
      </div>
    </div>

    <!-- ===== 出血大标题 ===== -->
    <header class="hero">
      <span class="hero-tag">SDUFE 圣井校区 · 学生美食共建</span>
      <h1 class="hero-type">
        EAT<span class="h-bolt"><Icon name="bolt" :size="46" /></span><br />
        <span class="stroke-acid">山财</span><br />
        LAB
      </h1>
      <div class="hero-stats tilt-r">
        <div class="hs">
          <b>{{ winCount }}</b><span>窗口</span>
        </div>
        <div class="hs">
          <b>{{ revCount }}</b><span>评价</span>
        </div>
      </div>
      <Icon name="sparkle" :size="26" class="h-deco d1 floaty" />
      <Icon name="sparkle" :size="16" class="h-deco d2 floaty" />
    </header>

    <!-- ===== 街头抽卡机 ===== -->
    <section class="pick panel">
      <div class="pick-head">
        <span class="pick-title">今天吃什么</span>
        <span class="pick-en">RANDOM&nbsp;PICK</span>
      </div>

      <div class="pick-screen" :class="{ rolling, landed: justLanded }">
        <div v-if="!picked" class="ps-idle">
          <Icon name="bolt" :size="40" class="idle-bolt blink" />
          <p>选择困难？交给命运安排</p>
        </div>
        <div v-else class="ps-result">
          <div class="ps-art">
            <FoodArt :category="cur.category" icon-size="40" spark-size="11" />
          </div>
          <div class="ps-info">
            <span class="ps-name">{{ cur.name }}</span>
            <span class="ps-meta">
              <Icon name="starFill" :size="12" class="ps-star" />
              {{ cur.rating_avg || '暂无' }} · ￥{{ cur.avg_price }} · {{ cur.category }}
            </span>
          </div>
        </div>
      </div>

      <button class="btn btn-acid btn-block" :disabled="rolling" @click="roll">
        <Icon name="bolt" :size="17" />
        {{ rolling ? '抽取中…' : picked ? '再来一发' : '开始抽卡' }}
      </button>
      <button
        v-if="picked && !rolling"
        class="btn btn-outline btn-block mt go-btn"
        @click="goStall"
      >
        就它了 <Icon name="arrow" :size="16" />
      </button>
    </section>

    <!-- ===== 餐厅错位拼贴 ===== -->
    <section class="block">
      <div class="block-head">
        <h2 class="block-title">校内餐厅</h2>
        <span class="block-en">CANTEENS</span>
      </div>
      <div class="poster-grid">
        <router-link
          v-for="(c, i) in canteens"
          :key="c.id"
          :to="`/canteen/${c.id}`"
          class="poster"
          :class="[POSTER[i].cls, POSTER[i].tilt]"
          :style="{ background: POSTER[i].bg, color: POSTER[i].fg }"
        >
          <span class="p-no">{{ '0' + (i + 1) }}</span>
          <span class="p-name">{{ c.name }}</span>
          <span class="p-loc">{{ c.location }}</span>
          <span class="p-count">{{ c.floors.reduce((a, f) => a + f.stall_count, 0) }} 窗口 · 2 层</span>
        </router-link>

        <router-link to="/ranking" class="poster poster-more tilt-r">
          <span class="p-no en-all">RANK</span>
          <span class="p-name">红黑榜</span>
          <span class="p-more-arrow"><Icon name="arrow" :size="26" /></span>
        </router-link>
      </div>
    </section>

    <!-- ===== 封神榜速览（行式，非卡片） ===== -->
    <section class="block">
      <div class="block-head">
        <h2 class="block-title">封神榜 TOP3</h2>
        <router-link to="/ranking" class="block-more">
          完整榜单 <Icon name="arrow" :size="13" />
        </router-link>
      </div>
      <div class="rank-panel panel">
        <router-link
          v-for="(s, i) in top"
          :key="s.id"
          :to="`/stall/${s.id}`"
          class="rank-row"
          :class="{ champ: i === 0 }"
        >
          <span class="r-no">{{ '0' + (i + 1) }}</span>
          <span class="r-name">{{ s.name }}</span>
          <span class="r-score">
            <Icon name="starFill" :size="13" />
            {{ s.rating_avg }}
          </span>
        </router-link>
      </div>
    </section>

    <!-- ===== 校外投稿 CTA ===== -->
    <router-link to="/contribute" class="cta tilt-1">
      <div class="cta-text">
        <b>校门口的宝藏小店？</b>
        <p>点我投稿，和同学共建美食地图</p>
      </div>
      <span class="cta-icon"><Icon name="plus" :size="26" :stroke-width="2.6" /></span>
    </router-link>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api.js';
import Icon from '../components/Icon.vue';
import FoodArt from '../components/FoodArt.vue';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const POSTER = [
  { bg: 'linear-gradient(135deg,#d8ff14,#9ed400)', fg: '#0c0c0e', cls: 'p-acid', tilt: 'tilt-l' },
  { bg: 'linear-gradient(135deg,#ff45a1,#d1116f)', fg: '#fff', cls: 'p-hot', tilt: 'tilt-r' },
  { bg: 'linear-gradient(135deg,#8f72ff,#5a3bd6)', fg: '#fff', cls: 'p-volt', tilt: 'tilt-l' },
];

export default {
  components: { Icon, FoodArt },
  setup() {
    const router = useRouter();
    const canteens = ref([]);
    const pool = ref([]);
    const top = ref([]);
    const winCount = ref(0);
    const revCount = ref(0);

    const picked = ref(false);
    const rolling = ref(false);
    const justLanded = ref(false);
    const cur = ref({});

    onMounted(async () => {
      const [c, s, t] = await Promise.all([
        api('/api/canteens'),
        api('/api/stalls?pageSize=100&sort=bayes'),
        api('/api/stalls/ranking/top?limit=3'),
      ]);
      canteens.value = c.canteens;
      pool.value = s.stalls;
      top.value = t.stalls.slice(0, 3);
      winCount.value = s.total || s.stalls.length;
      revCount.value = s.stalls.reduce((a, x) => a + (x.rating_count || 0), 0);
    });

    async function roll() {
      if (rolling.value || !pool.value.length) return;
      const candidates = pool.value.filter((x) => x.rating_count > 0);
      const list = candidates.length ? candidates : pool.value;
      rolling.value = true;
      picked.value = true;
      justLanded.value = false;

      let ticks = 0;
      while (ticks < 13) {
        cur.value = sample(list);
        await sleep(55 + ticks * ticks * 2.4);
        ticks++;
      }
      cur.value = sample(list);
      rolling.value = false;
      justLanded.value = true;
      setTimeout(() => (justLanded.value = false), 600);
    }

    function goStall() {
      router.push(`/stall/${cur.value.id}`);
    }

    return {
      POSTER, canteens, top, winCount, revCount,
      picked, rolling, justLanded, cur, roll, goStall,
    };
  },
};
</script>

<style scoped>
.home {
  padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0) + 20px);
}

/* ===== 跑马灯 ===== */
.ticker {
  background: var(--acid);
  color: #0c0c0e;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
  overflow: hidden;
  padding: 7px 0;
}
.ticker-inner {
  font-family: var(--font-en);
  font-size: 13px;
  padding: 0 14px;
}
.ticker-inner i {
  font-style: normal;
  padding: 0 6px;
}

/* ===== Hero ===== */
.hero {
  position: relative;
  padding: 26px 18px 8px;
}
.hero-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--acid);
  border: 1.5px solid var(--acid);
  border-radius: 2px;
  padding: 3px 10px;
  margin-bottom: 16px;
}
.hero-type {
  font-size: clamp(52px, 17vw, 84px);
}
.h-bolt {
  display: inline-block;
  color: var(--hot);
  transform: translateY(-4px) rotate(8deg);
}
.hero-stats {
  position: absolute;
  top: 40px;
  right: 16px;
  display: flex;
  gap: 7px;
}
.hs {
  background: var(--bg-2);
  border: 2px solid var(--ink);
  border-radius: 3px;
  padding: 7px 9px;
  text-align: center;
  line-height: 1;
}
.hs b {
  display: block;
  font-family: var(--font-en);
  font-size: 19px;
  color: var(--acid);
}
.hs span {
  font-size: 9px;
  color: var(--ink-2);
}
.h-deco {
  position: absolute;
  color: var(--cyan);
}
.d1 {
  right: 40px;
  bottom: 6px;
}
.d2 {
  left: 20px;
  top: 120px;
  color: var(--hot);
}

/* ===== 抽卡机 ===== */
.pick {
  margin: 18px 16px 0;
  padding: 15px;
}
.pick-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}
.pick-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 17px;
}
.pick-en {
  font-family: var(--font-en);
  font-size: 11px;
  color: var(--ink-3);
}
.pick-screen {
  border: 2px solid var(--line);
  border-radius: 4px;
  background: var(--bg);
  min-height: 96px;
  margin-bottom: 13px;
  display: flex;
  align-items: center;
  padding: 11px;
  transition: border-color 0.12s;
}
.pick-screen.rolling {
  border-color: var(--hot);
  animation: screenJitter 0.12s linear infinite;
}
@keyframes screenJitter {
  50% {
    transform: translateX(1.5px) rotate(0.3deg);
  }
}
.pick-screen.landed {
  border-color: var(--acid);
}
.ps-idle {
  width: 100%;
  text-align: center;
}
.idle-bolt {
  color: var(--acid);
}
.ps-idle p {
  font-size: 12px;
  color: var(--ink-2);
  margin-top: 6px;
}
.ps-result {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  animation: pop 0.4s cubic-bezier(0.2, 1.2, 0.4, 1) both;
}
.ps-art {
  width: 68px;
  height: 68px;
  flex: none;
  border: 2px solid #000;
  border-radius: 4px;
  overflow: hidden;
}
.ps-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.ps-name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 16px;
  line-height: 1.2;
}
.ps-meta {
  font-size: 11.5px;
  color: var(--ink-2);
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
}
.ps-star {
  color: var(--acid);
}
.go-btn {
  margin-top: 10px;
}

/* ===== 区块通用 ===== */
.block {
  margin: 30px 16px 0;
}
.block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
}
.block-title {
  font-size: 22px;
}
.block-en {
  font-family: var(--font-en);
  font-size: 11px;
  color: var(--ink-3);
}
.block-more {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--cyan);
  font-weight: 700;
}

/* ===== 餐厅海报拼贴 ===== */
.poster-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;
}
.poster {
  border: 2px solid #000;
  border-radius: 4px;
  box-shadow: 5px 5px 0 #000;
  padding: 13px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 132px;
  transition: transform 0.1s, box-shadow 0.1s;
}
.poster:active {
  transform: translate(4px, 4px) !important;
  box-shadow: 1px 1px 0 #000;
}
.p-hot {
  margin-top: 22px;
}
.p-no {
  font-family: var(--font-en);
  font-size: 26px;
  line-height: 1;
}
.p-name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 16px;
}
.p-loc {
  font-size: 10px;
  opacity: 0.78;
  line-height: 1.35;
  margin-top: auto;
}
.p-count {
  font-size: 10px;
  font-weight: 700;
}
.poster-more {
  margin-top: 22px;
  background: linear-gradient(135deg, #35e8ff, #0aa8c4);
  color: #0c0c0e;
  justify-content: space-between;
}
.en-all {
  font-size: 20px;
}
.p-more-arrow {
  margin-top: auto;
}

/* ===== 行式榜单 ===== */
.rank-panel {
  padding: 4px 14px;
}
.rank-row {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 13px 0;
  border-bottom: 1.5px solid var(--line);
}
.rank-row:last-child {
  border-bottom: none;
}
.r-no {
  font-family: var(--font-en);
  font-size: 20px;
  color: var(--ink-3);
  width: 30px;
  flex: none;
}
.rank-row.champ .r-no {
  color: var(--acid);
}
.r-name {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rank-row.champ .r-name {
  color: var(--acid);
}
.r-score {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 14px;
  color: var(--acid);
}

/* ===== 投稿 CTA ===== */
.cta {
  margin: 30px 16px 0;
  background: var(--hot);
  border: 2px solid #000;
  border-radius: 4px;
  box-shadow: 5px 5px 0 #000;
  padding: 17px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #fff;
}
.cta:active {
  transform: translate(4px, 4px) rotate(0) !important;
  box-shadow: 1px 1px 0 #000;
}
.cta-text b {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 800;
}
.cta-text p {
  font-size: 11.5px;
  margin-top: 4px;
  opacity: 0.85;
}
.cta-icon {
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--acid);
  color: #000;
  border: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
