<template>
  <teleport to="body">
    <div v-if="open" class="sheet-mask" @click.self="close">
      <div class="sheet">
        <div class="sheet-head">
          <span class="sheet-title">{{ title }}</span>
          <button class="sheet-x" @click="close">
            <Icon name="close" :size="18" />
          </button>
        </div>
        <div class="sheet-body">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import Icon from './Icon.vue';

export default {
  name: 'Sheet',
  components: { Icon },
  props: {
    open: { type: Boolean, default: false },
    title: { type: String, default: '' },
  },
  emits: ['close', 'update:open'],
  methods: {
    close() {
      this.$emit('close');
      this.$emit('update:open', false);
    },
  },
};
</script>

<style scoped>
.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.62);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: mask-in 0.18s ease both;
}
@keyframes mask-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.sheet {
  width: 100%;
  max-width: 520px;
  max-height: 86vh;
  background: var(--bg-2);
  border: 2px solid var(--ink);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -6px 0 var(--acid);
  display: flex;
  flex-direction: column;
  animation: sheet-up 0.26s cubic-bezier(0.2, 1.1, 0.4, 1) both;
}
@keyframes sheet-up {
  from {
    transform: translateY(60px);
  }
  to {
    transform: translateY(0);
  }
}
.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 2px solid var(--line);
}
.sheet-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 15px;
}
.sheet-x {
  width: 30px;
  height: 30px;
  border: 2px solid var(--ink);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
}
.sheet-x:active {
  background: var(--hot);
  color: #fff;
  border-color: var(--black);
}
.sheet-body {
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
