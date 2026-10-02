<template>
  <div class="empty">
    <div class="empty-icon floaty">
      <Icon :name="icon" :size="30" :stroke-width="2" />
    </div>
    <p class="empty-text">{{ text }}</p>
    <slot />
  </div>
</template>

<script>
import Icon from './Icon.vue';

export default {
  name: 'Empty',
  components: { Icon },
  props: {
    text: { type: String, default: '这里还什么都没有' },
    icon: { type: String, default: 'inbox' },
  },
};
</script>

<style scoped>
.empty {
  padding: 54px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  background: var(--bg-2);
  border: 2px solid var(--acid);
  box-shadow: 4px 4px 0 var(--acid);
  color: var(--acid);
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-text {
  color: var(--ink-2);
  font-size: 13.5px;
}
</style>
