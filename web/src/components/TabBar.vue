<template>
  <nav class="tabbar no-scrollbar">
    <router-link
      v-for="t in TABS"
      :key="t.to"
      :to="t.to"
      class="tab"
      :class="{ on: isActive(t), add: t.add }"
    >
      <span v-if="t.add" class="add-circle">
        <Icon name="plus" :size="24" :stroke-width="2.6" />
      </span>
      <template v-else>
        <Icon :name="t.icon" :size="22" :stroke-width="2.1" />
        <span class="tab-label">{{ t.label }}</span>
      </template>
    </router-link>
  </nav>
</template>

<script>
import { useRoute } from 'vue-router';
import Icon from './Icon.vue';

const TABS = [
  { to: '/', label: '首页', icon: 'home' },
  { to: '/search', label: '发现', icon: 'search' },
  { to: '/contribute', label: '', icon: 'plus', add: true },
  { to: '/profile', label: '我的', icon: 'user' },
];

export default {
  name: 'TabBar',
  components: { Icon },
  setup() {
    const route = useRoute();
    function isActive(t) {
      if (t.to === '/') return route.path === '/';
      return route.path.startsWith(t.to);
    }
    return { TABS, isActive };
  },
};
</script>

<style scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 520px;
  height: calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0));
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: rgba(12, 12, 14, 0.94);
  border-top: 2.5px solid var(--ink);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  z-index: 100;
}
.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--ink-3);
  position: relative;
}
.tab-label {
  font-size: 10.5px;
  font-weight: 700;
}
.tab.on {
  color: var(--acid);
}
.tab.on::before {
  content: '';
  position: absolute;
  top: 0;
  width: 30px;
  height: 4px;
  background: var(--acid);
}

/* 投稿硬边圆钮（向上突出，无渐变） */
.add-circle {
  width: 48px;
  height: 48px;
  margin-top: -20px;
  border-radius: 50%;
  background: var(--bg);
  border: 2.5px solid var(--acid);
  box-shadow: 3px 3px 0 var(--acid);
  color: var(--acid);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s, box-shadow 0.1s, background 0.12s, color 0.12s;
}
.tab.add:active .add-circle {
  transform: translate(3px, 3px);
  box-shadow: 0 0 0 var(--acid);
}
.tab.add.on .add-circle {
  background: var(--acid);
  color: var(--black);
}
</style>
