<template>
  <div class="admin">
    <header class="ad-hero">
      <button class="ad-back" @click="$router.back()">
        <Icon name="back" :size="20" />
      </button>
      <span class="ad-kicker">ADMIN / 审核</span>
      <h1 class="ad-title">管理审核</h1>
      <p>审核投稿、处理纠错与举报，维护社区内容</p>
      <Icon name="sparkle" :size="18" class="ad-deco floaty" />
    </header>

    <div v-if="forbidden" class="forbid panel">
      <span class="fb-icon"><Icon name="shield" :size="38" /></span>
      <p>仅管理员可访问<br />请使用 admin 账号登录</p>
      <button class="btn btn-acid btn-sm" @click="$router.push('/login')">去登录</button>
    </div>

    <template v-else>
      <!-- Tabs -->
      <div class="ad-tabs no-scrollbar">
        <button
          v-for="(t, i) in tabs"
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
          <div v-for="(v, k) in stats" :key="k" class="stat-box panel">
            <b>{{ v }}</b><span>{{ STAT_LABELS[k] }}</span>
          </div>
        </div>

        <!-- 待审窗口 -->
        <template v-if="active === 1">
          <div v-for="s in pending" :key="s.id" class="audit panel">
            <div class="au-head">
              <span class="au-art">
                <FoodArt :category="s.category" icon-size="26" spark-size="8" :stroke-width="2.4" />
              </span>
              <div class="au-id">
                <b>{{ s.name }}</b>
                <span class="muted tiny">
                  {{ s.stall_type === 'inside' ? '校内' : '校外' }} · {{ s.category }} ·
                  ￥{{ s.avg_price }} · {{ s.creator_name }} 投稿
                </span>
              </div>
            </div>
            <p v-if="s.description" class="au-desc">{{ s.description }}</p>
            <p v-if="s.address" class="au-desc muted">地址：{{ s.address }}</p>
            <div class="au-btns">
              <button class="btn btn-sm btn-acid" @click="approve(s)">
                <Icon name="check" :size="14" /> 通过
              </button>
              <button class="btn btn-sm btn-hot" @click="reject(s)">
                <Icon name="close" :size="14" /> 驳回
              </button>
            </div>
          </div>
          <Empty v-if="!pending.length" icon="check" text="暂无待审核投稿" />
        </template>

        <!-- 纠错 -->
        <template v-if="active === 2">
          <div v-for="c in corrections" :key="c.id" class="audit panel">
            <b class="au-name">{{ c.stall_name }}</b>
            <p class="au-desc">字段「{{ c.field_name }}」建议改为：{{ c.suggestion }}</p>
            <p class="muted tiny">{{ c.user_name }} · {{ c.created_at }}</p>
            <div class="au-btns">
              <button class="btn btn-sm btn-acid" @click="handleCorrection(c, 'accept')">采纳</button>
              <button class="btn btn-sm btn-ghost" @click="handleCorrection(c, 'ignore')">忽略</button>
            </div>
          </div>
          <Empty v-if="!corrections.length" icon="edit" text="暂无待处理纠错" />
        </template>

        <!-- 举报 -->
        <template v-if="active === 3">
          <div v-for="rp in reports" :key="rp.id" class="audit panel">
            <b class="au-name">
              举报{{ rp.target_type === 'stall' ? '窗口' : '评价' }} #{{ rp.target_id }}
            </b>
            <p class="au-desc">原因：{{ rp.reason }}</p>
            <p class="muted tiny">{{ rp.user_name }} · {{ rp.created_at }}</p>
            <div class="au-btns">
              <button class="btn btn-sm btn-hot" @click="handleReport(rp, 'remove')">
                下架 / 隐藏
              </button>
              <button class="btn btn-sm btn-ghost" @click="handleReport(rp, 'ignore')">忽略</button>
            </div>
          </div>
          <Empty v-if="!reports.length" icon="flag" text="暂无待处理举报" />
        </template>

        <!-- 意见反馈 -->
        <template v-if="active === 4">
          <div v-for="f in feedback" :key="f.id" class="audit panel fb-audit">
            <div class="au-head">
              <span class="fb-avatar"><Icon name="user" :size="22" /></span>
              <div class="au-id">
                <b>{{ f.user_name || '未登录用户' }}</b>
                <span class="muted tiny">
                  {{ typeText(f.type) }} · {{ f.created_at }}
                  <template v-if="f.contact"> · {{ f.contact }}</template>
                </span>
              </div>
              <span class="fb-state" :class="f.status">
                {{ f.status === 'handled' ? '已处理' : '待处理' }}
              </span>
            </div>
            <p class="au-desc fb-content">{{ f.content }}</p>
            <div v-if="f.images.length" class="fb-imgs">
              <img
                v-for="(im, k) in f.images"
                :key="k"
                :src="im"
                loading="lazy"
                decoding="async"
                @click="openImg(im)"
              />
            </div>
            <div v-if="f.reply" class="fb-old-reply">已回复：{{ f.reply }}</div>
            <textarea
              v-if="f.status === 'pending'"
              v-model="replyDrafts[f.id]"
              class="fb-reply-input"
              rows="2"
              maxlength="500"
              placeholder="回复内容（可选，会展示给该同学）"
            />
            <div class="au-btns">
              <button
                v-if="f.status === 'pending'"
                class="btn btn-sm btn-acid"
                @click="handleFeedback(f, true)"
              >
                <Icon name="check" :size="13" /> 回复并处理
              </button>
              <button
                v-if="f.status === 'pending'"
                class="btn btn-sm btn-ghost"
                @click="handleFeedback(f, false)"
              >
                仅标记已处理
              </button>
              <button
                v-if="f.status === 'handled'"
                class="btn btn-sm btn-ghost"
                @click="reopenFeedback(f)"
              >
                重新打开
              </button>
            </div>
          </div>
          <Empty v-if="!feedback.length" icon="chat" text="暂无反馈" />
        </template>

        <!-- 管理员管理（仅根管理员） -->
        <template v-if="active === 5">
          <div class="am-promote panel">
            <b class="ap-title">添加普通管理员</b>
            <p class="muted tiny ap-note">
              输入已注册同学的用户名。提升后其可进入管理审核、处理内容，但不能再管理其他管理员。
            </p>
            <div class="ap-row">
              <input
                v-model="promoteName"
                class="ap-input"
                placeholder="用户名，如 xiaoming"
                maxlength="20"
                @keyup.enter="promote"
              />
              <button class="btn btn-acid btn-sm" @click="promote">添加</button>
            </div>
          </div>

          <div v-for="a in admins" :key="a.id" class="am-row panel">
            <div class="ar-info">
              <b>{{ a.nickname || a.username }}</b>
              <span class="muted tiny">
                @{{ a.username }} · {{ a.role === 'root' ? '根管理员' : '普通管理员' }}
              </span>
            </div>
            <button v-if="a.role === 'admin'" class="btn btn-sm btn-hot" @click="demote(a)">
              撤销管理员
            </button>
            <span v-else class="ar-root-tag">ROOT</span>
          </div>
          <Empty v-if="!admins.length" icon="user" text="暂无管理员数据" />
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { api } from '../api.js';
import { toast } from '../lib/toast.js';
import Icon from '../components/Icon.vue';
import FoodArt from '../components/FoodArt.vue';
import Empty from '../components/Empty.vue';

