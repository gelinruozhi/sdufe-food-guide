<template>
  <div>
    <header class="sub-header">
      <button class="sh-back" @click="$router.back()">
        <Icon name="back" :size="19" />
      </button>
      <h1>我的评价</h1>
    </header>
    <div class="sub-body">
      <div
        v-for="rv in reviews"
        :key="rv.id"
        class="rv-card panel"
        @click="$router.push(`/stall/${rv.stall_id}`)"
      >
        <div class="rv-top">
          <span class="rv-stall">{{ rv.stall_name }}</span>
          <StarBar :model-value="rv.star" readonly :size="14" />
        </div>
        <p v-if="rv.content" class="rv-content muted">{{ rv.content }}</p>
        <p class="rv-time muted tiny">{{ rv.created_at }}</p>
      </div>
      <Empty v-if="!loading && !reviews.length" icon="chat" text="还没有发表过评价">
        <button class="btn btn-acid btn-sm" @click="$router.push('/')">去发现美食</button>
      </Empty>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';
import Icon from '../components/Icon.vue';
import StarBar from '../components/StarBar.vue';
import Empty from '../components/Empty.vue';

export default {
  components: { Icon, StarBar, Empty },
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
    return { reviews, loading };
  },
};
</script>

<style scoped>
@import './subpage.css';
.rv-card {
  padding: 13px 15px;
  margin-bottom: 12px;
}
.rv-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.rv-stall {
  font-size: 14.5px;
  font-weight: 800;
  font-family: var(--font-display);
}
.rv-content {
  font-size: 13px;
  line-height: 1.7;
  margin: 9px 0 7px;
}
.rv-time {
  margin: 0;
}
</style>
