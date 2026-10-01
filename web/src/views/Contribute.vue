<template>
  <div class="contrib">
    <header class="cb-hero">
      <h1 class="display-title">投稿共建</h1>
      <p>每一个被你发现的美味，都值得被更多人看到</p>
    </header>

    <!-- 未登录 -->
    <div v-if="!logged" class="login-tip card">
      <span class="lt-emoji">🔐</span>
      <p>登录后即可投稿，通过审核还能提升信用分</p>
      <button class="btn btn-primary btn-sm" @click="$router.push('/login')">去登录</button>
    </div>

    <template v-else>
      <!-- 进度 -->
      <div v-if="!done" class="steps">
        <span v-for="i in 3" :key="i" class="step-dot" :class="{ on: step >= i - 1 }" />
        <span class="step-text">第 {{ step + 1 }} / 3 步</span>
      </div>

      <!-- Step 1 类型 -->
      <div v-if="step === 0" class="pane">
        <h2 class="q-title">这是一个？</h2>
        <button
          class="type-card press"
          :class="{ sel: form.stall_type === 'inside' }"
          @click="form.stall_type = 'inside'"
        >
          <span class="tc-emoji">🏫</span>
          <div class="tc-text">
            <b>校内食堂窗口</b>
            <p>一餐 / 二餐 / 三餐里的某个窗口</p>
          </div>
          <span class="tc-check">✓</span>
        </button>
        <button
          class="type-card press"
          :class="{ sel: form.stall_type === 'outside' }"
          @click="form.stall_type = 'outside'"
        >
          <span class="tc-emoji">🏪</span>
          <div class="tc-text">
            <b>校外店铺 / 外卖</b>
            <p>小吃街、周边餐馆、可外卖的店</p>
          </div>
          <span class="tc-check">✓</span>
        </button>
      </div>

      <!-- Step 2 位置 -->
      <div v-if="step === 1" class="pane">
        <template v-if="form.stall_type === 'inside'">
          <h2 class="q-title">它在哪个餐厅？</h2>
          <div class="pick-grid">
            <button
              v-for="(c, i) in canteens"
              :key="c.id"
              class="pick press"
              :class="{ sel: form.canteen_id === c.id }"
              @click="selectCanteen(c, i)"
            >
              <span class="pk-emoji">{{ CANTEEN_EMOJI[i] }}</span>{{ c.name }}
            </button>
          </div>
          <h2 class="q-title mt">在哪一层？</h2>
          <div class="pick-grid two">
            <button
              v-for="f in floors"
              :key="f.id"
              class="pick press"
              :class="{ sel: form.floor_id === f.id }"
              @click="form.floor_id = f.id"
            >
              {{ f.name }}
            </button>
          </div>
        </template>

        <template v-else>
          <h2 class="q-title">店铺在哪里？</h2>
          <div class="field">
            <label>详细地址 *</label>
            <input v-model="form.address" placeholder="如：学府路小吃街 12 号" />
          </div>
          <div class="field">
            <label>联系电话（选填）</label>
            <input v-model="form.phone" type="tel" placeholder="如：138****0000" />
          </div>
        </template>
      </div>

      <!-- Step 3 信息 -->
      <div v-if="step === 2" class="pane">
        <h2 class="q-title">告诉大家它的信息</h2>
        <div class="field">
          <label>窗口 / 店铺名称 *</label>
          <input v-model="form.name" placeholder="如：山西刀削面" maxlength="30" />
        </div>
        <div class="field">
          <label>品类 *（可点选或自填）</label>
          <input v-model="form.category" placeholder="如：面食" maxlength="15" />
        </div>
        <div class="cat-chips">
          <button
            v-for="c in CAT_HINTS"
            :key="c"
            class="cat-chip press"
            @click="form.category = c"
          >
            {{ c }}
          </button>
        </div>
        <div class="two-col">
          <div class="field">
            <label>人均价 ¥</label>
            <input v-model.number="form.avg_price" type="number" min="0" placeholder="如 12" />
          </div>
          <div class="field">
            <label>营业时间</label>
            <input v-model="form.business_hours" placeholder="10:30-19:00" />
          </div>
        </div>
        <div class="field">
          <label>推荐理由 / 介绍</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="招牌菜、味道、分量，给同学一个去的理由…"
            maxlength="300"
          />
        </div>

        <!-- 校外外卖 -->
        <template v-if="form.stall_type === 'outside'">
          <label class="switch-row">
            <input type="checkbox" v-model="form.delivery_supported" />
            <span>支持外卖</span>
          </label>
          <div v-if="form.delivery_supported" class="dl-box">
            <div class="field">
              <label>外卖平台</label>
              <input v-model="form.delivery_platform" placeholder="美团 / 饿了么" />
            </div>
            <div class="two-col">
              <div class="field">
                <label>起送价 ¥</label>
                <input v-model.number="form.min_order" type="number" min="0" />
              </div>
              <div class="field">
                <label>配送费 ¥</label>
                <input v-model.number="form.delivery_fee" type="number" min="0" />
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 底部导航按钮 -->
      <div class="nav-btns" v-if="!done">
        <button v-if="step > 0" class="btn btn-ghost" @click="step--">上一步</button>
        <button
          v-if="step < 2"
          class="btn btn-primary"
          :disabled="!canNext"
          @click="step++"
        >
          下一步
        </button>
        <button
          v-if="step === 2"
          class="btn btn-primary"
          :disabled="submitting || !form.name || !form.category"
          @click="submit"
        >
          {{ submitting ? '提交中…' : '提交投稿' }}
        </button>
      </div>
    </template>

    <!-- 成功页 -->
    <div v-if="done" class="done-pane">
      <div class="done-circle pop">🎉</div>
      <h2>投稿成功！</h2>
      <p class="muted">窗口已进入审核队列，通过后将公开展示<br />通过审核可获得信用分奖励</p>
      <button class="btn btn-primary btn-block" @click="$router.push('/my-contributions')">
        查看我的投稿
      </button>
      <button class="btn btn-ghost btn-block mt" @click="reset">再投一个</button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { api, getToken } from '../api.js';
