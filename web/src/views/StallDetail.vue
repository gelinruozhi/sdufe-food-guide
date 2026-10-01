<template>
  <div class="sd">
    <!-- ============ 头图 ============ -->
    <div class="hero">
      <img v-if="stall.cover" :src="stall.cover" />
      <div v-else class="hero-fallback" :style="{ background: meta.gradient }">
        <span class="hero-emoji float">{{ meta.emoji }}</span>
        <span class="hero-circle hc1" />
        <span class="hero-circle hc2" />
      </div>
      <button class="back press" @click="$router.back()">‹</button>
      <div class="hero-mask">
        <span class="hero-tag">
          {{ stall.stall_type === 'inside' ? '校内 · ' + (stall.floor?.name || '') : '校外店铺' }}
        </span>
        <h1>{{ stall.name }}</h1>
      </div>
    </div>

    <div class="body">
      <!-- 关键信息 -->
      <div class="quick card">
        <div class="q-item">
          <b>¥{{ stall.avg_price }}</b><span>人均消费</span>
        </div>
        <div class="q-sep" />
        <div class="q-item q-wide">
          <b class="q-hours">{{ stall.business_hours }}</b><span>营业时间</span>
        </div>
      </div>
      <div v-if="stall.address" class="addr">
        <span>📍 {{ stall.address }}</span>
        <a v-if="stall.phone" :href="`tel:${stall.phone}`"> · {{ stall.phone }}</a>
      </div>

      <!-- 评分仪表 -->
      <div class="rate card">
        <div class="rate-left">
          <div class="big-score">{{ stall.rating_avg }}</div>
          <StarBar :model-value="Math.round(stall.rating_avg)" readonly :size="15" />
          <div class="muted tiny">{{ stall.rating_count }} 条评价</div>
        </div>
        <div class="dist">
          <div v-for="i in [5, 4, 3, 2, 1]" :key="i" class="dist-row">
            <span class="dist-n">{{ i }}</span>
            <div class="dist-track">
              <div class="dist-fill" :style="{ width: pct(i) + '%' }" />
            </div>
            <span class="dist-c">{{ stall.distribution?.[i] || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 态度按钮 -->
      <div class="actions">
        <button class="act press" :class="{ on: myVote === 1 }" @click="doVote(1)">
          <span class="act-ic">👍</span><span>{{ stall.upvotes }}</span>
        </button>
        <button class="act press" :class="{ down: myVote === -1 }" @click="doVote(-1)">
          <span class="act-ic">👎</span><span>{{ stall.downvotes }}</span>
        </button>
        <button class="act press" :class="{ on: myFav }" @click="doFav">
          <span class="act-ic">⭐</span><span>{{ myFav ? '已收藏' : '收藏' }}</span>
        </button>
        <button class="act press" @click="openReport">
          <span class="act-ic">🚩</span><span>举报</span>
        </button>
      </div>

      <!-- 介绍 -->
      <div class="intro card">
        <h3>窗口介绍</h3>
        <p>{{ stall.description }}</p>
      </div>

      <!-- 外卖 -->
      <div v-if="stall.delivery_supported" class="delivery card">
        <div class="dl-info">
          <h3>外卖点单</h3>
          <p class="muted tiny">
            {{ stall.delivery_platform }} · 起送 ¥{{ stall.min_order }} · 配送 ¥{{ stall.delivery_fee }}
          </p>
        </div>
        <button class="btn btn-primary btn-sm" @click="toast('演示环境未接入真实下单')">去点单</button>
      </div>

      <!-- 评价 -->
      <div class="section-title">
        <h3>全部评价 {{ stall.rating_count }}</h3>
        <button class="write-entry" @click="openReview">✏️ 写评价</button>
      </div>

      <div
        v-for="(rv, i) in reviews"
        :key="rv.id"
        class="review card"
        v-rise="i * 50"
      >
        <div class="rv-head">
          <div class="rv-avatar">{{ rv.anonymous ? '🕵️' : AVATARS[rv.id % AVATARS.length] }}</div>
          <div class="rv-id">
            <div class="rv-name">{{ rv.nickname }}</div>
            <StarBar :model-value="rv.star" readonly :size="12" />
          </div>
          <span class="muted tiny rv-time">{{ rv.created_at }}</span>
        </div>
        <p v-if="rv.content" class="rv-content">{{ rv.content }}</p>
        <div v-if="rv.images.length" class="rv-images">
          <img
            v-for="(im, k) in rv.images"
            :key="k"
            :src="im"
            @click="preview = im"
          />
        </div>
        <button class="helpful" :class="{ on: rv.my_useful }" @click="doHelpful(rv)">
          👍 有用 {{ rv.helpful_count }}
        </button>
      </div>
    </div>

    <button class="fab press" @click="openReview">✏️ 写评价</button>

    <!-- 写评价 -->
    <Sheet v-model="reviewOpen">
      <h3 class="sheet-h">为「{{ stall.name }}」打分</h3>
      <div class="write-stars">
        <StarBar v-model="form.star" :size="42" show-text />
      </div>
      <textarea
        v-model="form.content"
        rows="4"
        class="write-area"
        placeholder="说说味道、分量、性价比，给同学参考…"
      />
      <div class="write-images">
        <div v-for="(im, k) in form.images" :key="k" class="wi-thumb">
          <img :src="im" />
          <button @click="form.images.splice(k, 1)">×</button>
        </div>
        <label v-if="form.images.length < 6 && !uploading" class="wi-add">
          <input type="file" accept="image/*" hidden @change="pickImage" />＋
        </label>
        <span v-if="uploading" class="wi-loading spin">⚙️</span>
      </div>
      <label class="anon">
        <input type="checkbox" v-model="form.anonymous" /> 匿名评价
      </label>
      <button
        class="btn btn-primary btn-block"
        :disabled="submitting || !form.star"
        @click="submitReview"
      >
        {{ submitting ? '发布中…' : '发布评价' }}
      </button>
    </Sheet>

    <!-- 举报 -->
    <Sheet v-model="reportOpen" title="选择举报原因">
      <div class="report-reasons">
        <button
          v-for="x in REPORT_REASONS"
          :key="x"
          class="reason-chip press"
          @click="submitReport(x)"
        >
          {{ x }}
        </button>
      </div>
    </Sheet>

    <!-- 图片预览 -->
    <transition name="fade">
      <div v-if="preview" class="img-preview" @click="preview = ''">
        <img :src="preview" />
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, getToken, uploadImage } from '../api.js';
import { foodMeta } from '../lib/foodMeta.js';
import { toast } from '../lib/toast.js';
import StarBar from '../components/StarBar.vue';
import Sheet from '../components/Sheet.vue';

const AVATARS = ['🐱', '🐻', '🦊', '🐼', '🐨', '🦁', '🐸', '🐵', '🐷', '🐰'];
const REPORT_REASONS = ['内容违规', '广告 / 引流', '虚假信息', '不文明用语', '图片不当', '其他'];

function emptyForm() {
  return { star: 0, content: '', images: [], anonymous: false };
}

export default {
  components: { StarBar, Sheet },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const stall = ref({ distribution: {} });
    const reviews = ref([]);
    const meta = computed(() => foodMeta(stall.value.category));

    const myVote = ref(0);
    const myFav = ref(false);

    const reviewOpen = ref(false);
    const reportOpen = ref(false);
    const form = ref(emptyForm());
    const submitting = ref(false);
    const uploading = ref(false);
    const preview = ref('');

    async function load() {
      const r = await api(`/api/stalls/${route.params.id}`);
      stall.value = r.stall;
      myVote.value = r.stall.my_vote;
      myFav.value = r.stall.my_favorite;
      const rv = await api(`/api/stalls/${route.params.id}/reviews`);
      reviews.value = rv.reviews;
    }
    onMounted(load);

    function pct(i) {
      const total = reviews.value.length || 1;
      return Math.round(((stall.value.distribution?.[i] || 0) / total) * 100);
    }

    async function doVote(v) {
      if (!guardLogin()) return;
      const next = myVote.value === v ? 0 : v;
      const r = await api(`/api/stalls/${stall.value.id}/vote`, {
        method: 'POST',
        body: { vote: next },
      });
      myVote.value = r.vote;
      stall.value.upvotes = r.upvotes;
      stall.value.downvotes = r.downvotes;
    }

    async function doFav() {
      if (!guardLogin()) return;
      const r = await api(`/api/stalls/${stall.value.id}/favorite`, { method: 'POST' });
      myFav.value = r.favorite;
      toast[r.favorite ? 'success' : 'text'](r.favorite ? '已加入收藏' : '已取消收藏');
    }

    function guardLogin() {
      if (!getToken()) {
        toast.fail('请先登录');
        router.push('/login');
        return false;
      }
      return true;
    }

    function openReview() {
      if (!guardLogin()) return;
      const mine = reviews.value.find((x) => x.mine);
      form.value = mine
        ? { star: mine.star, content: mine.content, images: [...mine.images], anonymous: mine.anonymous }
        : emptyForm();
      reviewOpen.value = true;
    }

    async function pickImage(e) {
      const file = e.target.files[0];
      if (!file) return;
      uploading.value = true;
      try {
        const url = await uploadImage(file);
        form.value.images.push(url);
      } catch {
        toast.fail('图片上传失败');
      } finally {
        uploading.value = false;
        e.target.value = '';
      }
    }

    async function submitReview() {
      submitting.value = true;
      try {
        await api(`/api/stalls/${stall.value.id}/reviews`, {
          method: 'POST',
          body: { ...form.value },
        });
        toast.success('评价已发布');
        reviewOpen.value = false;
        await load();
      } catch (e) {
        toast.fail(e.message);
      } finally {
        submitting.value = false;
      }
    }

    async function doHelpful(rv) {
      if (!guardLogin()) return;
      const r = await api(`/api/reviews/${rv.id}/helpful`, { method: 'POST' });
      rv.my_useful = r.helpful;
      rv.helpful_count += r.helpful ? 1 : -1;
    }

    function openReport() {
      if (!guardLogin()) return;
      reportOpen.value = true;
    }
    async function submitReport(reason) {
      await api('/api/reports', {
        method: 'POST',
        body: { target_type: 'stall', target_id: stall.value.id, reason },
      });
      reportOpen.value = false;
      toast.success('举报已提交，感谢监督');
    }

    return {
      stall, reviews, meta, myVote, myFav,
      reviewOpen, reportOpen, form, submitting, uploading, preview,
      AVATARS, REPORT_REASONS, toast,
      pct, doVote, doFav, openReview, pickImage, submitReview, doHelpful,
      openReport, submitReport,
    };
  },
};
</script>

