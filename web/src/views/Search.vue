<template>
  <div class="search-page">
    <header class="search-bar">
      <div class="sb-input">
        <span class="sb-ic">🔍</span>
        <input
          ref="inputEl"
          v-model="kw"
          placeholder="搜索窗口 / 菜品，如 黄焖鸡"
          @input="onInput"
          @keyup.enter="commit"
        />
        <button v-if="kw" class="sb-clear" @click="clear">×</button>
      </div>
      <button class="sb-cancel" @click="$router.back()">取消</button>
    </header>

    <!-- 未搜索：热门 + 历史 -->
    <div v-if="!kw" class="s-body">
      <div class="block">
        <h3 class="block-title">热门搜索 🔥</h3>
        <div class="tags">
          <button
            v-for="h in HOT"
            :key="h"
            class="tag press"
            @click="useTag(h)"
          >
            {{ h }}
          </button>
        </div>
      </div>

      <div v-if="hist.length" class="block">
        <div class="hist-head">
          <h3 class="block-title">搜索历史</h3>
          <button class="clear-hist" @click="clearHist">清空</button>
        </div>
        <div class="hist-list">
          <button
            v-for="h in hist"
            :key="h"
            class="hist-item"
            @click="useTag(h)"
          >
            <span>🕐</span>{{ h }}
          </button>
        </div>
      </div>
    </div>

    <!-- 结果 -->
    <div v-else class="s-body">
      <div class="type-filter">
        <button
          v-for="t in TYPES"
          :key="t.v"
          class="tf press"
          :class="{ on: type === t.v }"
          @click="type = t.v; doSearch()"
        >
          {{ t.label }}
        </button>
      </div>
      <p class="result-count muted tiny" v-if="results.length">
        找到 {{ results.length }} 个相关窗口
      </p>
      <FoodCard v-for="s in results" :key="s.id" :stall="s" />
      <Empty v-if="searched && !results.length" emoji="🔍" title="没有找到相关窗口，换个词试试" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';
import FoodCard from '../components/FoodCard.vue';
import Empty from '../components/Empty.vue';

const HOT = ['黄焖鸡', '麻辣烫', '刀削面', '螺蛳粉', '轻食', '炒鸡', '煎饼', '烤肉', '蛋包饭', '水果捞'];
const TYPES = [
  { v: '', label: '全部' },
  { v: 'inside', label: '校内' },
  { v: 'outside', label: '校外' },
];
const HIST_KEY = 'sdufe_search_hist';

export default {
  components: { FoodCard, Empty },
  setup() {
    const kw = ref('');
    const type = ref('');
    const results = ref([]);
    const searched = ref(false);
    const hist = ref(JSON.parse(localStorage.getItem(HIST_KEY) || '[]'));
    const inputEl = ref(null);

    let timer;
    function onInput() {
      clearTimeout(timer);
      timer = setTimeout(doSearch, 300);
    }

    async function doSearch() {
      if (!kw.value.trim()) {
        results.value = [];
        return;
      }
      const q = new URLSearchParams({
        keyword: kw.value.trim(),
        pageSize: '50',
      });
      if (type.value) q.set('type', type.value);
      const r = await api(`/api/stalls?${q}`);
      results.value = r.stalls;
      searched.value = true;
    }

    function commit() {
      const w = kw.value.trim();
      if (!w) return;
      hist.value = [w, ...hist.value.filter((x) => x !== w)].slice(0, 10);
      localStorage.setItem(HIST_KEY, JSON.stringify(hist.value));
    }
    function useTag(h) {
      kw.value = h;
      doSearch();
      commit();
    }
    function clear() {
      kw.value = '';
      results.value = [];
      inputEl.value?.focus();
    }
    function clearHist() {
      hist.value = [];
      localStorage.removeItem(HIST_KEY);
    }

    onMounted(() => inputEl.value?.focus());

    return {
      kw, type, results, searched, hist, inputEl, HOT, TYPES,
      onInput, doSearch, commit, useTag, clear, clearHist,
    };
  },
};
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 20;
}
.sb-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 999px;
  padding: 9px 15px;
  box-shadow: var(--shadow-card);
}
.sb-ic { font-size: 13px; }
.sb-input input { flex: 1; font-size: 14px; }
.sb-clear {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ddd;
  color: #fff;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sb-cancel { font-size: 14px; color: var(--primary); font-weight: 700; }

.s-body { padding: 6px 16px 30px; }
.block { margin-bottom: 22px; }
.block-title { font-size: 15px; font-weight: 900; margin: 10px 2px 12px; }
.tags { display: flex; flex-wrap: wrap; gap: 9px; }
.tag {
  background: #fff;
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: var(--shadow-card);
}
.hist-head { display: flex; justify-content: space-between; align-items: center; }
.clear-hist { font-size: 12px; color: var(--ink-3); }
.hist-list { display: flex; flex-direction: column; }
.hist-item {
  display: flex;
  gap: 10px;
  padding: 11px 2px;
  font-size: 14px;
  color: var(--ink-2);
  border-bottom: 1px solid var(--line);
}
.type-filter { display: flex; gap: 8px; margin: 4px 0 14px; }
.tf {
  border-radius: 999px;
  padding: 7px 18px;
  font-size: 13px;
  font-weight: 700;
  background: #fff;
  color: var(--ink-2);
  box-shadow: var(--shadow-card);
}
.tf.on { background: var(--primary); color: #fff; }
.result-count { margin: 0 2px 12px; }
</style>
