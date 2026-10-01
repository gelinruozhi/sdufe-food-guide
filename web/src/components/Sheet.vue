<template>
  <teleport to="body">
    <transition name="sheet-fade">
      <div v-if="modelValue" class="sheet-mask" @click="close">
        <transition name="sheet-up" appear>
          <div v-if="modelValue" class="sheet-panel" @click.stop>
            <div class="sheet-grip" />
            <div v-if="title" class="sheet-title">{{ title }}</div>
            <slot />
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    function close() {
      emit('update:modelValue', false);
    }
    return { close };
  },
};
</script>

<style scoped>
.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(36, 26, 18, 0.45);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.sheet-panel {
  width: min(520px, 100%);
  background: var(--bg);
  border-radius: 26px 26px 0 0;
  padding: 10px 18px calc(26px + env(safe-area-inset-bottom, 0));
  max-height: 86vh;
  overflow-y: auto;
}
.sheet-grip {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #ddcfc0;
  margin: 4px auto 12px;
}
.sheet-title {
  font-size: 17px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 14px;
}
.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.25s;
}
.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}
.sheet-up-enter-active,
.sheet-up-leave-active {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.sheet-up-enter-from,
.sheet-up-leave-to {
  transform: translateY(100%);
}
</style>
