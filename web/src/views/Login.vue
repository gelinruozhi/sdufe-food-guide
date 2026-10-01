<template>
  <div class="auth-page">
    <button class="back press" @click="$router.back()">‹</button>

    <div class="auth-logo float">🍜</div>
    <h1 class="auth-title display-title">欢迎回来<br />干饭人</h1>
    <p class="auth-sub muted">登录后评价、收藏、投稿，一起完善美食地图</p>

    <div class="auth-form">
      <div class="input-row">
        <span>👤</span>
        <input v-model="username" placeholder="用户名" autocomplete="username" />
      </div>
      <div class="input-row">
        <span>🔑</span>
        <input
          v-model="password"
          type="password"
          placeholder="密码"
          autocomplete="current-password"
          @keyup.enter="login"
        />
      </div>

      <button
        class="btn btn-primary btn-block"
        :disabled="loading"
        @click="login"
      >
        {{ loading ? '登录中…' : '登 录' }}
      </button>
    </div>

    <div class="quick-accounts">
      <p class="muted tiny">演示账号（点击填充）</p>
      <button class="qa-chip press" @click="fill('admin', 'admin123')">
        管理员 admin
      </button>
      <button class="qa-chip press" @click="fill('xiaoming', '123456')">
        同学 xiaoming
      </button>
    </div>

    <p class="to-register">
      还没有账号？<router-link to="/register">立即注册</router-link>
    </p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api, setToken } from '../api.js';
import { toast } from '../lib/toast.js';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    const username = ref('');
    const password = ref('');
    const loading = ref(false);

    function fill(u, p) {
      username.value = u;
      password.value = p;
    }

    async function login() {
      if (!username.value || !password.value) {
        toast.fail('请输入用户名和密码');
        return;
      }
      loading.value = true;
      try {
        const r = await api('/api/auth/login', {
          method: 'POST',
          body: { username: username.value, password: password.value },
        });
        setToken(r.token);
        toast.success('登录成功');
        router.replace(route.query.redirect || '/');
      } catch (e) {
        toast.fail(e.message);
      } finally {
        loading.value = false;
      }
    }

    return { username, password, loading, login, fill };
  },
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  padding: 70px 26px 30px;
  text-align: center;
}
.back {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--shadow-card);
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 4px;
}
.auth-logo {
  width: 92px;
  height: 92px;
  margin: 0 auto 18px;
  border-radius: 28px;
  background: linear-gradient(135deg, #ff6a45, var(--primary-deep));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  box-shadow: var(--shadow-primary);
}
.auth-title { font-size: 30px; margin: 0 0 10px; }
.auth-sub { font-size: 12.5px; margin: 0 0 30px; }

.auth-form { text-align: left; }
.input-row {
  display: flex;
  align-items: center;
  gap: 11px;
  background: #fff;
  border-radius: var(--r-sm);
  box-shadow: var(--shadow-card);
  padding: 14px 16px;
  margin-bottom: 13px;
}
.input-row span { font-size: 18px; }
.input-row input { flex: 1; font-size: 15px; }

.quick-accounts { margin-top: 26px; }
.quick-accounts p { margin: 0 0 10px; }
.qa-chip {
  background: var(--primary-soft);
  color: var(--primary-deep);
  border-radius: 999px;
  padding: 7px 16px;
  font-size: 12px;
  font-weight: 800;
  margin: 0 5px;
}
.to-register { margin-top: 30px; font-size: 13px; color: var(--ink-2); }
.to-register a { color: var(--primary); font-weight: 800; }
</style>
