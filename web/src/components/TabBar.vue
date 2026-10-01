<template>
  <nav class="tabbar">
    <router-link to="/" class="tab" :class="{ on: $route.path === '/' }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
      </svg>
      <span>首页</span>
    </router-link>

    <router-link to="/search" class="tab" :class="{ on: $route.path === '/search' }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20.5 20.5-4.2-4.2" />
      </svg>
      <span>搜索</span>
    </router-link>

    <div class="tab-center">
      <router-link to="/contribute" class="center-btn"
        :class="{ on: $route.path === '/contribute' }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"
          stroke-linecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </router-link>
      <span class="center-word">投稿</span>
    </div>

    <router-link to="/profile" class="tab" :class="{ on: $route.path === '/profile' }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20.5c0-3.8 3.6-5.5 8-5.5s8 1.7 8 5.5" />
      </svg>
      <span>我的</span>
    </router-link>
  </nav>
</template>

<style scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(520px, 100%);
  height: calc(64px + env(safe-area-inset-bottom, 0));
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--line);
  z-index: 100;
}
.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--ink-3);
  font-size: 10.5px;
  font-weight: 700;
}
.tab svg {
  width: 23px;
  height: 23px;
}
.tab.on {
  color: var(--primary);
}
.tab-center {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.center-btn {
  position: absolute;
  top: -24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6a45, var(--primary-deep));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: var(--shadow-primary), inset 0 2px 3px rgba(255, 255, 255, 0.4);
  border: 4px solid #fff;
  transition: transform 0.2s;
}
.center-btn svg {
  width: 26px;
  height: 26px;
}
.center-btn:active {
  transform: scale(0.9) rotate(90deg);
}
.center-word {
  position: absolute;
  bottom: 9px;
  font-size: 10.5px;
  font-weight: 800;
  color: var(--primary);
}
</style>
