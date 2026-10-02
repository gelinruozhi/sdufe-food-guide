<template>
  <div v-if="show" class="gate-mask">
    <div class="gate-panel">
      <div class="gate-head">
        <span class="gate-kicker">TERMS / 使用前必读</span>
        <h1 class="gate-title">内容声明</h1>
        <p class="gate-note">
          {{ mode === 'full' ? '以下为完整条款（五节），可上下滚动阅读' : '请花半分钟读完，同意后才能使用' }}
          · 生效 {{ EFFECTIVE_DATE }}
        </p>
      </div>

      <div class="gate-body" ref="bodyEl">
        <!-- 摘要视图 -->
        <template v-if="mode === 'summary'">
          <div v-for="(p, i) in GATE_POINTS" :key="i" class="gp-item">
            <span class="gp-no">{{ i + 1 }}</span>
            <p>{{ p }}</p>
          </div>

          <button class="full-link" @click="goFull">
            <Icon name="doc" :size="16" /> 查看完整条款（五节）
            <Icon name="next" :size="15" class="fl-arrow" />
          </button>
        </template>

        <!-- 完整条款视图（在弹窗内滚动，不跳页、不被遮挡） -->
        <template v-else>
          <button class="back-link" @click="goSummary">
            <Icon name="back" :size="15" /> 返回摘要
          </button>

          <div v-for="(s, i) in SECTIONS" :key="i" class="fs-sec">
            <h2 class="fs-title">{{ s.title }}</h2>
            <p v-for="(it, k) in s.items" :key="k" class="fs-item">{{ it }}</p>
          </div>

          <p class="fs-contact">问题反馈 / 侵权投诉联系：{{ CONTACT }}</p>

          <button class="full-link" @click="goSummary">
            <Icon name="back" :size="15" /> 返回摘要
          </button>
        </template>

        <p v-if="refused" class="refuse-tip">
          你需要同意本声明才能使用本平台；如不同意，可直接关闭页面。
        </p>
      </div>

      <div class="gate-foot">
        <button class="btn btn-acid btn-block" @click="agree">
          <Icon name="check" :size="17" /> 我已阅读并同意，进入
        </button>
        <button class="btn btn-ghost btn-block mt" @click="refuse">不同意</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue';
import Icon from './Icon.vue';
import {
  AGREE_VERSION, AGREE_KEY, EFFECTIVE_DATE, GATE_POINTS, SECTIONS, CONTACT,
} from '../lib/disclaimer.js';

export default {
  components: { Icon },
  setup() {
    const agreedNow =
      typeof localStorage !== 'undefined' &&
      localStorage.getItem(AGREE_KEY) === String(AGREE_VERSION);
    const show = ref(!agreedNow);
    const refused = ref(false);
    const mode = ref('summary');
    const bodyEl = ref(null);

    function resetScroll() {
      nextTick(() => {
        if (bodyEl.value) bodyEl.value.scrollTop = 0;
      });
    }
    function goFull() {
      mode.value = 'full';
      refused.value = false;
      resetScroll();
    }
    function goSummary() {
      mode.value = 'summary';
      resetScroll();
    }

    function agree() {
      localStorage.setItem(AGREE_KEY, String(AGREE_VERSION));
      show.value = false;
    }
    function refuse() {
      refused.value = true;
    }

    return {
      show, refused, mode, bodyEl,
      GATE_POINTS, SECTIONS, CONTACT, EFFECTIVE_DATE,
      goFull, goSummary, agree, refuse,
    };
  },
};
</script>

<style scoped>
.gate-mask {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}
.gate-panel {
  width: min(470px, 100%);
  max-height: 90vh;
  max-height: 90dvh;
  background: var(--surface);
  border: 2px solid var(--ink);
  border-radius: 6px;
  box-shadow: 6px 6px 0 var(--acid);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.gate-head {
  padding: 18px 18px 14px;
  border-bottom: 2px solid var(--ink);
}
.gate-kicker {
  font-family: var(--font-en);
  font-size: 11px;
  color: var(--acid);
}
.gate-title {
  font-size: 28px;
  margin: 8px 0 7px;
}
.gate-note {
  font-size: 11.5px;
  color: var(--ink-2);
}
.gate-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px 18px;
}
.gp-item {
  display: flex;
  gap: 11px;
  margin-bottom: 15px;
}
.gp-no {
  flex: none;
  width: 24px;
  height: 24px;
  background: var(--acid);
  color: #000;
  border: 1.5px solid #000;
  border-radius: 3px;
  font-family: var(--font-en);
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gp-item p {
  font-size: 13px;
  line-height: 1.7;
  margin: 1px 0 0;
  color: var(--ink-1);
}
.full-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-2);
  border: 2px solid var(--line);
  border-radius: 4px;
  padding: 11px 13px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--cyan);
}
.fl-arrow {
  margin-left: auto;
}

/* 完整条款视图 */
.back-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-2);
  border: 2px solid var(--line);
  border-radius: 4px;
  padding: 10px 13px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-1);
  margin-bottom: 18px;
}
.fs-sec {
  margin-bottom: 18px;
}
.fs-title {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 14.5px;
  font-weight: 800;
  margin: 0 0 9px;
}
.fs-title::before {
  content: '';
  width: 5px;
  height: 16px;
  background: var(--acid);
  flex: none;
}
.fs-item {
  position: relative;
  padding-left: 14px;
  font-size: 12.5px;
  line-height: 1.75;
  color: var(--ink-1);
  margin: 0 0 8px;
}
.fs-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 6px;
  height: 6px;
  background: var(--acid);
}
.fs-contact {
  font-size: 11.5px;
  color: var(--ink-2);
  border: 1.5px dashed var(--line);
  border-radius: 4px;
  padding: 9px 12px;
  margin: 4px 0 14px;
  word-break: break-all;
}

.refuse-tip {
  margin: 13px 2px 0;
  font-size: 12px;
  color: var(--hot);
  line-height: 1.6;
}
.gate-foot {
  padding: 14px 18px calc(14px + env(safe-area-inset-bottom, 0));
  border-top: 2px solid var(--ink);
}
.mt {
  margin-top: 10px;
}
</style>
