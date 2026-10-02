<template>
  <div class="sk-card">
    <div class="sk-art skeleton" />
    <div class="sk-body">
      <div class="skeleton sk-line w80" />
      <div class="skeleton sk-line w50" />
      <div class="skeleton sk-line w65" />
    </div>
  </div>
</template>

<script>
export default { name: 'SkeletonCard' };
</script>

<style scoped>
.sk-card {
  display: flex;
  overflow: hidden;
  margin-bottom: 13px;
  border-radius: 4px;
  border: 2px solid var(--line);
  background: var(--bg-2);
}
.sk-art {
  width: 100px;
  height: 96px;
  flex: none;
  border: none;
  border-radius: 0;
}
.sk-body {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sk-line {
  height: 13px;
  border: none;
}
.w80 {
  width: 80%;
}
.w65 {
  width: 65%;
}
.w50 {
  width: 50%;
}
</style>
