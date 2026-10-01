<template>
  <div>
    <van-nav-bar title="搜索窗口" left-arrow @click-left="$router.back()" />
    <van-search
      v-model="keyword"
      show-action
      placeholder="窗口名 / 品类 / 描述"
      @search="search"
      @clear="search"
    >
      <template #action>
        <span @click="search">搜索</span>
      </template>
    </van-search>

    <van-dropdown-menu active-color="#c0392b">
      <van-dropdown-item v-model="sort" :options="sortOptions" @change="search" />
      <van-dropdown-item v-model="type" :options="typeOptions" @change="search" />
    </van-dropdown-menu>

    <van-dropdown-menu active-color="#c0392b">
      <van-dropdown-item v-model="category" :options="categoryOptions" @change="search" />
    </van-dropdown-menu>

    <div class="page">
      <p class="result-count muted" v-if="loaded">共找到 {{ stalls.length }} 个窗口</p>
      <StallCard v-for="s in stalls" :key="s.id" :stall="s" />
      <div v-if="loaded && !stalls.length" class="empty-box">
        没有找到相关窗口<br><span @click="$router.push('/contribute')" style="color:#c0392b;">点我投稿补充</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api.js';
import StallCard from '../components/StallCard.vue';

export default {
  components: { StallCard },
  setup() {
    const route = useRoute();
    const keyword = ref('');
    const sort = ref(route.query.sort === 'price_asc' ? 1
      : route.query.sort === 'price_desc' ? 2
      : route.query.sort === 'newest' ? 3 : 0);
    const type = ref(0);
    const category = ref(0);
    const stalls = ref([]);
    const loaded = ref(false);

    const sortOptions = [
      { text: '综合评分排序', value: 0 },
      { text: '价格从低到高', value: 1 },
      { text: '价格从高到低', value: 2 },
      { text: '最新收录', value: 3 },
    ];
    const typeOptions = [
      { text: '全部窗口', value: 0 },
      { text: '仅校内', value: 1 },
      { text: '仅校外', value: 2 },
    ];
    const CATS = ['全部', '盖浇饭', '面食', '麻辣烫', '米线', '小吃', '轻食', '早餐', '卤味', '米饭'];
    const categoryOptions = CATS.map((c, i) => ({ text: c, value: i }));

    async function search() {
      const params = new URLSearchParams();
      const sortMap = ['bayes', 'price_asc', 'price_desc', 'newest'];
      params.set('sort', sortMap[sort.value]);
      if (type.value === 1) params.set('type', 'inside');
      if (type.value === 2) params.set('type', 'outside');
      if (category.value > 0) params.set('category', CATS[category.value]);
      if (keyword.value) params.set('keyword', keyword.value);
      params.set('pageSize', '50');
      const r = await api(`/api/stalls?${params.toString()}`);
      stalls.value = r.stalls;
      loaded.value = true;
    }

    onMounted(search);
    return {
      keyword, sort, type, category, stalls, loaded, search,
      sortOptions, typeOptions, categoryOptions,
    };
  },
};
</script>

<style scoped>
.result-count { font-size: 12px; margin: 2px 4px 10px; }
</style>
