<template>
  <div class="empty">
    <span class="emoji">{{ emoji }}</span>
    <p>{{ title }}</p>
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    emoji: { type: String, default: '🍽️' },
    title: { type: String, default: '这里还空空如也' },
  },
};
</script>
