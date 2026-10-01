<template>
  <div>
    <van-nav-bar title="登录 / 注册" left-arrow @click-left="$router.back()" />

    <div class="login-head">
      <h2>食在山财</h2>
      <p>登录后可评价、点赞与投稿共建</p>
    </div>

    <van-tabs v-model:active="mode" shrink color="#c0392b">
      <van-tab title="登录"></van-tab>
      <van-tab title="注册"></van-tab>
    </van-tabs>

    <div class="page">
      <van-cell-group inset>
        <van-field v-model="form.username" label="用户名" clearable
          placeholder="3-20 位字母数字下划线" />
        <van-field v-model="form.password" label="密码" type="password"
          placeholder="至少 6 位" />
        <van-field v-if="mode === 1" v-model="form.nickname" label="昵称"
          placeholder="选填，默认为用户名" />
      </van-cell-group>

      <div style="margin:22px 16px;">
        <van-button round block type="danger" @click="submit">
          {{ mode === 0 ? '登录' : '注册并登录' }}
        </van-button>
      </div>

      <div class="demo-tip">
        演示账号：管理员 admin / admin123<br>
        普通用户 xiaoming / 123456
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast, showToast } from 'vant';
import { api, setToken } from '../api.js';

export default {
  setup() {
    const router = useRouter();
    const mode = ref(0);
    const form = ref({ username: '', password: '', nickname: '' });

    async function submit() {
      const path = mode.value === 0 ? '/api/auth/login' : '/api/auth/register';
      try {
        const r = await api(path, { method: 'POST', body: form.value });
        setToken(r.token);
        showSuccessToast(mode.value === 0 ? '登录成功' : '注册成功');
        setTimeout(() => router.replace('/me'), 700);
      } catch (e) {
        showToast(e.message);
      }
    }

    return { mode, form, submit };
  },
};
</script>

<style scoped>
.login-head { text-align: center; padding: 34px 0 20px; }
.login-head h2 { font-size: 26px; font-weight: 800; letter-spacing: 3px; color: #c0392b; }
.login-head p { font-size: 12.5px; color: #969799; margin-top: 8px; }
.demo-tip {
  text-align: center;
  font-size: 12px;
  color: #969799;
  line-height: 2;
}
</style>
