<template>
  <div class="profile">
    <header class="pf-hero">
      <div class="pf-avatar floaty">
        <Icon name="user" :size="44" :stroke-width="2.2" />
      </div>
      <template v-if="user">
        <h1 class="pf-name">
          {{ user.nickname }}
          <span v-if="user.role === 'admin'" class="pf-badge">管理员</span>
        </h1>
        <p class="pf-user">
          @{{ user.username }} ·
          <Icon name="bolt" :size="13" class="pf-bolt" /> 信用 {{ user.credit_score }}
        </p>
      </template>
      <template v-else>
        <h1 class="pf-name">未登录</h1>
        <p class="pf-user">登录后查看你的干饭档案</p>
      </template>
      <Icon name="sparkle" :size="18" class="pf-deco floaty" />
    </header>

    <template v-if="user">
      <!-- 干饭数据 -->
      <div class="stats panel">
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
      <div class="menu panel">
        <router-link class="menu-item" to="/my-reviews">
          <Icon name="chat" :size="20" class="mi-ic" /> 我的评价
          <Icon name="next" :size="17" class="mi-arrow" />
        </router-link>
        <router-link class="menu-item" to="/favorites">
          <Icon name="heart" :size="20" class="mi-ic" /> 我的收藏
          <Icon name="next" :size="17" class="mi-arrow" />
        </router-link>
        <router-link class="menu-item" to="/my-contributions">
          <Icon name="inbox" :size="20" class="mi-ic" /> 我的投稿与纠错
          <Icon name="next" :size="17" class="mi-arrow" />
        </router-link>
        <router-link class="menu-item" to="/feedback">
          <Icon name="edit" :size="20" class="mi-ic" /> 意见反馈
          <Icon name="next" :size="17" class="mi-arrow" />
        </router-link>
        <router-link class="menu-item" to="/disclaimer">
          <Icon name="doc" :size="20" class="mi-ic mi-doc" /> 内容声明与免责
          <Icon name="next" :size="17" class="mi-arrow" />
        </router-link>
        <router-link v-if="user.role === 'admin'" class="menu-item admin" to="/admin">
          <Icon name="shield" :size="20" class="mi-ic" /> 管理审核后台
          <Icon name="next" :size="17" class="mi-arrow" />
        </router-link>
      </div>

      <button class="btn btn-outline btn-block logout" @click="logout">退出登录</button>
    </template>

    <div v-else class="pf-guest">
      <button class="btn btn-acid btn-block" @click="$router.push('/login')">去登录</button>
      <button class="btn btn-outline btn-block mt" @click="$router.push('/register')">
        没有账号，去注册
      </button>
      <router-link to="/feedback" class="guest-feedback muted tiny">意见反馈</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api, setToken } from '../api.js';
import Icon from '../components/Icon.vue';

export default {
  components: { Icon },
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
  position: relative;
  text-align: center;
  padding: 36px 20px 30px;
  border-bottom: 2.5px solid var(--ink);
  overflow: hidden;
}
.pf-avatar {
  width: 84px;
  height: 84px;
  margin: 0 auto 16px;
  border-radius: 6px;
  background: var(--acid);
  border: 2px solid #000;
  box-shadow: 5px 5px 0 #000;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pf-name {
  font-size: 23px;
}
.pf-badge {
  font-size: 10px;
  background: var(--hot);
  color: #fff;
  border: 1.5px solid #000;
  border-radius: 2px;
  padding: 2px 8px;
  margin-left: 7px;
  vertical-align: middle;
}
.pf-user {
  font-size: 12.5px;
  color: var(--ink-2);
  margin-top: 9px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.pf-bolt {
  color: var(--acid);
}
.pf-deco {
  position: absolute;
  right: 34px;
  top: 40px;
  color: var(--cyan);
}

.stats {
  display: flex;
  align-items: center;
  margin: -20px 16px 0;
  position: relative;
  padding: 16px 6px;
}
.stat {
  flex: 1;
  text-align: center;
}
.stat b {
  display: block;
  font-family: var(--font-en);
  font-size: 23px;
  color: var(--acid);
}
.stat span {
  font-size: 11px;
  color: var(--ink-2);
}
.stat-sep {
  width: 2px;
  height: 32px;
  background: var(--line);
}

.menu {
  margin: 16px;
  padding: 2px 15px;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 0;
  font-size: 14.5px;
  font-weight: 700;
  border-bottom: 1.5px solid var(--line);
}
.menu-item:last-child {
  border-bottom: none;
}
.mi-ic {
  color: var(--acid);
}
.menu-item.admin .mi-ic {
  color: var(--hot);
}
.mi-doc {
  color: var(--cyan);
}
.mi-arrow {
  margin-left: auto;
  color: var(--ink-3);
}

.logout {
  margin: 4px 16px;
}
.pf-guest {
  padding: 26px 16px;
}
.guest-feedback {
  display: block;
  text-align: center;
  margin-top: 17px;
}
.mt {
  margin-top: 11px;
}
</style>
