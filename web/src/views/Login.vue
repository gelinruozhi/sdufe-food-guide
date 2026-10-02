<template>
  <div class="auth-page">
    <button class="back" @click="$router.back()">
      <Icon name="back" :size="20" />
    </button>

    <div class="auth-logo floaty">
      <Icon name="bolt" :size="48" :stroke-width="2.4" />
    </div>
    <h1 class="auth-title">欢迎回来<br /><span class="stroke-acid">干饭人</span></h1>
    <p class="auth-sub muted">登录后评价、收藏、投稿，一起完善美食地图</p>

    <div class="auth-form">
      <div class="in-wrap">
        <Icon name="user" :size="18" class="in-ic" />
        <input v-model="username" placeholder="用户名" autocomplete="username" />
      </div>
      <div class="in-wrap">
        <Icon name="bolt" :size="18" class="in-ic" />
        <input
          v-model="password"
          type="password"
          placeholder="密码"
          autocomplete="current-password"
          @keyup.enter="login"
        />
      </div>

      <button class="btn btn-acid btn-block" :disabled="loading" @click="login">
        {{ loading ? '登录中…' : '登 录' }}
      </button>
    </div>

    <div class="quick-accounts">
      <p class="muted tiny">演示账号（点击填充）</p>
      <button class="qa-chip" @click="fill('admin', 'admin123')">管理员 admin</button>
      <button class="qa-chip" @click="fill('xiaoming', '123456')">同学 xiaoming</button>
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
import Icon from '../components/Icon.vue';

export default {
  components: { Icon },
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
  min-height: 100dvh;
  padding: 70px 24px 30px;
  text-align: center;
}
.back {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 38px;
  height: 38px;
  border: 2px solid var(--ink);
  border-radius: 4px;
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.back:active {
  background: var(--hot);
  color: #fff;
  border-color: #000;
}
.auth-logo {
  width: 88px;
  height: 88px;
  margin: 0 auto 20px;
  border-radius: 6px;
  background: var(--acid);
  border: 2px solid #000;
  box-shadow: 5px 5px 0 #000;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-title {
  font-size: 32px;
  margin: 0 0 10px;
}
.auth-sub {
  font-size: 12.5px;
  margin: 0 0 28px;
}

.auth-form {
  text-align: left;
}
.in-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-2);
  border: 2px solid var(--line);
  border-radius: 4px;
  padding: 12px 14px;
  margin-bottom: 12px;
  transition: border-color 0.12s, box-shadow 0.12s;
}
.in-wrap:focus-within {
  border-color: var(--acid);
  box-shadow: 3px 3px 0 rgba(204, 255, 0, 0.3);
}
.in-ic {
  color: var(--ink-2);
  flex: none;
}
.in-wrap input {
  flex: 1;
  font-size: 14.5px;
  min-width: 0;
}

.quick-accounts {
  margin-top: 26px;
}
.quick-accounts p {
  margin: 0 0 11px;
}
.qa-chip {
  background: var(--bg-2);
  color: var(--ink);
  border: 2px solid var(--line);
  border-radius: 4px;
  padding: 7px 15px;
  font-size: 12px;
  font-weight: 700;
  margin: 0 5px 7px;
}
.qa-chip:active {
  background: var(--acid);
  color: #000;
  border-color: #000;
}
.to-register {
  margin-top: 28px;
  font-size: 13px;
  color: var(--ink-2);
}
.to-register a {
  color: var(--acid);
  font-weight: 800;
}
</style>