<style scoped>
/* 头图 */
.hero {
  position: relative;
  height: 300px;
  overflow: hidden;
}
.hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-emoji {
  font-size: 110px;
  filter: drop-shadow(0 14px 26px rgba(0, 0, 0, 0.22));
}
.hero-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  pointer-events: none;
}
.hc1 { width: 180px; height: 180px; top: -70px; right: -50px; }
.hc2 { width: 110px; height: 110px; bottom: 30px; left: -40px; }
.back {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.28);
  color: #fff;
  font-size: 26px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 4px;
  z-index: 2;
}
.hero-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 40px 20px 18px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
  color: #fff;
}
.hero-mask h1 {
  margin: 6px 0 0;
  font-size: 27px;
  font-weight: 900;
}
.hero-tag {
  font-size: 11.5px;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  padding: 3px 12px;
}

.body { padding: 16px 16px 90px; }

/* 关键信息 */
.quick {
  display: flex;
  align-items: center;
  margin-top: -22px;
  position: relative;
  padding: 16px;
}
.q-item { flex: 1; text-align: center; }
.q-item b { display: block; font-size: 19px; font-weight: 900; color: var(--primary-deep); }
.q-hours { font-size: 14px !important; color: var(--ink) !important; }
.q-item span { font-size: 11px; color: var(--ink-2); }
.q-sep { width: 1px; height: 34px; background: var(--line); }
.q-wide { flex: 1.6; }
.addr {
  font-size: 12.5px;
  color: var(--ink-2);
  margin: 10px 4px 0;
}
.addr a { color: var(--blue); }

