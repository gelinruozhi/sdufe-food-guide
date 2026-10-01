<template>
  <div v-if="stall">
    <van-nav-bar title="窗口详情" left-arrow @click-left="$router.back()" />

    <!-- 封面与基本信息 -->
    <div class="cover-big" :style="{ background: coverBg }">
      <img v-if="stall.cover" :src="stall.cover" alt="">
      <span v-else class="big-char">{{ stall.name.charAt(0) }}</span>
    </div>

    <div class="info-card">
      <div class="title-row">
        <h2>{{ stall.name }}</h2>
        <span v-if="stall.stall_type === 'outside'" class="tag-out">校外</span>
      </div>
      <div class="sub-row">
        <span>{{ stall.category }}</span>
        <span class="price" v-if="stall.avg_price">人均 ¥{{ stall.avg_price }}</span>
      </div>
      <p class="desc">{{ stall.description }}</p>
      <p class="hours muted">营业时间：{{ stall.business_hours || '以现场为准' }}</p>

      <!-- 校外信息 -->
      <template v-if="stall.stall_type === 'outside'">
        <van-cell title="地址" :value="stall.address || '—'" />
        <van-cell title="电话" is-link v-if="stall.phone" @click="callPhone" />
        <van-cell title="电话" value="—" v-else />
        <div class="dl-box" v-if="stall.delivery_supported">
          <div class="dl-title">支持外卖 · {{ stall.delivery_platform }}</div>
          <div class="dl-meta muted">
            起送 ¥{{ stall.min_order || '—' }} · 配送费 ¥{{ stall.delivery_fee || '—' }}
          </div>
          <van-button size="small" type="warning" round @click="goDelivery">
            去 {{ stall.delivery_platform }} 点单
          </van-button>
        </div>
      </template>
    </div>

    <!-- 评分 -->
    <div class="rate-card">
      <div class="rate-left">
        <div class="big-score">{{ stall.rating_avg ? stall.rating_avg.toFixed(1) : '—' }}</div>
        <div class="stars-gold">{{ starsText }}</div>
        <div class="muted" style="font-size:11.5px;">{{ stall.rating_count }} 条评价</div>
      </div>
      <div class="dist">
        <div v-for="i in 5" :key="i" class="dist-row">
          <span class="d-star">{{ 6 - i }} ★</span>
          <div class="bar"><div class="bar-in" :style="{ width: distWidth(6 - i) }"></div></div>
          <span class="d-count">{{ stall.distribution[6 - i] }}</span>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <van-grid :column-num="4" class="action-grid">
      <van-grid-item icon="thumb-up-o" :text="`赞 ${stall.upvotes}`" @click="vote(1)"
        :class="{ active: stall.my_vote === 1 }" />
      <van-grid-item icon="thumb-down-o" :text="`踩 ${stall.downvotes}`" @click="vote(-1)"
        :class="{ active: stall.my_vote === -1 }" />
      <van-grid-item :icon="stall.my_favorite ? 'star' : 'star-o'" text="收藏"
        @click="toggleFavorite" />
      <van-grid-item icon="warning-o" text="举报" @click="reportShow = true" />
    </van-grid>

    <!-- 评价区 -->
    <div class="section-title" style="padding:0 12px;">
      全部评价
      <van-button size="mini" type="danger" round @click="openReview">写评价</van-button>
    </div>
    <div class="review-list">
      <div v-for="rv in reviews" :key="rv.id" class="review-item">
        <div class="rv-head">
          <span class="rv-name">{{ rv.nickname }}</span>
          <span class="stars-gold rv-stars">{{ starText(rv.star) }}</span>
        </div>
        <p class="rv-content" v-if="rv.content">{{ rv.content }}</p>
        <div class="rv-images" v-if="rv.images.length">
          <van-image
            v-for="(img, idx) in rv.images"
            :key="idx"
            :src="img"
            width="82"
            height="82"
            fit="cover"
            radius="4"
            @click="preview(rv.images, idx)"
          />
        </div>
        <div class="rv-foot">
          <span class="muted">{{ rv.created_at }}</span>
          <span class="helpful" :class="{ on: rv.my_useful }" @click="toggleHelpful(rv)">
            有用 {{ rv.helpful_count }}
          </span>
        </div>
      </div>
      <div v-if="!reviews.length" class="empty-box">还没有评价，来当第一个分享的人</div>
    </div>

    <!-- 写评价弹窗 -->
    <van-popup v-model:show="reviewShow" position="bottom" round :style="{ maxHeight: '88%' }">
      <div class="review-form">
        <h3>评价这个窗口</h3>
        <div class="form-stars">
          <StarRating interactive v-model="form.star" />
        </div>
        <van-field
          v-model="form.content"
          type="textarea"
          rows="3"
          maxlength="500"
          show-word-limit
          placeholder="说说味道、分量、出餐速度……"
        />
        <van-uploader v-model="fileList" multiple :max-count="6" :after-read="onUpload"
          accept="image/*" />
        <van-cell center title="匿名发布">
          <template #right-icon>
            <van-switch v-model="form.anonymous" size="22" />
          </template>
        </van-cell>
        <van-button type="danger" block round @click="submitReview">发布评价</van-button>
      </div>
    </van-popup>

    <!-- 举报弹窗 -->
    <van-dialog
      v-model:show="reportShow"
      title="举报该窗口"
      show-cancel-button
      @confirm="submitReport"
    >
      <van-field v-model="reportReason" placeholder="请填写举报原因" style="margin:8px 16px;" />
    </van-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showSuccessToast, showImagePreview } from 'vant';
