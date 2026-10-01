<template>
  <div>
    <van-nav-bar title="我的" />

    <template v-if="user">
      <div class="user-card">
        <van-image
          round
          width="58"
          height="58"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23c0392b'/%3E%3Ctext x='24' y='32' font-size='22' text-anchor='middle' fill='white'%3E%E5%90%83%3C/text%3E%3C/svg%3E"
        />
        <div class="u-info">
          <div class="u-name">
            {{ user.nickname }}
            <span v-if="user.role === 'admin'" class="role-badge">管理员</span>
          </div>
          <div class="muted">@{{ user.username }} · 信用分 {{ user.credit_score }}</div>
        </div>
      </div>

      <van-cell-group inset class="menu-group">
        <van-cell title="我的评价" is-link to="/my-reviews" icon="chat-o" />
        <van-cell title="我的收藏" is-link to="/favorites" icon="star-o" />
        <van-cell title="我的投稿" is-link to="/my-contributions" icon="records" />
        <van-cell v-if="user.role === 'admin'" title="管理审核后台" is-link to="/admin"
          icon="shield-o" value="管理员入口" />
      </van-cell-group>

      <div style="margin:24px 16px;">
        <van-button round block plain type="danger" @click="logout">退出登录</van-button>
      </div>
    </template>

    <div v-else class="not-login">
      <p>登录后查看个人内容并参与共建</p>
      <van-button type="danger" round size="small" @click="$router.push('/login')">
        去登录
      </van-button>
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

    onMounted(async () => {
      try {
        const r = await api('/api/auth/me');
        user.value = r.user;
      } catch {
        user.value = null;
      }
    });

    function logout() {
      setToken(null);
      user.value = null;
      router.push('/');
    }

    return { user, logout };
  },
};
</script>

<style scoped>
.user-card {
  background: linear-gradient(135deg, #c0392b, #96201a);
  margin: 12px;
  border-radius: 10px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: #fff;
}
.u-name { font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.role-badge {
  font-size: 10.5px;
  background: rgba(255,255,255,0.25);
  border-radius: 3px;
  padding: 1px 7px;
}
.u-info .muted { color: rgba(255,255,255,0.75); font-size: 12px; margin-top: 4px; }
.menu-group { margin-top: 14px; }
.not-login { text-align: center; padding: 90px 0; }
.not-login p { color: #969799; font-size: 13.5px; margin-bottom: 18px; }
</style>
