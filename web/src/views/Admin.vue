<template>
  <div>
    <van-nav-bar title="管理审核后台" left-arrow @click-left="$router.back()" />

    <div v-if="forbidden" class="empty-box">
      仅管理员可访问<br>请使用 admin 账号登录
    </div>

    <template v-else>
      <van-tabs v-model:active="active" sticky color="#c0392b">
        <!-- 概览 -->
        <van-tab title="概览">
          <div class="page">
            <div class="stat-grid">
              <div class="stat-item"><b>{{ stats.users }}</b><span>注册用户</span></div>
              <div class="stat-item"><b>{{ stats.stalls_approved }}</b><span>已收录窗口</span></div>
              <div class="stat-item"><b>{{ stats.stalls_pending }}</b><span>待审核</span></div>
              <div class="stat-item"><b>{{ stats.reviews }}</b><span>评价总数</span></div>
              <div class="stat-item"><b>{{ stats.corrections_pending }}</b><span>待处理纠错</span></div>
              <div class="stat-item"><b>{{ stats.reports_pending }}</b><span>待处理举报</span></div>
            </div>
          </div>
        </van-tab>

        <!-- 待审窗口 -->
        <van-tab :title="`待审 (${pending.length})`">
          <div class="page">
            <div v-for="s in pending" :key="s.id" class="audit-card">
              <div class="a-name">
                {{ s.name }}
                <span class="a-type">{{ s.stall_type === 'inside' ? '校内' : '校外' }}</span>
              </div>
              <p class="muted a-meta">
                {{ s.category }} · 人均 ¥{{ s.avg_price }} · 投稿人 {{ s.creator_name }}
              </p>
              <p class="a-desc" v-if="s.description">{{ s.description }}</p>
              <p class="a-desc muted" v-if="s.address">地址：{{ s.address }}</p>
              <div class="a-btns">
                <van-button size="small" type="success" round @click="approve(s)">通过</van-button>
                <van-button size="small" type="danger" plain round @click="reject(s)">驳回</van-button>
              </div>
            </div>
            <div v-if="!pending.length" class="empty-box">暂无待审核投稿</div>
          </div>
        </van-tab>

        <!-- 纠错 -->
        <van-tab :title="`纠错 (${corrections.length})`">
          <div class="page">
            <div v-for="c in corrections" :key="c.id" class="audit-card">
              <div class="a-name">{{ c.stall_name }}</div>
              <p class="a-desc">字段「{{ c.field_name }}」建议改为：{{ c.suggestion }}</p>
              <p class="muted a-meta">{{ c.user_name }} · {{ c.created_at }}</p>
              <div class="a-btns">
                <van-button size="small" type="success" round @click="handleCorrection(c,'accept')">
                  采纳
                </van-button>
                <van-button size="small" plain round @click="handleCorrection(c,'ignore')">
                  忽略
                </van-button>
              </div>
            </div>
            <div v-if="!corrections.length" class="empty-box">暂无待处理纠错</div>
          </div>
        </van-tab>

        <!-- 举报 -->
        <van-tab :title="`举报 (${reports.length})`">
          <div class="page">
            <div v-for="rp in reports" :key="rp.id" class="audit-card">
              <div class="a-name">
                举报{{ rp.target_type === 'stall' ? '窗口' : '评价' }} #{{ rp.target_id }}
              </div>
              <p class="a-desc">原因：{{ rp.reason }}</p>
              <p class="muted a-meta">{{ rp.user_name }} · {{ rp.created_at }}</p>
              <div class="a-btns">
                <van-button size="small" type="danger" round @click="handleReport(rp,'remove')">
                  下架/隐藏
                </van-button>
                <van-button size="small" plain round @click="handleReport(rp,'ignore')">
                  忽略
                </van-button>
              </div>
            </div>
            <div v-if="!reports.length" class="empty-box">暂无待处理举报</div>
          </div>
        </van-tab>
      </van-tabs>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { showSuccessToast, showToast } from 'vant';
import { api } from '../api.js';

export default {
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
        stats.value = s.stats;
        pending.value = p.stalls;
        corrections.value = c.corrections;
        reports.value = r.reports;
      } catch (e) {
        forbidden.value = true;
      }
    }
    onMounted(load);

    async function approve(s) {
      await api(`/api/admin/stalls/${s.id}/approve`, { method: 'POST' });
      showSuccessToast('已通过');
      await load();
    }
    async function reject(s) {
      await api(`/api/admin/stalls/${s.id}/reject`, { method: 'POST', body: {} });
      showToast('已驳回');
      await load();
    }
    async function handleCorrection(c, action) {
      await api(`/api/admin/corrections/${c.id}/handle`, { method: 'POST', body: { action } });
      showSuccessToast(action === 'accept' ? '已采纳' : '已忽略');
      await load();
    }
    async function handleReport(rp, action) {
      await api(`/api/admin/reports/${rp.id}/handle`, { method: 'POST', body: { action } });
      showSuccessToast('处理完成');
      await load();
    }

    return {
      active, forbidden, stats, pending, corrections, reports,
      approve, reject, handleCorrection, handleReport,
    };
  },
};
</script>

<style scoped>
.stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.stat-item {
  background: #fff;
  border-radius: 8px;
  text-align: center;
  padding: 16px 6px;
}
.stat-item b { display: block; font-size: 22px; color: #c0392b; }
.stat-item span { font-size: 11.5px; color: #969799; }
.audit-card { background: #fff; border-radius: 8px; padding: 13px 15px; margin-bottom: 10px; }
.a-name { font-size: 15px; font-weight: 700; }
.a-type { font-size: 10.5px; background: #f2f3f5; border-radius: 3px; padding: 0 6px; margin-left: 6px; }
.a-meta { font-size: 12px; margin-top: 3px; }
.a-desc { font-size: 12.5px; line-height: 1.7; margin-top: 6px; }
.a-btns { display: flex; gap: 10px; margin-top: 11px; }
</style>
