<template>
  <div class="auth-page">
    <button class="back" @click="$router.back()">
      <Icon name="back" :size="20" />
    </button>

    <div class="auth-logo floaty">
      <Icon name="sparkle" :size="46" :stroke-width="2.2" />
    </div>
    <h1 class="auth-title">加入山财<br /><span class="stroke-hot">美食共建</span></h1>
    <p class="auth-sub muted">注册即可评价、收藏、投稿新窗口</p>

    <div class="auth-form">
      <div class="in-wrap">
        <Icon name="user" :size="18" class="in-ic" />
        <input v-model="username" placeholder="用户名（3-20 位字母数字）" />
      </div>
      <div class="in-wrap">
        <Icon name="edit" :size="18" class="in-ic" />
        <input v-model="nickname" placeholder="昵称（选填）" />
      </div>
      <div class="in-wrap">
        <Icon name="bolt" :size="18" class="in-ic" />
        <input v-model="password" type="password" placeholder="密码（至少 6 位）" />
      </div>
      <div class="in-wrap">
        <Icon name="check" :size="18" class="in-ic" />
        <input
          v-model="confirm"
          type="password"
          placeholder="确认密码"
          @keyup.enter="register"
        />
      </div>

      <button class="btn btn-hot btn-block" :disabled="loading" @click="register">
        {{ loading ? '注册中…' : '注 册' }}
      </button>
    </div>

    <p class="to-switch">
      已有账号？<router-link to="/login">去登录</router-link>
    </p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api, setToken } from '../api.js';
import { toast } from '../lib/toast.js';
import Icon from '../components/Icon.vue';

export default {
  components: { Icon },
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
  min-height: 100dvh;
  padding: 64px 24px 30px;
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
  background: var(--hot);
  border: 2px solid #000;
  box-shadow: 5px 5px 0 #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.auth-title {
  font-size: 30px;
  margin: 0 0 10px;
}
.stroke-hot {
  color: transparent;
  -webkit-text-stroke: 1.5px var(--hot);
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
  border-color: var(--hot);
  box-shadow: 3px 3px 0 rgba(255, 46, 147, 0.3);
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
.to-switch {
  margin-top: 26px;
  font-size: 13px;
  color: var(--ink-2);
}
.to-switch a {
  color: var(--hot);
  font-weight: 800;
}
</style>