import { api, getToken, uploadImage } from '../api.js';
import StarRating from '../components/StarRating.vue';

export default {
  components: { StarRating },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const stall = ref(null);
    const reviews = ref([]);
    const reviewShow = ref(false);
    const reportShow = ref(false);
    const reportReason = ref('');
    const fileList = ref([]);
    const form = ref({ star: 5, content: '', anonymous: false, images: [] });

    const PALETTES = [
      'linear-gradient(135deg,#f6d365,#fda085)',
      'linear-gradient(135deg,#fbc2eb,#a6c1ee)',
      'linear-gradient(135deg,#ffecd2,#fcb69f)',
      'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
      'linear-gradient(135deg,#d4fc79,#96e6a1)',
    ];
    const coverBg = computed(() => {
      if (!stall.value) return '#eee';
      let h = 0;
      for (const ch of stall.value.name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      return PALETTES[h % PALETTES.length];
    });

    const starsText = computed(() => starText(stall.value ? stall.value.rating_avg : 0));
    function starText(s) {
      let out = '';
      for (let i = 1; i <= 5; i++) out += s >= i - 0.5 ? '★' : '☆';
      return out;
    }
    function distWidth(star) {
      const total = stall.value.rating_count || 0;
      if (!total) return '0%';
      return ((stall.value.distribution[star] / total) * 100).toFixed(1) + '%';
    }

    async function load() {
      const d = await api(`/api/stalls/${route.params.id}`);
      stall.value = d.stall;
      const r = await api(`/api/stalls/${route.params.id}/reviews`);
      reviews.value = r.reviews;
    }
    onMounted(load);

    function needLogin() {
      if (!getToken()) {
        showToast('请先登录');
        router.push('/login');
        return true;
      }
      return false;
    }

    async function vote(v) {
      if (needLogin()) return;
      const next = stall.value.my_vote === v ? 0 : v;
      const r = await api(`/api/stalls/${stall.value.id}/vote`, {
        method: 'POST', body: { vote: next },
      });
      stall.value.upvotes = r.upvotes;
      stall.value.downvotes = r.downvotes;
      stall.value.my_vote = next;
    }

    async function toggleFavorite() {
      if (needLogin()) return;
      const r = await api(`/api/stalls/${stall.value.id}/favorite`, { method: 'POST' });
      stall.value.my_favorite = r.favorite;
      showToast(r.favorite ? '已收藏' : '已取消收藏');
    }

    function openReview() {
      if (needLogin()) return;
      form.value = { star: 5, content: '', anonymous: false, images: [] };
      fileList.value = [];
      reviewShow.value = true;
    }

    async function onUpload(item) {
      try {
        const url = await uploadImage(item.file);
        form.value.images.push(url);
      } catch (e) {
        showToast(e.message);
      }
    }

    async function submitReview() {
      if (!form.value.star) return showToast('请选择星级');
      await api(`/api/stalls/${stall.value.id}/reviews`, {
        method: 'POST', body: form.value,
      });
      reviewShow.value = false;
      showSuccessToast('评价已发布');
      await load();
    }

    async function toggleHelpful(rv) {
      if (needLogin()) return;
      const r = await api(`/api/reviews/${rv.id}/helpful`, { method: 'POST' });
      rv.my_useful = r.helpful;
      rv.helpful_count += r.helpful ? 1 : -1;
    }

    function preview(images, idx) {
      showImagePreview({ images, startPosition: idx });
    }

    async function submitReport() {
      if (needLogin()) return;
      if (!reportReason.value) return showToast('请填写原因');
      await api('/api/reports', {
        method: 'POST',
        body: { target_type: 'stall', target_id: stall.value.id, reason: reportReason.value },
      });
      showSuccessToast('举报已提交，管理员将复核');
      reportReason.value = '';
    }

    function callPhone() {
      location.href = 'tel:' + stall.value.phone;
    }
    function goDelivery() {
      showToast(`请在${stall.value.delivery_platform}搜索「${stall.value.name}」`);
    }

    return {
      stall, reviews, coverBg, starsText, starText, distWidth,
      vote, toggleFavorite, openReview, reviewShow, form, fileList, onUpload,
      submitReview, toggleHelpful, preview, reportShow, reportReason, submitReport,
      callPhone, goDelivery,
    };
  },
};
</script>