/* 评分 */
.rate {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-top: 14px;
  gap: 16px;
}
.rate-left {
  text-align: center;
  flex: none;
}
.big-score {
  font-family: var(--font-black);
  font-size: 38px;
  line-height: 1;
  color: var(--ink);
}
.dist { flex: 1; }
.dist-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 4px;
}
.dist-n { font-size: 11px; color: var(--ink-2); width: 9px; }
.dist-track {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #f3ece4;
  overflow: hidden;
}
.dist-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #ffd45e, var(--yellow-deep));
}
.dist-c { font-size: 11px; color: var(--ink-2); width: 16px; text-align: right; }

/* 态度 */
.actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 9px;
  margin-top: 14px;
}
.act {
  background: #fff;
  border-radius: var(--r-sm);
  box-shadow: var(--shadow-card);
  padding: 11px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ink-2);
}
.act-ic { font-size: 20px; }
.act.on {
  background: var(--primary-soft);
  color: var(--primary-deep);
  animation: heartbeat 0.5s;
}
.act.down { background: #f2f3f5; }

/* 介绍 / 外卖 */
.intro,
.delivery { padding: 16px 18px; margin-top: 14px; }
.intro h3,
.delivery h3 { margin: 0 0 7px; font-size: 15px; }
.intro p { margin: 0; font-size: 13.5px; line-height: 1.8; color: #4a3f36; }
.delivery {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.delivery p { margin: 0; }

.write-entry {
  color: var(--primary);
  font-size: 12.5px;
  font-weight: 800;
}

/* 评价 */
.review { padding: 14px 16px; margin-bottom: 11px; }
.rv-head { display: flex; align-items: center; gap: 10px; }
.rv-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21px;
  flex: none;
}
.rv-id { flex: 1; }
.rv-name { font-size: 13.5px; font-weight: 800; }
.rv-time { flex: none; }
.rv-content { font-size: 13.5px; line-height: 1.75; margin: 9px 0; }
.rv-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 9px;
}
.rv-images img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 9px;
}
.helpful {
  font-size: 12px;
  color: var(--ink-2);
  background: var(--bg);
  border-radius: 999px;
  padding: 5px 13px;
}
.helpful.on { color: var(--primary); background: var(--primary-soft); }

