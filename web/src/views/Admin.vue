<template>
  <div class="admin">
    <header class="ad-hero">
      <button class="ad-back press" @click="$router.back()">‹</button>
      <h1 class="display-title">管理审核</h1>
      <p>审核投稿、处理纠错与举报，维护社区内容</p>
    </header>

    <div v-if="forbidden" class="forbid card">
      <span class="fb-emoji">🛡️</span>
      <p>仅管理员可访问<br />请使用 admin 账号登录</p>
      <button class="btn btn-primary btn-sm" @click="$router.push('/login')">
        去登录
      </button>
    </div>

    <template v-else>
      <!-- Tabs -->
      <div class="ad-tabs no-scrollbar">
        <button
          v-for="(t, i) in TABS"
          :key="t.k"
          class="ad-tab"
          :class="{ on: active === i }"
          @click="active = i"
        >
          {{ t.label }}
          <span v-if="badge(t.k)" class="tab-badge">{{ badge(t.k) }}</span>
        </button>
      </div>

      <div class="ad-body">
        <!-- 概览 -->
        <div v-if="active === 0" class="stat-grid">
          <div v-for="(v, k) in stats" :key="k" class="stat-box card">
            <b>{{ v }}</b><span>{{ STAT_LABELS[k] }}</span>
          </div>
        </div>

        <!-- 待审窗口 -->
        <template v-if="active === 1">
          <div v-for="s in pending" :key="s.id" class="audit card">
            <div class="au-head">
              <span class="au-emoji" :style="{ background: foodMeta(s.category).gradient }">
                {{ foodMeta(s.category).emoji }}
              </span>
              <div class="au-id">
                <b>{{ s.name }}</b>
                <span class="muted tiny">
                  {{ s.stall_type === 'inside' ? '校内' : '校外' }} · {{ s.category }} ·
                  ¥{{ s.avg_price }} · {{ s.creator_name }} 投稿
                </span>
              </div>
            </div>
            <p v-if="s.description" class="au-desc">{{ s.description }}</p>
            <p v-if="s.address" class="au-desc muted">地址：{{ s.address }}</p>
            <div class="au-btns">
              <button class="btn btn-sm approve" @click="approve(s)">✓ 通过</button>
              <button class="btn btn-sm reject" @click="reject(s)">✕ 驳回</button>
            </div>
          </div>
          <Empty v-if="!pending.length" emoji="✅" title="暂无待审核投稿" />
        </template>

        <!-- 纠错 -->
        <template v-if="active === 2">
          <div v-for="c in corrections" :key="c.id" class="audit card">
            <b class="au-name">{{ c.stall_name }}</b>
            <p class="au-desc">字段「{{ c.field_name }}」建议改为：{{ c.suggestion }}</p>
            <p class="muted tiny">{{ c.user_name }} · {{ c.created_at }}</p>
            <div class="au-btns">
              <button class="btn btn-sm approve" @click="handleCorrection(c, 'accept')">
                采纳
              </button>
              <button class="btn btn-sm ghost" @click="handleCorrection(c, 'ignore')">
                忽略
              </button>
            </div>
          </div>
          <Empty v-if="!corrections.length" emoji="📝" title="暂无待处理纠错" />
        </template>

        <!-- 举报 -->
        <template v-if="active === 3">
          <div v-for="rp in reports" :key="rp.id" class="audit card">
            <b class="au-name">
              举报{{ rp.target_type === 'stall' ? '窗口' : '评价' }} #{{ rp.target_id }}
            </b>
            <p class="au-desc">原因：{{ rp.reason }}</p>
            <p class="muted tiny">{{ rp.user_name }} · {{ rp.created_at }}</p>
            <div class="au-btns">
              <button class="btn btn-sm reject" @click="handleReport(rp, 'remove')">
                下架 / 隐藏
              </button>
              <button class="btn btn-sm ghost" @click="handleReport(rp, 'ignore')">
                忽略
              </button>
            </div>
          </div>
          <Empty v-if="!reports.length" emoji="🚩" title="暂无待处理举报" />
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api } from '../api.js';
import { foodMeta } from '../lib/foodMeta.js';
import { toast } from '../lib/toast.js';
import Empty from '../components/Empty.vue';

const TABS = [
  { k: 'overview', label: '概览' },
  { k: 'pending', label: '待审' },
  { k: 'corrections', label: '纠错' },
  { k: 'reports', label: '举报' },
];
const STAT_LABELS = [
  '注册用户', '已收录窗口', '待审核', '评价总数', '待处理纠错', '待处理举报',
];

