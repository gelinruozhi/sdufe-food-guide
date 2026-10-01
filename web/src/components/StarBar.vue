<template>
  <div class="starbar" @mouseleave="hover = 0">
    <button
      v-for="i in 5"
      :key="i"
      type="button"
      class="star-btn"
      :class="{ on: i <= (hover || modelValue), pop: i === lastSet }"
      :style="{ fontSize: size + 'px' }"
      @click="setStar(i)"
      @mouseenter="!readonly && (hover = i)"
    >
      ★
    </button>
    <span v-if="showText && (modelValue || hover)" class="star-word">
      {{ words[(hover || modelValue) - 1] }}
    </span>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  props: {
    modelValue: { type: Number, default: 0 },
    size: { type: Number, default: 28 },
    readonly: { type: Boolean, default: false },
    showText: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const hover = ref(0);
    const lastSet = ref(0);
    const words = ['很差', '一般', '还行', '满意', '超赞'];

    function setStar(i) {
      if (props.readonly) return;
      const v = i === props.modelValue ? 0 : i;
      lastSet.value = i;
      emit('update:modelValue', v);
      setTimeout(() => (lastSet.value = 0), 500);
    }

    return { hover, lastSet, words, setStar };
  },
};
</script>

<style scoped>
.starbar {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.star-btn {
  padding: 0;
  line-height: 1;
  color: #e4d8cb;
  transition: transform 0.15s, color 0.1s;
}
.star-btn.on {
  color: var(--yellow-deep);
  text-shadow: 0 2px 6px rgba(245, 166, 35, 0.4);
}
.star-btn:not(.readonly):active {
  transform: scale(0.8);
}
.star-btn.pop {
  animation: starPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes starPop {
  40% {
    transform: scale(1.35);
  }
}
.star-word {
  margin-left: 8px;
  font-size: 13px;
  font-weight: 800;
  color: var(--yellow-deep);
}
</style>