import { toast } from '../lib/toast.js';

const CANTEEN_EMOJI = ['🏛️', '🏫', '🏢'];
const CAT_HINTS = [
  '面食', '盖浇饭', '麻辣烫', '香锅', '饼类', '水饺', '粥点', '米线',
  '轻食', '卤味饭', '烤肉', '炒鸡', '粉面', '甜品', '小吃', '韩餐',
];

function blank() {
  return {
    stall_type: '',
    canteen_id: null,
    floor_id: null,
    name: '',
    category: '',
    avg_price: null,
    business_hours: '',
    description: '',
    address: '',
    phone: '',
    delivery_supported: false,
    delivery_platform: '',
    delivery_fee: null,
    min_order: null,
  };
}

export default {
  setup() {
    const logged = ref(!!getToken());
    const step = ref(0);
    const done = ref(false);
    const submitting = ref(false);
    const form = reactive(blank());
    const canteens = ref([]);
    const floors = ref([]);

    onMounted(async () => {
      logged.value = !!getToken();
      if (logged.value) {
        const r = await api('/api/canteens');
        canteens.value = r.canteens;
      }
    });

    function selectCanteen(c, i) {
      form.canteen_id = c.id;
      form.floor_id = null;
      floors.value = c.floors;
    }

    const canNext = computed(() => {
      if (step.value === 0) return !!form.stall_type;
      if (step.value === 1) {
        if (form.stall_type === 'inside') return form.canteen_id && form.floor_id;
        return !!form.address.trim();
      }
      return true;
    });

    async function submit() {
      submitting.value = true;
      try {
        await api('/api/contribute', { method: 'POST', body: { ...form } });
        done.value = true;
      } catch (e) {
        toast.fail(e.message);
      } finally {
        submitting.value = false;
      }
    }

    function reset() {
      Object.assign(form, blank());
      step.value = 0;
      done.value = false;
    }

    return {
      logged, step, done, submitting, form, canteens, floors,
      CANTEEN_EMOJI, CAT_HINTS, canNext,
      selectCanteen, submit, reset,
    };
  },
};
</script>

