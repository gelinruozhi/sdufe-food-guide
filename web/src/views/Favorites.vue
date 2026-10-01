<template>
  <div>
    <header class="sub-header">
      <button class="sh-back press" @click="$router.back()">‹</button>
      <h1>我的收藏</h1>
    </header>
    <div class="sub-body">
      <FoodCard v-for="s in stalls" :key="s.id" :stall="s" />
      <Empty v-if="!loading && !stalls.length" emoji="⭐" title="还没有收藏窗口">
        <button class="btn btn-primary btn-sm" @click="$router.push('/search')">
          去逛逛
        </button>
      </Empty>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';
import FoodCard from '../components/FoodCard.vue';
import Empty from '../components/Empty.vue';

export default {
  components: { FoodCard, Empty },
  setup() {
    const stalls = ref([]);
    const loading = ref(true);
    onMounted(async () => {
      try {
        const r = await api('/api/stalls/my/favorites/list');
        stalls.value = r.stalls;
      } finally {
        loading.value = false;
      }
    });
    return { stalls, loading };
  },
};
</script>

<style scoped>
@import './subpage.css';
</style>