const TABS = [
  { k: 'overview', label: '概览' },
  { k: 'pending', label: '待审' },
  { k: 'corrections', label: '纠错' },
  { k: 'reports', label: '举报' },
  { k: 'feedback', label: '反馈' },
];
const STAT_LABELS = [
  '注册用户', '已收录窗口', '待审核', '评价总数', '待处理纠错', '待处理举报',
];

export default {
  components: { Icon, FoodArt, Empty },
  setup() {
    const active = ref(0);
    const forbidden = ref(false);
    const stats = ref([]);
    const pending = ref([]);
    const corrections = ref([]);
    const reports = ref([]);
    const feedback = ref([]);
    const replyDrafts = reactive({});
    const myRole = ref('');
    const admins = ref([]);
    const promoteName = ref('');
    const tabs = computed(() =>
      myRole.value === 'root' ? [...TABS, { k: 'admins', label: '管理员' }] : TABS,
    );
    const TYPE_TEXT = {
      suggestion: '产品建议',
      bug: '问题 / Bug',
      content: '内容问题',
      other: '其他',
    };
    function typeText(v) {
      return TYPE_TEXT[v] || '其他';
    }
    function openImg(url) {
      window.open(url, '_blank');
    }

    async function load() {
      try {
        const [s, p, c, r, fb, me] = await Promise.all([
          api('/api/admin/stats'),
          api('/api/admin/pending-stalls'),
          api('/api/admin/corrections'),
          api('/api/admin/reports'),
          api('/api/admin/feedback'),
          api('/api/auth/me'),
        ]);
        stats.value = Object.values(s.stats);
        pending.value = p.stalls;
        corrections.value = c.corrections;
        reports.value = r.reports;
        feedback.value = fb.feedback;
        myRole.value = me.user.role;
        if (me.user.role === 'root') {
          try {
            const a = await api('/api/admin/admins');
            admins.value = a.admins;
          } catch {
            admins.value = [];
          }
        }
      } catch {
        forbidden.value = true;
      }
    }
    onMounted(load);

    function badge(k) {
      if (k === 'pending') return pending.value.length;
      if (k === 'corrections') return corrections.value.length;
      if (k === 'reports') return reports.value.length;
      if (k === 'feedback')
        return feedback.value.filter((x) => x.status === 'pending').length;
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

    async function handleFeedback(f, withReply) {
      const reply = withReply ? replyDrafts[f.id] || '' : '';
      await api(`/api/admin/feedback/${f.id}/handle`, {
        method: 'POST',
        body: { reply },
      });
      toast.success('已处理');
      await load();
    }
    async function reopenFeedback(f) {
      await api(`/api/admin/feedback/${f.id}/handle`, {
        method: 'POST',
        body: { action: 'reopen' },
      });
      toast('已重新打开');
      await load();
    }

    async function promote() {
      const username = promoteName.value.trim();
      if (!username) {
        toast.fail('请输入用户名');
        return;
      }
      try {
        await api('/api/admin/admins/promote', {
          method: 'POST',
          body: { username },
        });
        toast.success('已添加为管理员');
        promoteName.value = '';
        await load();
      } catch (e) {
        toast.fail((e.data && e.data.error) || e.message);
      }
    }
    async function demote(a) {
      try {
        await api(`/api/admin/admins/${a.id}/demote`, {
          method: 'POST',
          body: {},
        });
        toast('已撤销管理员');
        await load();
      } catch (e) {
        toast.fail((e.data && e.data.error) || e.message);
      }
    }

    return {
      TABS, STAT_LABELS, active, forbidden, stats, pending, corrections, reports,
      feedback, replyDrafts, tabs, myRole, admins, promoteName,
      badge, approve, reject, handleCorrection, handleReport,
      typeText, openImg, handleFeedback, reopenFeedback, promote, demote,
    };
  },
};
</script>

<style scoped>
/* Hero */
.ad-hero {
  position: relative;
  padding: 20px 20px 24px;
  border-bottom: 2.5px solid var(--ink);
  overflow: hidden;
}
.ad-back {
  width: 38px;
  height: 38px;
  border: 2px solid var(--ink);
  border-radius: 4px;
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}
.ad-back:active {
  background: var(--hot);
  color: #fff;
  border-color: #000;
}
.ad-kicker {
  font-family: var(--font-en);
  font-size: 11px;
  color: var(--acid);
}
.ad-title {
  font-size: 30px;
  margin: 9px 0 7px;
}
.ad-hero p {
  font-size: 12.5px;
  color: var(--ink-2);
}
.ad-deco {
  position: absolute;
  right: 28px;
  top: 34px;
  color: var(--cyan);
}

.forbid {
  margin: 24px 16px;
  padding: 34px 20px;
  text-align: center;
}
.fb-icon {
  display: flex;
  justify-content: center;
  color: var(--acid);
  margin-bottom: 12px;
}
.forbid p {
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.8;
  margin: 0 0 16px;
}

/* Tabs */
.ad-tabs {
  display: flex;
  gap: 8px;
  padding: 16px 16px 2px;
  overflow-x: auto;
}
.ad-tab {
  flex: none;
  background: var(--bg-2);
  border: 2px solid var(--line);
  border-radius: 4px;
  padding: 9px 15px;
  font-size: 13px;
  font-weight: 800;
  font-family: var(--font-display);
  color: var(--ink-2);
  display: flex;
  align-items: center;
  gap: 7px;
}
.ad-tab.on {
  background: var(--acid);
  color: #000;
  border-color: #000;
  box-shadow: 3px 3px 0 #000;
}
.tab-badge {
  background: var(--hot);
  color: #fff;
  border: 1.5px solid #000;
  border-radius: 2px;
  font-size: 10px;
  padding: 0 6px;
  min-width: 17px;
  line-height: 15px;
  text-align: center;
}
.ad-tab.on .tab-badge {
  background: #000;
  color: var(--acid);
}

.ad-body {
  padding: 14px 16px 30px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.stat-box {
  text-align: center;
  padding: 17px 6px;
}
.stat-box b {
  display: block;
  font-family: var(--font-en);
  font-size: 22px;
  color: var(--acid);
}
.stat-box span {
  font-size: 10.5px;
  color: var(--ink-2);
}

.audit {
  padding: 14px 15px;
  margin-bottom: 12px;
}
.au-head {
  display: flex;
  align-items: center;
  gap: 11px;
}
.au-art {
  width: 46px;
  height: 46px;
  flex: none;
  border: 2px solid #000;
  border-radius: 3px;
  overflow: hidden;
}
.au-id {
  flex: 1;
  min-width: 0;
}
.au-id b {
  font-size: 15px;
  display: block;
}
.au-name {
  font-size: 15px;
}
.au-desc {
  font-size: 12.5px;
  line-height: 1.7;
  margin: 10px 0 0;
}
.au-btns {
  display: flex;
  gap: 9px;
  margin-top: 14px;
}
.au-btns .btn {
  flex: 1;
}

/* 意见反馈 */
.fb-avatar {
  width: 40px;
  height: 40px;
  flex: none;
  border: 2px solid #000;
  border-radius: 3px;
  background: var(--bg-2);
  color: var(--acid);
  display: flex;
  align-items: center;
  justify-content: center;
}
.fb-state {
  flex: none;
  align-self: flex-start;
  font-size: 11px;
  font-weight: 800;
}
.fb-state.pending {
  color: var(--orange);
}
.fb-state.handled {
  color: var(--acid);
}
.fb-content {
  white-space: pre-wrap;
  word-break: break-word;
}
.fb-imgs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0 0;
}
.fb-imgs img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border: 1.5px solid var(--ink);
  border-radius: 3px;
}
.fb-old-reply {
  margin-top: 11px;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--ink-1);
  border-left: 4px solid var(--cyan);
  background: var(--bg-2);
  border-radius: 0 3px 3px 0;
  padding: 8px 11px;
}
.fb-reply-input {
  width: 100%;
  box-sizing: border-box;
  margin-top: 12px;
  background: var(--bg-2);
  border: 2px solid var(--line);
  border-radius: 4px;
  color: var(--ink);
  font-size: 13px;
  font-family: inherit;
  line-height: 1.6;
  padding: 9px 11px;
  resize: vertical;
}
.fb-reply-input:focus {
  border-color: var(--acid);
  outline: none;
}

/* 管理员管理 */
.am-promote {
  margin: 0 0 14px;
  padding: 15px 16px;
}
.ap-title {
  font-size: 15px;
}
.ap-note {
  line-height: 1.7;
  margin: 8px 0 13px;
}
.ap-row {
  display: flex;
  gap: 9px;
}
.ap-input {
  flex: 1;
  min-width: 0;
  background: var(--bg-2);
  border: 2px solid var(--line);
  border-radius: 4px;
  color: var(--ink);
  font-size: 13px;
  font-family: inherit;
  padding: 9px 11px;
}
.ap-input:focus {
  border-color: var(--acid);
  outline: none;
}
.ap-row .btn {
  flex: none;
}
.am-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 15px;
  margin-bottom: 11px;
}
.ar-info {
  min-width: 0;
}
.ar-info b {
  font-size: 14px;
  display: block;
}
.ar-info span {
  display: block;
  margin-top: 3px;
}
.ar-root-tag {
  flex: none;
  font-family: var(--font-en);
  font-size: 11px;
  font-weight: 800;
  color: var(--acid);
  border: 1.5px solid var(--line);
  border-radius: 2px;
  padding: 3px 9px;
}
</style>
