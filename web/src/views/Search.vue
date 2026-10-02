<template>
  <div class="search-page">
    <header class="s-head">
      <div class="s-input">
        <Icon name="search" :size="18" class="s-ic" />
        <input
          ref="inputEl"
          v-model="kw"
          placeholder="搜窗口 / 菜品，如 黄焖鸡"
          @input="onInput"
          @keyup.enter="commit"
        />
        <button v-if="kw" class="s-clear" @click="clear">
          <Icon name="close" :size="13" />
        </button>
      </div>
    </header>

    <!-- 未搜索：热门 + 历史 -->
    <div v-if="!kw" class="s-body">
      <div class="block">
        <h3 class="blk-title">热门搜索</h3>
        <div class="tags">
          <button v-for="h in HOT" :key="h" class="tag" @click="useTag(h)">
            {{ h }}
          </button>
        </div>
      </div>

      <div v-if="hist.length" class="block">
        <div class="hist-head">
          <h3 class="blk-title">搜索历史</h3>
          <button class="clear-hist" @click="clearHist">清空</button>
        </div>
        <div class="hist-list">
          <button v-for="h in hist" :key="h" class="hist-item" @click="useTag(h)">
            <Icon name="clock" :size="16" /> <span>{{ h }}</span>
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
          class="tf"
          :class="{ on: type === t.v }"
          @click="type = t.v; doSearch()"
        >
          {{ t.label }}
        </button>
      </div>
      <p class="result-count muted tiny" v-if="results.length">
        找到 {{ results.length }} 个相关窗口
      </p>
      <FoodCard v-for="(s, i) in results" :key="s.id" :stall="s" :index="i" />
      <Empty
        v-if="searched && !results.length"
        icon="search"
        text="没有找到相关窗口，换个词试试"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';
import Icon from '../components/Icon.vue';
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
  components: { Icon, FoodCard, Empty },
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
      const q = new URLSearchParams({ keyword: kw.value.trim(), pageSize: '50' });
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
.s-head {
  padding: 14px 16px;
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(12, 12, 14, 0.9);
  border-bottom: 2px solid var(--line);
}
.s-input {
  display: flex;
  align-items: center;
  gap: 9px;
  background: var(--bg-2);
  border: 2px solid var(--line);
  border-radius: 4px;
  padding: 10px 13px;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.s-input:focus-within {
  border-color: var(--acid);
  box-shadow: 3px 3px 0 rgba(204, 255, 0, 0.3);
}
.s-ic {
  color: var(--ink-2);
  flex: none;
}
.s-input input {
  flex: 1;
  font-size: 14px;
  min-width: 0;
}
.s-clear {
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 3px;
  background: var(--hot);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.s-body {
  padding: 18px 16px 30px;
}
.block {
  margin-bottom: 26px;
}
.blk-title {
  font-size: 16px;
  margin: 4px 2px 13px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}
.tag {
  background: var(--bg-2);
  border: 2px solid var(--line);
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  transition: transform 0.08s, background 0.1s, color 0.1s, border-color 0.1s;
}
.tag:active {
  background: var(--acid);
  color: #000;
  border-color: #000;
  transform: translate(2px, 2px);
}
.hist-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.clear-hist {
  font-size: 11.5px;
  color: var(--ink-3);
}
.hist-list {
  display: flex;
  flex-direction: column;
}
.hist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 2px;
  font-size: 14px;
  color: var(--ink-2);
  border-bottom: 1.5px solid var(--line);
}
.type-filter {
  display: flex;
  gap: 9px;
  margin-bottom: 15px;
}
.tf {
  flex: 1;
  border: 2px solid var(--line);
  border-radius: 4px;
  padding: 9px;
  font-size: 13px;
  font-weight: 700;
  background: var(--bg-2);
  color: var(--ink-2);
}
.tf.on {
  background: var(--acid);
  color: #000;
  border-color: #000;
}
.result-count {
  margin: 0 2px 13px;
}
</style>
