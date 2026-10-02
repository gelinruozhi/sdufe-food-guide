<template>
  <router-view />
  <TabBar v-if="$route.meta.tab" />
  <DisclaimerGate />
</template>

<script>
import TabBar from './components/TabBar.vue';
import DisclaimerGate from './components/DisclaimerGate.vue';

export default {
  components: { TabBar, DisclaimerGate },
};
</script>
