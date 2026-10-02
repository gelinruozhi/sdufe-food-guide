<template>
  <div>
    <header class="sub-header">
      <button class="sh-back" @click="$router.back()">
        <Icon name="back" :size="19" />
      </button>
      <h1>我的投稿</h1>
    </header>

    <div class="sub-body">
      <h2 class="list-title"><Icon name="inbox" :size="18" /> 窗口投稿</h2>
      <div v-for="s in stalls" :key="s.id" class="con-card panel">
        <div class="con-top">
          <span class="con-name">{{ s.name }}</span>
          <span class="con-status" :class="s.status">{{ statusText(s.status) }}</span>
        </div>
        <p class="muted tiny con-meta">{{ s.category }} · {{ s.created_at }}</p>
      </div>
      <Empty v-if="!stalls.length" icon="location" text="还没有窗口投稿" />

      <h2 class="list-title"><Icon name="edit" :size="18" /> 纠错记录</h2>
      <div v-for="c in corrections" :key="c.id" class="con-card panel">
        <div class="con-top">
          <span class="con-name">{{ c.stall_name }} · {{ c.field_name }}</span>
          <span class="con-status" :class="c.status">{{ statusText(c.status) }}</span>
        </div>
        <p class="muted tiny con-meta">建议：{{ c.suggestion }}</p>
      </div>
      <Empty v-if="!corrections.length" icon="edit" text="还没有纠错记录" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';
import Icon from '../components/Icon.vue';
import Empty from '../components/Empty.vue';

export default {
  components: { Icon, Empty },
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
.con-card {
  padding: 12px 15px;
  margin-bottom: 11px;
}
.con-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.con-name {
  font-size: 14px;
  font-weight: 800;
  font-family: var(--font-display);
  min-width: 0;
}
.con-meta {
  margin: 6px 0 0;
}
.con-status {
  flex: none;
  font-size: 10.5px;
  font-weight: 800;
  border-radius: 3px;
  padding: 3px 10px;
  border: 2px solid var(--line);
  color: var(--ink-2);
}
.con-status.pending {
  border-color: var(--orange);
  color: var(--orange);
}
.con-status.approved,
.con-status.accepted {
  background: var(--acid);
  color: #000;
  border-color: #000;
}
.con-status.rejected,
.con-status.ignored {
  background: var(--bg-2);
  color: var(--ink-3);
  border-color: var(--line);
}
</style>
