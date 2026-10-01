<template>
  <div>
    <van-nav-bar title="我的投稿" left-arrow @click-left="$router.back()" />
    <div class="page">
      <div class="block-title">窗口投稿</div>
      <div v-for="s in stalls" :key="s.id" class="con-card">
        <div class="con-top">
          <span class="con-name">{{ s.name }}</span>
          <span class="status" :class="s.status">{{ statusText(s.status) }}</span>
        </div>
        <p class="muted" style="font-size:12px;">{{ s.category }} · {{ s.created_at }}</p>
      </div>
      <div v-if="!stalls.length" class="empty-box">还没有窗口投稿</div>

      <div class="block-title">纠错记录</div>
      <div v-for="c in corrections" :key="c.id" class="con-card">
        <div class="con-top">
          <span class="con-name">{{ c.stall_name }} · {{ c.field_name }}</span>
          <span class="status" :class="c.status">{{ statusText(c.status) }}</span>
        </div>
        <p class="muted" style="font-size:12px;">建议：{{ c.suggestion }}</p>
      </div>
      <div v-if="!corrections.length" class="empty-box">还没有纠错记录</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';

export default {
  setup() {
    const stalls = ref([]);
    const corrections = ref([]);
    onMounted(async () => {
      const r = await api('/api/contribute/mine');
      stalls.value = r.stalls;
      corrections.value = r.corrections;
    });
    function statusText(s) {
      return { pending: '审核中', approved: '已通过', rejected: '已驳回',
        accepted: '已采纳', ignored: '未采纳' }[s] || s;
    }
    return { stalls, corrections, statusText };
  },
};
</script>

<style scoped>
.block-title { font-size: 14px; font-weight: 700; margin: 14px 4px 10px; }
.con-card { background: #fff; border-radius: 8px; padding: 11px 14px; margin-bottom: 9px; }
.con-top { display: flex; justify-content: space-between; align-items: center; }
.con-name { font-size: 13.5px; font-weight: 700; }
.status { font-size: 11.5px; padding: 1px 8px; border-radius: 3px; }
.status.pending { background: #fff7e8; color: #ed6a0c; }
.status.approved, .status.accepted { background: #e8f7ef; color: #2f7d5b; }
.status.rejected, .status.ignored { background: #f7f8fa; color: #969799; }
</style>
