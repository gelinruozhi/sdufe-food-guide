<template>
  <router-view />
  <TabBar v-if="$route.meta.tab" />
</template>

<script>
import TabBar from './components/TabBar.vue';

export default {
  components: { TabBar },
};
</script>
