<template>
  <span class="star-wrap">
    <template v-if="interactive">
      <span
        v-for="i in 5"
        :key="i"
        class="star-btn"
        :class="{ on: i <= modelValue }"
        @click="$emit('update:modelValue', i)"
      >★</span>
    </template>
    <template v-else>
      <span class="stars-gold">{{ text }}</span>
    </template>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  interactive: { type: Boolean, default: false },
  // 只读时可传精确分值
  score: { type: Number, default: 0 },
});
defineEmits(['update:modelValue']);

const text = computed(() => {
  const s = props.modelValue || props.score || 0;
  let out = '';
  for (let i = 1; i <= 5; i++) {
    if (s >= i) out += '★';
    else if (s >= i - 0.5) out += '☆';
    else out += '☆';
  }
  return out;
});
</script>

<style scoped>
.star-btn {
  font-size: 26px;
  color: #dcdee0;
  margin-right: 6px;
  cursor: pointer;
}
.star-btn.on { color: #ffb400; }
</style>