.fab {
  position: fixed;
  right: 18px;
  bottom: 22px;
  z-index: 90;
  background: linear-gradient(135deg, #ff6a45, var(--primary-deep));
  color: #fff;
  border-radius: 999px;
  padding: 13px 21px;
  font-weight: 800;
  box-shadow: var(--shadow-primary);
}

/* 写评价表单 */
.sheet-h { text-align: center; font-size: 17px; margin: 4px 0 14px; }
.write-stars { text-align: center; margin-bottom: 14px; }
.write-area {
  width: 100%;
  background: #fff;
  border-radius: var(--r-sm);
  padding: 13px 15px;
  box-shadow: var(--shadow-card);
  line-height: 1.7;
}
.write-images { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
.wi-thumb {
  position: relative;
  width: 64px;
  height: 64px;
}
.wi-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 11px;
}
.wi-thumb button {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 13px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wi-add {
  width: 64px;
  height: 64px;
  border-radius: 11px;
  background: #fff;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: var(--ink-3);
}
.wi-loading { font-size: 28px; }
.anon {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--ink-2);
  margin-bottom: 14px;
}

/* 举报 */
.report-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  justify-content: center;
}
.reason-chip {
  background: #fff;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: var(--shadow-card);
}

/* 图片预览 */
.img-preview {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.img-preview img { max-width: 100%; max-height: 100%; border-radius: 6px; }
</style>
