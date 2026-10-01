<template>
  <div>
    <header class="sub-header">
      <button class="sh-back press" @click="$router.back()">‹</button>
      <h1>我的评价</h1>
    </header>
    <div class="sub-body">
      <div
        v-for="rv in reviews"
        :key="rv.id"
        class="rv-card card press"
        @click="$router.push(`/stall/${rv.stall_id}`)"
      >
        <div class="rv-top">
          <span class="rv-stall">{{ rv.stall_name }}</span>
          <span class="rv-stars">{{ stars(rv.star) }}</span>
        </div>
        <p v-if="rv.content" class="rv-content muted">{{ rv.content }}</p>
        <p class="rv-time muted tiny">{{ rv.created_at }}</p>
      </div>
      <Empty v-if="!loading && !reviews.length" emoji="💬" title="还没有发表过评价">
        <button class="btn btn-primary btn-sm" @click="$router.push('/')">
          去发现美食
        </button>
      </Empty>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';
import Empty from '../components/Empty.vue';

export default {
  components: { Empty },
  setup() {
    const reviews = ref([]);
    const loading = ref(true);
    onMounted(async () => {
      try {
        const r = await api('/api/my/reviews/list');
        reviews.value = r.reviews;
      } finally {
        loading.value = false;
      }
    });
    function stars(s) {
      let o = '';
      for (let i = 1; i <= 5; i++) o += s >= i ? '★' : '☆';
      return o;
    }
    return { reviews, loading, stars };
  },
};
</script>

<style scoped>
@import './subpage.css';
.rv-card { padding: 13px 15px; margin-bottom: 11px; }
.rv-top { display: flex; justify-content: space-between; align-items: center; }
.rv-stall { font-size: 14.5px; font-weight: 900; }
.rv-stars { color: var(--yellow-deep); font-size: 13px; letter-spacing: 1px; }
.rv-content { font-size: 13px; line-height: 1.7; margin: 7px 0; }
.rv-time { margin: 0; }
</style>