<style scoped>
.cover-big { height: 170px; display: flex; align-items: center; justify-content: center; }
.cover-big img { width: 100%; height: 100%; object-fit: cover; }
.big-char { font-size: 72px; color: rgba(255,255,255,0.9); font-weight: 800; }
.info-card { background: #fff; padding: 14px 15px 10px; margin-bottom: 10px; }
.title-row { display: flex; align-items: center; gap: 8px; }
.title-row h2 { font-size: 20px; font-weight: 700; }
.tag-out { font-size: 10px; color: #fff; background: #7232dd; border-radius: 3px; padding: 1px 6px; }
.sub-row { display: flex; gap: 14px; margin-top: 6px; font-size: 13px; color: #646566; }
.desc { font-size: 13px; color: #323233; margin-top: 10px; line-height: 1.7; }
.hours { font-size: 12px; margin-top: 8px; }
.dl-box { background: #fff8f2; border-radius: 6px; padding: 11px 13px; margin-top: 10px; }
.dl-title { font-size: 13.5px; font-weight: 700; color: #ed6a0c; }
.dl-meta { font-size: 12px; margin: 4px 0 9px; }
.rate-card {
  background: #fff;
  border-radius: 8px;
  margin: 0 12px 10px;
  padding: 15px;
  display: flex;
  gap: 16px;
}
.rate-left { text-align: center; flex: none; width: 96px; }
.big-score { font-size: 30px; font-weight: 800; }
.dist { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
.dist-row { display: flex; align-items: center; gap: 7px; font-size: 11.5px; }
.d-star { width: 28px; color: #969799; }
.bar { flex: 1; height: 7px; background: #f2f3f5; border-radius: 4px; overflow: hidden; }
.bar-in { height: 100%; background: #ffb400; border-radius: 4px; }
.d-count { width: 18px; text-align: right; color: #969799; }
.action-grid { margin: 0 12px 6px; border-radius: 8px; overflow: hidden; }
:deep(.active .van-grid-item__text) { color: #c0392b; }
.section-title { display: flex; justify-content: space-between; align-items: center; margin: 14px 0 10px; }
.review-list { padding: 0 12px; }
.review-item { background: #fff; border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; }
.rv-head { display: flex; justify-content: space-between; align-items: center; }
.rv-name { font-size: 13.5px; font-weight: 700; }
.rv-stars { font-size: 12px; }
.rv-content { font-size: 13px; line-height: 1.7; margin: 7px 0; }
.rv-images { display: flex; gap: 7px; flex-wrap: wrap; margin: 7px 0; }
.rv-foot { display: flex; justify-content: space-between; align-items: center; font-size: 12px; margin-top: 4px; }
.helpful { color: #969799; }
.helpful.on { color: #c0392b; }
.review-form { padding: 18px 16px 24px; }
.review-form h3 { text-align: center; margin-bottom: 14px; }
.form-stars { text-align: center; margin-bottom: 10px; }
.review-form .van-button { margin-top: 14px; }
</style>
