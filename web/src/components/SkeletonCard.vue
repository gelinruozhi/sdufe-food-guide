<template>
  <div class="sk-card card">
    <div class="skeleton sk-cover" />
    <div class="sk-body">
      <div class="skeleton sk-line" style="width: 70%; height: 15px" />
      <div class="skeleton sk-line" style="width: 48%; height: 12px" />
      <div class="skeleton sk-line" style="width: 88%; height: 12px" />
    </div>
  </div>
</template>

<style scoped>
.sk-card {
  display: flex;
  overflow: hidden;
  margin-bottom: 12px;
  border-radius: var(--r-md);
}
.sk-cover {
  width: 108px;
  height: 104px;
  border-radius: 0;
}
.sk-body {
  flex: 1;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.sk-line {
  border-radius: 6px;
}
</style>
