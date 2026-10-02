<template>
  <div class="sd">
    <!-- ============ 头图 ============ -->
    <div class="hero">
      <img v-if="stall.cover" :src="stall.cover" />
      <FoodArt
        v-else
        :category="stall.category"
        icon-size="118"
        spark-size="34"
        :stroke-width="1.4"
      />
      <button class="back" @click="$router.back()">
        <Icon name="back" :size="20" />
      </button>
      <div class="hero-bar">
        <span class="hero-tag">{{ stall.stall_type === 'inside' ? '校内 · ' + (stall.floor?.name || '') : '校外店铺' }}</span>
        <h1>{{ stall.name }}</h1>
      </div>
    </div>

    <div class="body">
      <!-- 关键信息 -->
      <div class="quick panel">
        <div class="q-item">
          <b>¥{{ stall.avg_price }}</b><span>人均</span>
        </div>
        <div class="q-sep" />
        <div class="q-item q-wide">
          <b class="q-hours">{{ stall.business_hours }}</b><span>营业时间</span>
        </div>
      </div>

      <div v-if="stall.address" class="addr">
        <Icon name="location" :size="14" />
        <span>{{ stall.address }}</span>
        <a v-if="stall.phone" :href="`tel:${stall.phone}`">{{ stall.phone }}</a>
      </div>

      <!-- 评分分布 -->
      <div class="rate panel">
        <div class="rate-left">
          <div class="big-score">{{ stall.rating_avg }}</div>
          <StarBar :model-value="Math.round(stall.rating_avg)" readonly :size="14" />
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
        <button class="act" :class="{ on: myVote === 1 }" @click="doVote(1)">
          <Icon name="thumbUp" :size="22" :stroke-width="2.1" />
          <span>{{ stall.upvotes }}</span>
        </button>
        <button class="act" :class="{ down: myVote === -1 }" @click="doVote(-1)">
          <Icon name="thumbDown" :size="22" :stroke-width="2.1" />
          <span>{{ stall.downvotes }}</span>
        </button>
        <button class="act" :class="{ on: myFav }" @click="doFav">
          <Icon name="heart" :size="22" :stroke-width="2.1" />
          <span>{{ myFav ? '已藏' : '收藏' }}</span>
        </button>
        <button class="act" @click="openReport">
          <Icon name="flag" :size="22" :stroke-width="2.1" />
          <span>举报</span>
        </button>
      </div>

      <!-- 介绍 -->
      <div v-if="stall.description" class="intro panel">
        <h3>窗口介绍</h3>
        <p>{{ stall.description }}</p>
      </div>

      <!-- 外卖 -->
      <div v-if="stall.delivery_supported" class="delivery panel">
        <div class="dl-info">
          <h3>外卖点单</h3>
          <p class="muted tiny">
            {{ stall.delivery_platform }} · 起送 ¥{{ stall.min_order }} · 配送 ¥{{ stall.delivery_fee }}
          </p>
        </div>
        <button class="btn btn-volt btn-sm" @click="toast('演示环境未接入真实下单')">去点单</button>
      </div>

      <!-- 评价标题 -->
      <div class="rv-section-title">
        <h3>全部评价 {{ stall.rating_count }}</h3>
      </div>

      <div v-for="rv in reviews" :key="rv.id" class="review panel">
        <div class="rv-head">
          <div class="rv-avatar" :class="{ anon: rv.anonymous }">
            <span v-if="rv.anonymous">匿</span>
            <Icon v-else name="user" :size="20" />
          </div>
          <div class="rv-id">
            <div class="rv-name">{{ rv.anonymous ? '匿名同学' : rv.nickname }}</div>
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
          <Icon name="thumbUp" :size="14" />
          有用 {{ rv.helpful_count }}
        </button>
      </div>
    </div>

    <!-- 写评价 FAB -->
    <button class="fab" @click="openReview">
      <Icon name="edit" :size="18" /> 写评价
    </button>

    <!-- 写评价 -->
    <Sheet v-model="reviewOpen">
      <h3 class="sheet-h">为「{{ stall.name }}」打分</h3>
      <div class="write-stars">
        <StarBar v-model="form.star" :size="38" show-label />
      </div>
      <textarea
        v-model="form.content"
        rows="4"
        class="field"
        placeholder="说说味道、分量、性价比，给同学参考…"
      />
      <div class="write-images">
        <div v-for="(im, k) in form.images" :key="k" class="wi-thumb">
          <img :src="im" />
          <button @click="form.images.splice(k, 1)"><Icon name="close" :size="11" /></button>
        </div>
        <label v-if="form.images.length < 6 && !uploading" class="wi-add">
          <input type="file" accept="image/*" hidden @change="pickImage" />
          <Icon name="camera" :size="24" />
        </label>
        <span v-if="uploading" class="wi-loading"><Icon name="bolt" :size="26" class="spin" /></span>
      </div>
      <label class="anon">
        <input type="checkbox" v-model="form.anonymous" /> 匿名评价
      </label>
      <button
        class="btn btn-acid btn-block"
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
          class="reason-chip"
          @click="submitReport(x)"
        >
          {{ x }}
        </button>
      </div>
    </Sheet>

    <!-- 图片预览 -->
    <div v-if="preview" class="img-preview" @click="preview = ''">
      <img :src="preview" />
      <button class="preview-x"><Icon name="close" :size="22" /></button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, getToken, uploadImage } from '../api.js';
