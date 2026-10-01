<template>
  <div>
    <van-nav-bar title="我的评价" left-arrow @click-left="$router.back()" />
    <div class="page">
      <div
        v-for="rv in reviews"
        :key="rv.id"
        class="rv-card"
        @click="$router.push(`/stall/${rv.stall_id}`)"
      >
        <div class="rv-top">
          <span class="rv-stall">{{ rv.stall_name }}</span>
          <span class="stars-gold">{{ starText(rv.star) }}</span>
        </div>
        <p class="rv-content muted" v-if="rv.content">{{ rv.content }}</p>
        <p class="rv-time muted">{{ rv.created_at }}</p>
      </div>
      <div v-if="!reviews.length" class="empty-box">还没有发表过评价</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';

export default {
  setup() {
    const reviews = ref([]);
    onMounted(async () => {
      const r = await api('/api/my/reviews/list');
      reviews.value = r.reviews;
    });
    function starText(s) {
      let out = '';
      for (let i = 1; i <= 5; i++) out += s >= i ? '★' : '☆';
      return out;
    }
    return { reviews, starText };
  },
};
</script>

<style scoped>
.rv-card { background: #fff; border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; }
.rv-top { display: flex; justify-content: space-between; align-items: center; }
.rv-stall { font-size: 14.5px; font-weight: 700; }
.rv-content { font-size: 13px; margin: 7px 0; line-height: 1.7; }
.rv-time { font-size: 11.5px; }
</style>
