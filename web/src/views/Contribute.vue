<template>
  <div class="contrib">
    <header class="cb-hero">
      <span class="cb-kicker">CONTRIBUTE / 共建</span>
      <h1 class="cb-title">投稿<br />共建</h1>
      <p>每一个被你发现的美味，都值得被更多人看到</p>
      <Icon name="sparkle" :size="20" class="cb-deco floaty" />
    </header>

    <!-- 未登录 -->
    <div v-if="!logged" class="login-tip panel">
      <span class="lt-icon"><Icon name="user" :size="30" /></span>
      <p>登录后即可投稿，通过审核还能提升信用分</p>
      <button class="btn btn-acid btn-sm" @click="$router.push('/login')">去登录</button>
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
          class="type-card"
          :class="{ sel: form.stall_type === 'inside' }"
          @click="form.stall_type = 'inside'"
        >
          <span class="tc-icon"><Icon name="home" :size="28" /></span>
          <div class="tc-text">
            <b>校内食堂窗口</b>
            <p>一餐 / 二餐 / 三餐里的某个窗口</p>
          </div>
          <span class="tc-check"><Icon name="check" :size="15" /></span>
        </button>
        <button
          class="type-card"
          :class="{ sel: form.stall_type === 'outside' }"
          @click="form.stall_type = 'outside'"
        >
          <span class="tc-icon"><Icon name="location" :size="28" /></span>
          <div class="tc-text">
            <b>校外店铺 / 外卖</b>
            <p>小吃街、周边餐馆、可外卖的店</p>
          </div>
          <span class="tc-check"><Icon name="check" :size="15" /></span>
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
              class="pick"
              :class="{ sel: form.canteen_id === c.id }"
              @click="selectCanteen(c, i)"
            >
              <span class="pk-no">{{ '0' + (i + 1) }}</span>{{ c.name }}
            </button>
          </div>
          <h2 class="q-title mt">在哪一层？</h2>
          <div class="pick-grid two">
            <button
              v-for="f in floors"
              :key="f.id"
              class="pick"
              :class="{ sel: form.floor_id === f.id }"
              @click="form.floor_id = f.id"
            >
              {{ f.name }}
            </button>
          </div>
        </template>

        <template v-else>
          <h2 class="q-title">店铺在哪里？</h2>
          <label class="f-label">详细地址 *</label>
          <input v-model="form.address" class="field" placeholder="如：学府路小吃街 12 号" />
          <label class="f-label mt">联系电话（选填）</label>
          <input v-model="form.phone" type="tel" class="field" placeholder="如：138****0000" />
        </template>
      </div>

      <!-- Step 3 信息 -->
      <div v-if="step === 2" class="pane">
        <h2 class="q-title">告诉大家它的信息</h2>
        <label class="f-label">窗口 / 店铺名称 *</label>
        <input v-model="form.name" class="field" placeholder="如：山西刀削面" maxlength="30" />
        <label class="f-label mt">品类 *（可点选或自填）</label>
        <input v-model="form.category" class="field" placeholder="如：面食" maxlength="15" />
        <div class="cat-chips">
          <button
            v-for="c in CAT_HINTS"
            :key="c"
            class="cat-chip"
            @click="form.category = c"
          >
            {{ c }}
          </button>
        </div>
        <div class="two-col">
          <div>
            <label class="f-label">人均价 ¥</label>
            <input v-model.number="form.avg_price" type="number" min="0" class="field" placeholder="如 12" />
          </div>
          <div>
            <label class="f-label">营业时间</label>
            <input v-model="form.business_hours" class="field" placeholder="10:30-19:00" />
          </div>
        </div>
        <label class="f-label mt">推荐理由 / 介绍</label>
        <textarea
          v-model="form.description"
          rows="3"
          class="field"
          placeholder="招牌菜、味道、分量，给同学一个去的理由…"
          maxlength="300"
        />

        <!-- 校外外卖 -->
        <template v-if="form.stall_type === 'outside'">
          <label class="switch-row">
            <input type="checkbox" v-model="form.delivery_supported" />
            <span>支持外卖</span>
          </label>
          <div v-if="form.delivery_supported" class="dl-box">
            <label class="f-label">外卖平台</label>
            <input v-model="form.delivery_platform" class="field" placeholder="美团 / 饿了么" />
            <div class="two-col mt">
              <div>
                <label class="f-label">起送价 ¥</label>
                <input v-model.number="form.min_order" type="number" min="0" class="field" />
              </div>
              <div>
                <label class="f-label">配送费 ¥</label>
                <input v-model.number="form.delivery_fee" type="number" min="0" class="field" />
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 底部导航按钮 -->
      <div class="nav-btns" v-if="!done">
        <button v-if="step > 0" class="btn btn-ghost" @click="step--">上一步</button>
        <button v-if="step < 2" class="btn btn-acid" :disabled="!canNext" @click="step++">
          下一步
        </button>
        <button
          v-if="step === 2"
          class="btn btn-acid"
          :disabled="submitting || !form.name || !form.category"
          @click="submit"
        >
          {{ submitting ? '提交中…' : '提交投稿' }}
        </button>
      </div>
    </template>

    <!-- 成功页 -->
    <div v-if="done" class="done-pane">
      <div class="done-circle pop">
        <Icon name="check" :size="52" :stroke-width="2.6" />
      </div>
      <h2>投稿成功！</h2>
      <p class="muted">
        窗口已进入审核队列，通过后将公开展示<br />通过审核可获得信用分奖励
      </p>
      <button class="btn btn-acid btn-block" @click="$router.push('/my-contributions')">
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
import Icon from '../components/Icon.vue';

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
  components: { Icon },
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

    function selectCanteen(c) {
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
      CAT_HINTS, canNext, selectCanteen, submit, reset,
    };
  },
};
</script>

