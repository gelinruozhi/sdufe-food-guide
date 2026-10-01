<template>
  <div>
    <!-- 顶部横幅 -->
    <div class="hero">
      <h1>食在山财</h1>
      <p>山财窗口全收录 · 同学们的美食共建平台</p>
      <van-search
        class="hero-search"
        placeholder="搜索窗口 / 菜品，如：黄焖鸡"
        readonly
        shape="round"
        @click="$router.push('/search')"
      />
    </div>

    <div class="page">
      <!-- 餐厅 -->
      <div class="section-title">校内餐厅</div>
      <div class="canteen-grid">
        <div
          v-for="c in canteens"
          :key="c.id"
          class="canteen-card"
          @click="$router.push(`/canteen/${c.id}`)"
        >
          <div class="c-name">{{ c.name }}</div>
          <div class="c-loc">{{ c.location }}</div>
          <div class="c-floors">
            <span v-for="f in c.floors" :key="f.id" class="floor-chip">
              {{ f.name }} · {{ f.stall_count }} 窗口
            </span>
          </div>
        </div>
      </div>

      <!-- 随机吃什么 -->
      <van-button
        round
        block
        type="danger"
        class="random-btn"
        @click="randomEat"
      >不知道吃什么？随机来一个</van-button>

      <!-- 红榜 -->
      <div class="section-title">
        本周好评红榜
        <span class="more" @click="$router.push('/search?sort=bayes')">查看全部 ›</span>
      </div>
      <StallCard v-for="s in top" :key="s.id" :stall="s" />

      <!-- 黑榜入口 -->
      <div class="black-entry" @click="showBlack = true">
        <span>差评黑榜（评价数达标后上榜）</span>
        <span class="muted">谨慎查看 ›</span>
      </div>

      <p class="tips muted">
        所有窗口与评价由同学共同维护：发现窗口缺失或信息有误，可投稿共建或发起纠错，审核通过后信用分奖励。
      </p>
    </div>

    <!-- 随机结果弹窗 -->
    <van-popup v-model:show="randomShow" round closeable :style="{ width: '82%' }">
      <div class="random-pop" v-if="randomStall">
        <div class="rp-label">今天就吃它了</div>
        <h3>{{ randomStall.name }}</h3>
        <p class="muted">{{ randomStall.category }} · 人均 ¥{{ randomStall.avg_price }}</p>
        <p class="rp-desc">{{ randomStall.description }}</p>
        <van-button type="danger" size="small" round @click="goStall(randomStall.id)">
          去看看
        </van-button>
        <van-button size="small" plain round @click="randomEat">换一个</van-button>
      </div>
    </van-popup>

    <!-- 黑榜弹窗 -->
    <van-popup v-model:show="showBlack" round position="bottom" :style="{ maxHeight: '70%' }">
      <div style="padding:16px;">
        <h3 style="margin-bottom:10px;">差评黑榜</h3>
        <StallCard v-for="s in bottom" :key="s.id" :stall="s" />
        <div v-if="!bottom.length" class="empty-box">暂无评价数达标的窗口</div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { api } from '../api.js';
import StallCard from '../components/StallCard.vue';

export default {
  name: 'Home',
  components: { StallCard },
  setup() {
    const router = useRouter();
    const canteens = ref([]);
    const top = ref([]);
    const bottom = ref([]);
    const randomShow = ref(false);
    const randomStall = ref(null);
    const showBlack = ref(false);

    onMounted(async () => {
      const [c, t, b] = await Promise.all([
        api('/api/canteens'),
        api('/api/stalls/ranking/top'),
        api('/api/stalls/ranking/bottom'),
      ]);
      canteens.value = c.canteens;
      top.value = t.stalls.slice(0, 5);
      bottom.value = b.stalls;
    });

    async function randomEat() {
      try {
        const r = await api('/api/stalls/random/eat');
        randomStall.value = r.stall;
        randomShow.value = true;
      } catch (e) {
        showToast(e.message);
      }
    }
    function goStall(id) {
      randomShow.value = false;
      router.push(`/stall/${id}`);
    }

    return { canteens, top, bottom, randomEat, randomShow, randomStall, goStall, showBlack };
  },
};
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #c0392b 0%, #96201a 100%);
  padding: 26px 16px 4px;
  color: #fff;
}
.hero h1 { font-size: 27px; font-weight: 800; letter-spacing: 2px; }
.hero p { font-size: 12.5px; opacity: 0.88; margin-top: 5px; }
:deep(.hero-search) { padding: 14px 0 16px; }
:deep(.hero-search .van-search__content) { background: #fff; }
.canteen-grid { display: flex; flex-direction: column; gap: 10px; }
.canteen-card {
  background: #fff;
  border-radius: 8px;
  padding: 14px 15px;
}
.c-name { font-size: 16px; font-weight: 700; }
.c-loc { font-size: 12px; color: #969799; margin: 3px 0 9px; }
.c-floors { display: flex; gap: 8px; }
.floor-chip {
  font-size: 11.5px;
  background: #f7f8fa;
  border-radius: 4px;
  padding: 3px 9px;
  color: #646566;
}
.random-btn { margin: 16px 0 4px; }
.black-entry {
  display: flex;
  justify-content: space-between;
  background: #fff;
  border-radius: 8px;
  padding: 13px 15px;
  margin-top: 12px;
  font-size: 13.5px;
}
.tips { font-size: 11.5px; margin: 16px 4px; line-height: 1.8; }
.random-pop { text-align: center; padding: 26px 20px 22px; }
.rp-label { font-size: 12px; color: #969799; margin-bottom: 8px; }
.random-pop h3 { font-size: 21px; margin-bottom: 6px; }
.rp-desc {
  font-size: 12.5px;
  color: #646566;
  line-height: 1.8;
  margin: 12px 0 16px;
}
.random-pop .van-button { margin: 0 5px; }
</style>
