<template>
  <div class="auth-page">
    <button class="back press" @click="$router.back()">‹</button>

    <div class="auth-logo float">🎁</div>
    <h1 class="auth-title display-title">加入山财<br />美食共建</h1>
    <p class="auth-sub muted">注册即可评价、收藏、投稿新窗口</p>

    <div class="auth-form">
      <div class="input-row">
        <span>👤</span>
        <input v-model="username" placeholder="用户名（3-20 位字母数字）" />
      </div>
      <div class="input-row">
        <span>🏷️</span>
        <input v-model="nickname" placeholder="昵称（选填）" />
      </div>
      <div class="input-row">
        <span>🔑</span>
        <input v-model="password" type="password" placeholder="密码（至少 6 位）" />
      </div>
      <div class="input-row">
        <span>🔒</span>
        <input
          v-model="confirm"
          type="password"
          placeholder="确认密码"
          @keyup.enter="register"
        />
      </div>

      <button class="btn btn-primary btn-block" :disabled="loading" @click="register">
        {{ loading ? '注册中…' : '注 册' }}
      </button>
    </div>

    <p class="to-login">
      已有账号？<router-link to="/login">去登录</router-link>
    </p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api, setToken } from '../api.js';
import { toast } from '../lib/toast.js';

export default {
  setup() {
    const router = useRouter();
    const username = ref('');
    const nickname = ref('');
    const password = ref('');
    const confirm = ref('');
    const loading = ref(false);

    async function register() {
      if (password.value !== confirm.value) {
        toast.fail('两次密码不一致');
        return;
      }
      loading.value = true;
      try {
        const r = await api('/api/auth/register', {
          method: 'POST',
          body: {
            username: username.value,
            password: password.value,
            nickname: nickname.value,
          },
        });
        setToken(r.token);
        toast.success('注册成功，欢迎加入');
        router.replace('/');
      } catch (e) {
        toast.fail(e.message);
      } finally {
        loading.value = false;
      }
    }

    return { username, nickname, password, confirm, loading, register };
  },
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  padding: 60px 26px 30px;
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
  margin: 0 auto 16px;
  border-radius: 28px;
  background: linear-gradient(135deg, #ffd45e, var(--yellow-deep));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 46px;
  box-shadow: 0 10px 24px rgba(245, 166, 35, 0.35);
}
.auth-title { font-size: 29px; margin: 0 0 9px; }
.auth-sub { font-size: 12.5px; margin: 0 0 26px; }

.input-row {
  display: flex;
  align-items: center;
  gap: 11px;
  background: #fff;
  border-radius: var(--r-sm);
  box-shadow: var(--shadow-card);
  padding: 13px 16px;
  margin-bottom: 12px;
}
.input-row span { font-size: 17px; }
.input-row input { flex: 1; font-size: 15px; }

.to-login { margin-top: 26px; font-size: 13px; color: var(--ink-2); }
.to-login a { color: var(--primary); font-weight: 800; }
</style>