import { toast } from '../lib/toast.js';
import Icon from '../components/Icon.vue';
import FoodArt from '../components/FoodArt.vue';
import StarBar from '../components/StarBar.vue';
import Sheet from '../components/Sheet.vue';

const REPORT_REASONS = ['内容违规', '广告 / 引流', '虚假信息', '不文明用语', '图片不当', '其他'];

function emptyForm() {
  return { star: 0, content: '', images: [], anonymous: false };
}

export default {
  components: { Icon, FoodArt, StarBar, Sheet },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const stall = ref({ distribution: {} });
    const reviews = ref([]);

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
      const total = stall.value.rating_count || 1;
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
      stall, reviews, myVote, myFav,
      reviewOpen, reportOpen, form, submitting, uploading, preview,
      REPORT_REASONS, toast,
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
  height: 264px;
  overflow: hidden;
}
.hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.back {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 38px;
  height: 38px;
  background: rgba(12, 12, 14, 0.8);
  border: 2px solid var(--ink);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}
.back:active {
  background: var(--hot);
  color: #fff;
  border-color: #000;
}
.hero-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px 13px;
  background: rgba(8, 8, 10, 0.78);
  border-top: 2px solid var(--acid);
}
.hero-tag {
  font-size: 10.5px;
  color: var(--acid);
  font-weight: 700;
}
.hero-bar h1 {
  margin-top: 3px;
  font-size: 23px;
}

.body {
  padding: 16px 16px 96px;
}

/* 关键信息 */
.quick {
  display: flex;
  align-items: center;
  margin-top: -24px;
  position: relative;
  padding: 15px;
}
.q-item {
  flex: 1;
  text-align: center;
}
.q-item b {
  display: block;
  font-family: var(--font-en);
  font-size: 19px;
  color: var(--acid);
}
.q-hours {
  font-size: 13px !important;
  color: var(--ink) !important;
  font-family: var(--font-display) !important;
}
.q-item span {
  font-size: 10.5px;
  color: var(--ink-2);
}
.q-sep {
  width: 2px;
  height: 34px;
  background: var(--line);
}
.q-wide {
  flex: 1.7;
}
.addr {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ink-2);
  margin: 11px 4px 0;
  flex-wrap: wrap;
}
.addr a {
  color: var(--cyan);
}

/* 评分分布 */
.rate {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-top: 14px;
  gap: 15px;
}
.rate-left {
  text-align: center;
  flex: none;
}
.big-score {
  font-family: var(--font-en);
  font-size: 36px;
  line-height: 1;
}
.rate-left :deep(.starbar) {
  margin: 6px 0 4px;
}
.dist {
  flex: 1;
}
.dist-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 4px;
}
.dist-n {
  font-size: 10.5px;
  color: var(--ink-2);
  width: 8px;
}
.dist-track {
  flex: 1;
  height: 8px;
  background: var(--bg);
  border: 1.5px solid var(--line);
  overflow: hidden;
}
.dist-fill {
  height: 100%;
  background: var(--acid);
}
.dist-c {
  font-size: 10.5px;
  color: var(--ink-2);
  width: 15px;
  text-align: right;
}