<style scoped>
/* Hero */
.cb-hero {
  position: relative;
  padding: 22px 20px 26px;
  border-bottom: 2.5px solid var(--ink);
  overflow: hidden;
}
.cb-kicker {
  font-family: var(--font-en);
  font-size: 11px;
  color: var(--acid);
}
.cb-title {
  font-size: 40px;
  margin: 10px 0 8px;
}
.cb-hero p {
  font-size: 12.5px;
  color: var(--ink-2);
}
.cb-deco {
  position: absolute;
  right: 26px;
  top: 30px;
  color: var(--cyan);
}

.login-tip {
  margin: 20px 16px;
  padding: 28px 20px;
  text-align: center;
}
.lt-icon {
  display: flex;
  justify-content: center;
  color: var(--acid);
  margin-bottom: 10px;
}
.login-tip p {
  font-size: 13px;
  color: var(--ink-2);
  margin: 0 0 16px;
}

/* 进度 */
.steps {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 18px 18px 2px;
}
.step-dot {
  width: 24px;
  height: 6px;
  background: var(--line);
  transition: background 0.2s;
}
.step-dot.on {
  background: var(--acid);
}
.step-text {
  margin-left: auto;
  font-size: 12px;
  color: var(--ink-2);
  font-weight: 700;
}

.pane {
  padding: 14px 16px 96px;
}
.q-title {
  font-size: 17px;
  margin: 14px 2px 13px;
}
.q-title.mt {
  margin-top: 22px;
}
.f-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-2);
  margin: 12px 0 7px;
}
.f-label.mt {
  margin-top: 16px;
}

/* 类型卡 */
.type-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 13px;
  background: var(--bg-2);
  border: 2px solid var(--line);
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
  text-align: left;
  transition: border-color 0.12s, background 0.12s, transform 0.1s;
}
.tc-icon {
  width: 50px;
  height: 50px;
  flex: none;
  border: 2px solid var(--line);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
}
.tc-text {
  flex: 1;
  min-width: 0;
}
.tc-text b {
  font-size: 15px;
}
.tc-text p {
  margin: 4px 0 0;
  font-size: 11.5px;
  color: var(--ink-2);
}
.tc-check {
  width: 26px;
  height: 26px;
  flex: none;
  border: 2px solid var(--line);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
}
.type-card.sel {
  border-color: var(--acid);
}
.type-card.sel .tc-icon {
  background: var(--acid);
  color: #000;
  border-color: #000;
}
.type-card.sel .tc-check {
  background: var(--acid);
  color: #000;
  border-color: #000;
}

/* 选择网格 */
.pick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
}
.pick-grid.two {
  grid-template-columns: repeat(2, 1fr);
}
.pick {
  background: var(--bg-2);
  border: 2px solid var(--line);
  border-radius: 4px;
  padding: 14px 6px;
  font-size: 12.5px;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--ink);
}
.pk-no {
  font-family: var(--font-en);
  font-size: 18px;
  color: var(--ink-2);
}
.pick.sel {
  border-color: var(--acid);
  background: var(--acid);
  color: #000;
}
.pick.sel .pk-no {
  color: #000;
}

.cat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 10px 0 2px;
}
.cat-chip {
  background: var(--bg-2);
  border: 1.5px solid var(--line);
  border-radius: 3px;
  padding: 5px 12px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ink-2);
}
.cat-chip:active {
  background: var(--acid);
  color: #000;
  border-color: #000;
}
.two-col {
  display: flex;
  gap: 10px;
}
.two-col > div {
  flex: 1;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  font-weight: 700;
  margin: 16px 2px 10px;
}
.switch-row input {
  width: 18px;
  height: 18px;
  accent-color: var(--acid);
}
.dl-box {
  margin-bottom: 10px;
}

.nav-btns {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: min(520px, 100%);
  display: flex;
  gap: 10px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0));
  background: var(--bg);
  border-top: 2px solid var(--line);
  z-index: 80;
}
.nav-btns .btn {
  flex: 1;
}

.done-pane {
  text-align: center;
  padding: 56px 24px;
}
.done-circle {
  width: 92px;
  height: 92px;
  background: var(--acid);
  border: 2px solid #000;
  border-radius: 6px;
  box-shadow: 5px 5px 0 #000;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  margin: 0 auto 20px;
}
.done-pane h2 {
  font-size: 22px;
  margin: 0 0 10px;
}
.done-pane p {
  font-size: 13px;
  line-height: 1.8;
  margin: 0 0 24px;
}
.mt {
  margin-top: 11px;
}
</style>
