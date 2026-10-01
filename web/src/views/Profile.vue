<template>
  <div class="profile">
    <header class="pf-hero">
      <div class="pf-avatar float">🍜</div>
      <template v-if="user">
        <h1 class="pf-name">
          {{ user.nickname }}
          <span v-if="user.role === 'admin'" class="pf-badge">管理员</span>
        </h1>
        <p class="pf-user">@{{ user.username }} · 信用分 {{ user.credit_score }}</p>
      </template>
      <template v-else>
        <h1 class="pf-name">未登录</h1>
        <p class="pf-user">登录后查看你的干饭档案</p>
      </template>
    </header>

    <template v-if="user">
      <!-- 干饭数据 -->
      <div class="stats card">
        <div class="stat">
          <b>{{ counts.reviews }}</b><span>我的评价</span>
        </div>
        <div class="stat-sep" />
        <div class="stat">
          <b>{{ counts.favorites }}</b><span>我的收藏</span>
        </div>
        <div class="stat-sep" />
        <div class="stat">
          <b>{{ counts.contributions }}</b><span>我的投稿</span>
        </div>
      </div>

      <!-- 菜单 -->
      <div class="menu card">
        <router-link class="menu-item press" to="/my-reviews">
          <span class="mi-ic">💬</span>我的评价<span class="mi-arrow">›</span>
        </router-link>
        <router-link class="menu-item press" to="/favorites">
          <span class="mi-ic">⭐</span>我的收藏<span class="mi-arrow">›</span>
        </router-link>
        <router-link class="menu-item press" to="/my-contributions">
          <span class="mi-ic">📮</span>我的投稿与纠错<span class="mi-arrow">›</span>
        </router-link>
        <router-link
          v-if="user.role === 'admin'"
          class="menu-item press admin-item"
          to="/admin"
        >
          <span class="mi-ic">🛡️</span>管理审核后台<span class="mi-arrow">›</span>
        </router-link>
      </div>

      <button class="btn btn-ghost btn-block logout" @click="logout">退出登录</button>
    </template>

    <div v-else style="padding: 24px">
      <button class="btn btn-primary btn-block" @click="$router.push('/login')">
        去登录
      </button>
      <button class="btn btn-outline btn-block mt" @click="$router.push('/register')">
        没有账号，去注册
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api, setToken } from '../api.js';

export default {
  setup() {
    const router = useRouter();
    const user = ref(null);
    const counts = ref({ reviews: 0, favorites: 0, contributions: 0 });

    onMounted(async () => {
      try {
        const me = await api('/api/auth/me');
        user.value = me.user;
        const [rv, fv, ct] = await Promise.all([
          api('/api/my/reviews/list'),
          api('/api/stalls/my/favorites/list'),
          api('/api/contribute/mine'),
        ]);
        counts.value = {
          reviews: rv.reviews.length,
          favorites: fv.stalls.length,
          contributions: ct.stalls.length,
        };
      } catch {
        user.value = null;
      }
    });

    function logout() {
      setToken(null);
      user.value = null;
      router.push('/');
    }

    return { user, counts, logout };
  },
};
</script>

<style scoped>
.pf-hero {
  background: linear-gradient(160deg, #2b2118, #43342a);
  color: #fff;
  text-align: center;
  padding: 34px 20px 30px;
  border-radius: 0 0 30px 30px;
}
.pf-avatar {
  width: 82px;
  height: 82px;
  margin: 0 auto 14px;
  border-radius: 26px;
  background: linear-gradient(135deg, #ff6a45, var(--primary-deep));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  box-shadow: var(--shadow-primary);
}
.pf-name { font-size: 22px; font-weight: 900; margin: 0; color: #fff; }
.pf-badge {
  font-size: 10.5px;
  background: var(--yellow);
  color: #4a2e00;
  border-radius: 4px;
  padding: 1px 8px;
  margin-left: 7px;
  vertical-align: middle;
}
.pf-user { font-size: 12.5px; color: rgba(255, 255, 255, 0.6); margin: 7px 0 0; }

.stats {
  display: flex;
  align-items: center;
  margin: -22px 16px 0;
  position: relative;
  padding: 17px 8px;
}
.stat { flex: 1; text-align: center; }
.stat b { display: block; font-size: 22px; font-weight: 900; color: var(--primary-deep); }
.stat span { font-size: 11.5px; color: var(--ink-2); }
.stat-sep { width: 1px; height: 32px; background: var(--line); }

.menu { margin: 16px; overflow: hidden; }
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 16px;
  font-size: 14.5px;
  font-weight: 700;
  border-bottom: 1px solid var(--line);
}
.menu-item:last-child { border-bottom: none; }
.mi-ic { font-size: 20px; }
.mi-arrow { margin-left: auto; color: var(--ink-3); font-size: 22px; font-weight: 300; }
.admin-item { color: var(--primary-deep); }

.logout { margin: 4px 16px; }
.mt { margin-top: 11px; }
</style>
