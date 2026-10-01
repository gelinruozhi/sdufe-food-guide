<template>
  <div>
    <header class="sub-header">
      <button class="sh-back press" @click="$router.back()">‹</button>
      <h1>我的投稿</h1>
    </header>

    <div class="sub-body">
      <h2 class="list-title">窗口投稿 📮</h2>
      <div v-for="s in stalls" :key="s.id" class="con-card card">
        <div class="con-top">
          <span class="con-name">{{ s.name }}</span>
          <span class="con-status" :class="s.status">{{ statusText(s.status) }}</span>
        </div>
        <p class="muted tiny con-meta">{{ s.category }} · {{ s.created_at }}</p>
      </div>
      <Empty v-if="!stalls.length" emoji="🏪" title="还没有窗口投稿" />

      <h2 class="list-title">纠错记录 📝</h2>
      <div v-for="c in corrections" :key="c.id" class="con-card card">
        <div class="con-top">
          <span class="con-name">{{ c.stall_name }} · {{ c.field_name }}</span>
          <span class="con-status" :class="c.status">{{ statusText(c.status) }}</span>
        </div>
        <p class="muted tiny con-meta">建议：{{ c.suggestion }}</p>
      </div>
      <Empty v-if="!corrections.length" emoji="📝" title="还没有纠错记录" />
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
    const stalls = ref([]);
    const corrections = ref([]);

    onMounted(async () => {
      const r = await api('/api/contribute/mine');
      stalls.value = r.stalls;
      corrections.value = r.corrections;
    });

    function statusText(s) {
      return (
        {
          pending: '审核中',
          approved: '已通过',
          rejected: '已驳回',
          accepted: '已采纳',
          ignored: '未采纳',
        }[s] || s
      );
    }

    return { stalls, corrections, statusText };
  },
};
</script>

<style scoped>
@import './subpage.css';
.list-title { font-size: 15px; font-weight: 900; margin: 16px 2px 11px; }
.con-card { padding: 12px 15px; margin-bottom: 10px; }
.con-top { display: flex; justify-content: space-between; align-items: center; }
.con-name { font-size: 14px; font-weight: 800; }
.con-meta { margin: 5px 0 0; }
.con-status {
  font-size: 11px;
  font-weight: 800;
  border-radius: 999px;
  padding: 3px 11px;
}
.con-status.pending { background: #fff3df; color: #ed6a0c; }
.con-status.approved,
.con-status.accepted { background: var(--green-soft); color: var(--green); }
.con-status.rejected,
.con-status.ignored { background: #f2f3f5; color: #969799; }
</style>
