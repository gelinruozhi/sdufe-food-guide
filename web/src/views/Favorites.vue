<template>
  <div>
    <van-nav-bar title="我的收藏" left-arrow @click-left="$router.back()" />
    <div class="page">
      <StallCard v-for="s in stalls" :key="s.id" :stall="s" />
      <div v-if="!stalls.length" class="empty-box">还没有收藏窗口</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';
import StallCard from '../components/StallCard.vue';

export default {
  components: { StallCard },
  setup() {
    const stalls = ref([]);
    onMounted(async () => {
      const r = await api('/api/stalls/my/favorites/list');
      stalls.value = r.stalls;
    });
    return { stalls };
  },
};
</script>
