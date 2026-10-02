<template>
  <div class="starbar" @mouseleave="hover = 0">
    <button
      v-for="n in 5"
      :key="n"
      type="button"
      class="s-btn"
      :class="{ on: n <= shown }"
      :disabled="readonly"
      @click="pick(n)"
      @mouseenter="hover = n"
    >
      <Icon
        :name="n <= shown ? 'starFill' : 'star'"
        :size="size"
        :stroke-width="2"
      />
    </button>
    <span v-if="showLabel && shown" class="s-label">{{ LABELS[shown - 1] }}</span>
  </div>
</template>

<script>
import { computed } from 'vue';
import Icon from './Icon.vue';

const LABELS = ['踩雷', '一般', '还行', '推荐', '封神'];

export default {
  name: 'StarBar',
  components: { Icon },
  props: {
    modelValue: { type: Number, default: 0 },
    readonly: { type: Boolean, default: false },
    size: { type: [Number, String], default: 26 },
    showLabel: { type: Boolean, default: false },
  },
  data: () => ({ hover: 0, LABELS }),
  computed: {
    shown() {
      return this.hover || this.modelValue;
    },
  },
  methods: {
    pick(n) {
      if (!this.readonly) this.$emit('update:modelValue', n);
    },
  },
};
</script>

<style scoped>
.starbar {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.s-btn {
  padding: 2px;
  color: var(--ink-3);
  line-height: 0;
  transition: transform 0.08s, color 0.1s;
}
.s-btn.on {
  color: var(--acid);
}
.s-btn:not(:disabled):hover {
  transform: scale(1.18) rotate(-8deg);
  color: var(--acid);
}
.s-label {
  margin-left: 8px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 13px;
  color: var(--acid);
}
</style>
