<template>
  <div>
    <header class="sub-header">
      <button class="sh-back" @click="$router.back()">
        <Icon name="back" :size="19" />
      </button>
      <h1>我的收藏</h1>
    </header>
    <div class="sub-body">
      <FoodCard v-for="(s, i) in stalls" :key="s.id" :stall="s" :index="i" />
      <Empty v-if="!loading && !stalls.length" icon="heart" text="还没有收藏窗口">
        <button class="btn btn-acid btn-sm" @click="$router.push('/search')">去逛逛</button>
      </Empty>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';
import Icon from '../components/Icon.vue';
import FoodCard from '../components/FoodCard.vue';
import Empty from '../components/Empty.vue';

export default {
  components: { Icon, FoodCard, Empty },
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