export default {
  components: { Empty },
  setup() {
    const active = ref(0);
    const forbidden = ref(false);
    const stats = ref({});
    const pending = ref([]);
    const corrections = ref([]);
    const reports = ref([]);

    async function load() {
      try {
        const [s, p, c, r] = await Promise.all([
          api('/api/admin/stats'),
          api('/api/admin/pending-stalls'),
          api('/api/admin/corrections'),
          api('/api/admin/reports'),
        ]);
        stats.value = Object.values(s.stats);
        pending.value = p.stalls;
        corrections.value = c.corrections;
        reports.value = r.reports;
      } catch {
        forbidden.value = true;
      }
    }
    onMounted(load);

    function badge(k) {
      if (k === 'pending') return pending.value.length;
      if (k === 'corrections') return corrections.value.length;
      if (k === 'reports') return reports.value.length;
      return 0;
    }

    async function approve(s) {
      await api(`/api/admin/stalls/${s.id}/approve`, { method: 'POST' });
      toast.success('已通过，信用分 +2');
      await load();
    }
    async function reject(s) {
      await api(`/api/admin/stalls/${s.id}/reject`, { method: 'POST', body: {} });
      toast('已驳回');
      await load();
    }
    async function handleCorrection(c, action) {
      await api(`/api/admin/corrections/${c.id}/handle`, {
        method: 'POST',
        body: { action },
      });
      toast.success(action === 'accept' ? '已采纳' : '已忽略');
      await load();
    }
    async function handleReport(rp, action) {
      await api(`/api/admin/reports/${rp.id}/handle`, {
        method: 'POST',
        body: { action },
      });
      toast.success('处理完成');
      await load();
    }

    return {
      TABS, STAT_LABELS, active, forbidden, stats, pending, corrections, reports,
      foodMeta, badge, approve, reject, handleCorrection, handleReport,
    };
  },
};
</script>

<style scoped>
.ad-hero {
  background: linear-gradient(160deg, #2b2118, #43342a);
  color: #fff;
  padding: 22px 20px 26px;
  border-radius: 0 0 28px 28px;
}
.ad-back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 3px;
}
.ad-hero h1 { font-size: 28px; margin: 14px 0 6px; color: #fff; }
.ad-hero p { font-size: 12.5px; margin: 0; opacity: 0.7; }

.forbid { margin: 24px 16px; padding: 34px 20px; text-align: center; }
.fb-emoji { font-size: 44px; display: block; margin-bottom: 10px; }
.forbid p { font-size: 13px; color: var(--ink-2); line-height: 1.8; margin: 0 0 16px; }

.ad-tabs {
  display: flex;
  gap: 8px;
  padding: 16px 16px 4px;
  overflow-x: auto;
}
.ad-tab {
  flex: none;
  background: #fff;
  border-radius: 999px;
  padding: 9px 17px;
  font-size: 13px;
  font-weight: 800;
  color: var(--ink-2);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 6px;
}
.ad-tab.on { background: var(--primary); color: #fff; }
.tab-badge {
  background: var(--primary-soft);
  color: var(--primary-deep);
  border-radius: 999px;
  font-size: 10.5px;
  padding: 0 7px;
  min-width: 18px;
}
.ad-tab.on .tab-badge { background: rgba(255, 255, 255, 0.25); color: #fff; }

.ad-body { padding: 14px 16px 34px; }
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.stat-box { text-align: center; padding: 18px 6px; }
.stat-box b { display: block; font-size: 23px; color: var(--primary-deep); }
.stat-box span { font-size: 11px; color: var(--ink-2); }

.audit { padding: 14px 16px; margin-bottom: 11px; }
.au-head { display: flex; align-items: center; gap: 11px; }
.au-emoji {
  width: 48px;
  height: 48px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
  flex: none;
}
.au-id { flex: 1; min-width: 0; }
.au-id b { font-size: 15px; display: block; }
.au-name { font-size: 15px; }
.au-desc { font-size: 12.5px; line-height: 1.7; margin: 9px 0 0; }
.au-btns { display: flex; gap: 9px; margin-top: 13px; }
.approve { background: var(--green); color: #fff; }
.reject { background: var(--primary); color: #fff; }
.ghost { background: #f2f3f5; color: var(--ink-2); }
</style>
