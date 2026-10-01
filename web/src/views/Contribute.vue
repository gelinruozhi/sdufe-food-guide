<template>
  <div>
    <van-nav-bar title="投稿共建" left-arrow @click-left="$router.back()" />
    <div class="page-head">
      <h2>添加一个窗口</h2>
      <p>投稿提交后进入审核队列，通过后公开展示，信用分 +2</p>
    </div>

    <div class="page">
      <van-radio-group v-model="form.stall_type" direction="horizontal" class="type-radio">
        <van-radio name="inside">校内窗口补充</van-radio>
        <van-radio name="outside">校外店铺</van-radio>
      </van-radio-group>

      <van-form @submit="submit">
        <van-cell-group inset>
          <van-field v-model="form.name" label="窗口名称" placeholder="如：黄焖鸡米饭"
            :rules="[{ required: true, message: '请填写名称' }]" />
          <van-field v-model="form.category" label="品类" placeholder="如：盖浇饭 / 麻辣烫 / 面食"
            :rules="[{ required: true, message: '请填写品类' }]" />
          <van-field v-model="form.avg_price" label="人均价" type="number" placeholder="元" />
          <van-field v-model="form.business_hours" label="营业时间"
            placeholder="如：10:30-13:00, 16:30-19:00" />
          <van-field
            v-model="form.description"
            label="窗口介绍"
            type="textarea"
            rows="2"
            maxlength="300"
            show-word-limit
            placeholder="招牌菜、口味特点等"
          />

          <!-- 校内：餐厅楼层 -->
          <template v-if="form.stall_type === 'inside'">
            <van-field label="所属餐厅" is-readonly clickable
              :model-value="canteenName" placeholder="请选择" @click="showCanteen = true" />
            <van-field label="所属楼层" is-readonly clickable
              :model-value="floorName" placeholder="请选择" @click="showFloor = true" />
          </template>

          <!-- 校外：地址电话 -->
          <template v-else>
            <van-field v-model="form.address" label="地址" placeholder="街道 / 位置描述" />
            <van-field v-model="form.phone" label="电话" type="tel" placeholder="选填" />
            <van-cell center title="支持外卖">
              <template #right-icon>
                <van-switch v-model="form.delivery_supported" size="22" />
              </template>
            </van-cell>
            <template v-if="form.delivery_supported">
              <van-field v-model="form.delivery_platform" label="外卖平台"
                placeholder="美团 / 饿了么" />
              <van-field v-model="form.min_order" label="起送价" type="number" placeholder="元" />
              <van-field v-model="form.delivery_fee" label="配送费" type="number" placeholder="元" />
            </template>
          </template>
        </van-cell-group>

        <div style="margin:20px 16px;">
          <van-button round block type="danger" native-type="submit">提交审核</van-button>
        </div>
      </van-form>
    </div>

    <!-- 餐厅选择 -->
    <van-popup v-model:show="showCanteen" position="bottom" round>
      <van-picker
        :columns="canteenColumns"
        @confirm="onCanteen"
        @cancel="showCanteen = false"
      />
    </van-popup>

    <!-- 楼层选择 -->
    <van-popup v-model:show="showFloor" position="bottom" round>
      <van-picker
        :columns="floorColumns"
        @confirm="onFloor"
        @cancel="showFloor = false"
      />
    </van-popup>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast, showToast } from 'vant';
import { api, getToken } from '../api.js';

export default {
  setup() {
    const router = useRouter();
    const form = ref({
      stall_type: 'inside', name: '', category: '', avg_price: '',
      business_hours: '', description: '',
      canteen_id: '', floor_id: '',
      address: '', phone: '', delivery_supported: false,
      delivery_platform: '', delivery_fee: '', min_order: '',
    });
    const canteens = ref([]);
    const showCanteen = ref(false);
    const showFloor = ref(false);
    const selectedCanteen = ref(null);
    const selectedFloor = ref(null);

    onMounted(async () => {
      if (!getToken()) {
        showToast('请先登录');
        router.replace('/login');
        return;
      }
      const r = await api('/api/canteens');
      canteens.value = r.canteens;
    });

    const canteenColumns = computed(() =>
      canteens.value.map((c) => ({ text: c.name, value: c.id }))
    );
    const floorColumns = computed(() => {
      if (!selectedCanteen.value) return [];
      const c = canteens.value.find((x) => x.id === selectedCanteen.value);
      return c ? c.floors.map((f) => ({ text: f.name, value: f.id })) : [];
    });
    const canteenName = computed(() => {
      const c = canteens.value.find((x) => x.id === selectedCanteen.value);
      return c ? c.name : '';
    });
    const floorName = computed(() => {
      const c = canteens.value.find((x) => x.id === selectedCanteen.value);
      if (!c) return '';
      const f = c.floors.find((x) => x.id === selectedFloor.value);
      return f ? f.name : '';
    });

    function onCanteen({ selectedOptions }) {
      selectedCanteen.value = selectedOptions[0].value;
      selectedFloor.value = null;
      form.value.canteen_id = selectedOptions[0].value;
      showCanteen.value = false;
    }
    function onFloor({ selectedOptions }) {
      selectedFloor.value = selectedOptions[0].value;
      form.value.floor_id = selectedOptions[0].value;
      showFloor.value = false;
    }

    async function submit() {
      const body = { ...form.value };
      body.avg_price = Number(body.avg_price) || 0;
      body.delivery_fee = Number(body.delivery_fee) || 0;
      body.min_order = Number(body.min_order) || 0;
      try {
        await api('/api/contribute', { method: 'POST', body });
        showSuccessToast('投稿成功，等待管理员审核');
        setTimeout(() => router.push('/me'), 900);
      } catch (e) {
        showToast(e.message);
      }
    }

    return {
      form, showCanteen, showFloor, canteenColumns, floorColumns,
      onCanteen, onFloor, canteenName, floorName, submit,
    };
  },
};
</script>

<style scoped>
.type-radio { padding: 14px 16px 6px; }
</style>
