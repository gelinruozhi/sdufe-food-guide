<template>
  <div v-if="show" class="gate-mask">
    <div class="gate-panel">
      <div class="gate-head">
        <span class="gate-kicker">TERMS / 使用前必读</span>
        <h1 class="gate-title">内容声明</h1>
        <p class="gate-note">请花半分钟读完，同意后才能使用 · 生效 {{ EFFECTIVE_DATE }}</p>
      </div>

      <div class="gate-body">
        <div v-for="(p, i) in GATE_POINTS" :key="i" class="gp-item">
          <span class="gp-no">{{ i + 1 }}</span>
          <p>{{ p }}</p>
        </div>

        <button class="full-link" @click="openFull">
          <Icon name="doc" :size="16" /> 查看完整条款（五节）
          <Icon name="next" :size="15" class="fl-arrow" />
        </button>

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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Icon from './Icon.vue';
import {
  AGREE_VERSION, AGREE_KEY, EFFECTIVE_DATE, GATE_POINTS,
} from '../lib/disclaimer.js';

export default {
  components: { Icon },
  setup() {
    const router = useRouter();
    const agreedNow =
      typeof localStorage !== 'undefined' &&
      localStorage.getItem(AGREE_KEY) === String(AGREE_VERSION);
    const show = ref(!agreedNow);
    const refused = ref(false);

    function agree() {
      localStorage.setItem(AGREE_KEY, String(AGREE_VERSION));
      show.value = false;
    }
    function refuse() {
      refused.value = true;
    }
    function openFull() {
      router.push('/disclaimer');
    }

    return {
      show, refused, GATE_POINTS, EFFECTIVE_DATE,
      agree, refuse, openFull,
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