/* 态度按钮 */
.actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 9px;
  margin-top: 14px;
}
.act {
  background: var(--bg-2);
  border: 2px solid var(--line);
  border-radius: 4px;
  padding: 11px 4px 9px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: var(--ink-2);
  transition: transform 0.1s, background 0.12s, color 0.12s, border-color 0.12s;
}
.act.on {
  background: var(--acid);
  color: #000;
  border-color: #000;
  animation: pop 0.35s cubic-bezier(0.2, 1.2, 0.4, 1);
}
.act.down {
  background: var(--hot);
  color: #fff;
  border-color: #000;
}

/* 介绍 / 外卖 */
.intro,
.delivery {
  padding: 15px 17px;
  margin-top: 14px;
}
.intro h3,
.delivery h3 {
  font-size: 14.5px;
  margin-bottom: 7px;
}
.intro p {
  font-size: 13px;
  line-height: 1.8;
  color: var(--ink-2);
}
.delivery {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.delivery p {
  margin-top: 3px;
}

/* 评价 */
.rv-section-title {
  margin: 24px 2px 12px;
}
.rv-section-title h3 {
  font-size: 17px;
}
.review {
  padding: 14px 15px;
  margin-bottom: 12px;
}
.rv-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rv-avatar {
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: 4px;
  background: var(--volt);
  border: 2px solid var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}
.rv-avatar.anon {
  background: var(--bg-2);
  border-color: var(--line);
  color: var(--ink-2);
}
.rv-id {
  flex: 1;
  min-width: 0;
}
.rv-name {
  font-size: 13.5px;
  font-weight: 700;
}
.rv-id :deep(.starbar) {
  margin-top: 3px;
}
.rv-time {
  flex: none;
}
.rv-content {
  font-size: 13px;
  line-height: 1.75;
  margin: 10px 0;
}
.rv-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}
.rv-images img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border: 1.5px solid var(--line);
  border-radius: 3px;
}
.helpful {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--ink-2);
  background: var(--bg);
  border: 1.5px solid var(--line);
  border-radius: 3px;
  padding: 5px 12px;
}
.helpful.on {
  color: var(--acid);
  border-color: var(--acid);
}

/* FAB */
.fab {
  position: fixed;
  right: 16px;
  bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0) + 16px);
  z-index: 90;
  background: var(--acid);
  color: #000;
  border: 2px solid #000;
  border-radius: 4px;
  box-shadow: 4px 4px 0 #000;
  padding: 12px 18px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 13.5px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.fab:active {
  transform: translate(4px, 4px);
  box-shadow: 0 0 0 #000;
}

/* 写评价表单 */
.sheet-h {
  text-align: center;
  font-size: 16px;
  margin-bottom: 15px;
}
.write-stars {
  text-align: center;
  margin-bottom: 15px;
}
.write-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 13px 0;
}
.wi-thumb {
  position: relative;
  width: 62px;
  height: 62px;
}
.wi-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 2px solid var(--line);
  border-radius: 3px;
}
.wi-thumb button {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 22px;
  height: 22px;
  border-radius: 3px;
  background: var(--hot);
  color: #fff;
  border: 1.5px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wi-add {
  width: 62px;
  height: 62px;
  border: 2px dashed var(--line);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-2);
}
.wi-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
  color: var(--acid);
}
.anon {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ink-2);
  margin-bottom: 15px;
}
.anon input {
  width: 17px;
  height: 17px;
  accent-color: var(--acid);
}

/* 举报 */
.report-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}
.reason-chip {
  background: var(--bg);
  border: 2px solid var(--line);
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}
.reason-chip:active {
  background: var(--acid);
  color: #000;
  border-color: #000;
}

/* 图片预览 */
.img-preview {
  position: fixed;
  inset: 0;
  z-index: 700;
  background: rgba(0, 0, 0, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.img-preview img {
  max-width: 100%;
  max-height: 100%;
  border: 2px solid var(--line);
  border-radius: 4px;
}
.preview-x {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 40px;
  height: 40px;
  border: 2px solid var(--ink);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
