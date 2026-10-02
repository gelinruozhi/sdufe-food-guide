<template>
  <div class="food-art" :style="{ background: meta.bg }">
    <span class="fa-dots" :style="{ backgroundImage: dots(meta.fg) }" />
    <Icon
      class="fa-icon"
      :name="meta.icon"
      :size="iconSize"
      :stroke-width="strokeWidth"
      :style="{ color: meta.fg }"
    />
    <Icon
      class="fa-spark"
      name="sparkle"
      :size="sparkSize"
      :style="{ color: meta.fg }"
    />
  </div>
</template>

<script>
import { computed } from 'vue';
import { foodMeta } from '../lib/foodMeta.js';
import Icon from './Icon.vue';

export default {
  name: 'FoodArt',
  components: { Icon },
  props: {
    category: { type: String, default: '' },
    iconSize: { type: [Number, String], default: 46 },
    sparkSize: { type: [Number, String], default: 15 },
    strokeWidth: { type: [Number, String], default: 2.2 },
  },
  setup(props) {
    const meta = computed(() => foodMeta(props.category));
    // 半色调网点（用图标色，低透明）
    const dots = (fg) =>
      `radial-gradient(${fg === '#fff' ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.10)'} 1px, transparent 1.5px)`;
    return { meta, dots };
  },
};
</script>

<style scoped>
.food-art {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.fa-dots {
  position: absolute;
  inset: 0;
  background-size: 9px 9px;
  pointer-events: none;
}
.fa-icon {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.12));
}
.fa-spark {
  position: absolute;
  right: 9px;
  bottom: 9px;
  opacity: 0.55;
  z-index: 1;
}
</style>