<style scoped>
.cb-hero {
  background: linear-gradient(160deg, #ff6a45, #d8330f);
  color: #fff;
  padding: 24px 20px 26px;
  border-radius: 0 0 28px 28px;
}
.cb-hero h1 { font-size: 30px; margin: 0 0 6px; color: #fff; }
.cb-hero p { margin: 0; font-size: 12.5px; opacity: 0.85; }

.login-tip {
  margin: 20px 16px;
  padding: 28px 20px;
  text-align: center;
}
.lt-emoji { font-size: 40px; display: block; margin-bottom: 10px; }
.login-tip p { font-size: 13px; color: var(--ink-2); margin: 0 0 16px; }

.steps {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 18px 18px 4px;
}
.step-dot {
  width: 22px;
  height: 5px;
  border-radius: 3px;
  background: #e6d9cb;
  transition: background 0.25s;
}
.step-dot.on { background: var(--primary); }
.step-text { margin-left: auto; font-size: 12px; color: var(--ink-2); font-weight: 700; }

.pane { padding: 14px 16px 90px; }
.q-title { font-size: 16px; font-weight: 900; margin: 12px 2px 12px; }
.q-title.mt { margin-top: 22px; }

/* 类型卡 */
.type-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 13px;
  background: #fff;
  border-radius: var(--r-md);
  box-shadow: var(--shadow-card);
  padding: 17px 16px;
  margin-bottom: 12px;
  border: 2.5px solid transparent;
  text-align: left;
}
.tc-emoji { font-size: 34px; }
.tc-text { flex: 1; }
.tc-text b { font-size: 15.5px; }
.tc-text p { margin: 3px 0 0; font-size: 12px; color: var(--ink-2); }
.tc-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #eee;
  color: transparent;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.type-card.sel { border-color: var(--primary); }
.type-card.sel .tc-check { background: var(--primary); color: #fff; }

/* 选择网格 */
.pick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; }
.pick-grid.two { grid-template-columns: repeat(2, 1fr); }
.pick {
  background: #fff;
  border-radius: var(--r-sm);
  box-shadow: var(--shadow-card);
  padding: 14px 6px;
  font-size: 13px;
  font-weight: 800;
  border: 2.5px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}
.pk-emoji { font-size: 24px; }
.pick.sel { border-color: var(--primary); background: var(--primary-soft); color: var(--primary-deep); }

.cat-chips { display: flex; flex-wrap: wrap; gap: 7px; margin: 2px 0 4px; }
.cat-chip {
  background: #fff;
  border-radius: 999px;
  padding: 6px 13px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: var(--shadow-card);
  color: var(--ink-2);
}
.two-col { display: flex; gap: 10px; }
.two-col .field { flex: 1; }

.switch-row {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  font-weight: 800;
  margin: 6px 2px 12px;
}
.dl-box { margin-bottom: 10px; }

.nav-btns {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: min(520px, 100%);
  display: flex;
  gap: 10px;
  padding: 12px 16px calc(14px + env(safe-area-inset-bottom, 0));
  background: linear-gradient(transparent, var(--bg) 30%);
}
.nav-btns .btn { flex: 1; }

.done-pane {
  text-align: center;
  padding: 60px 24px;
}
.done-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--green-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  margin: 0 auto 18px;
}
.done-pane h2 { font-size: 22px; margin: 0 0 10px; }
.done-pane p { font-size: 13px; line-height: 1.8; margin: 0 0 24px; }
.mt { margin-top: 11px; }
</style>
