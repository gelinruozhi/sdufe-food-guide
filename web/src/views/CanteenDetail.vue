<template>
  <div>
    <van-nav-bar title="餐厅详情" left-arrow @click-left="$router.back()" />
    <div class="c-head" v-if="canteen">
      <h2>{{ canteen.name }}</h2>
      <p>{{ canteen.location }}</p>
      <p>营业时间 {{ canteen.open_hours }}</p>
    </div>

    <van-tabs v-model:active="active" sticky color="#c0392b">
      <van-tab v-for="f in floors" :key="f.id" :title="f.name">
        <div class="page">
          <StallCard v-for="s in f.stalls" :key="s.id" :stall="s" />
          <div v-if="!f.stalls.length" class="empty-box">该楼层暂无已收录窗口</div>
          <div class="add-tip" @click="$router.push('/contribute')">
            发现窗口缺失？点我投稿补充
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api.js';
import StallCard from '../components/StallCard.vue';

export default {
  components: { StallCard },
  setup() {
    const route = useRoute();
    const canteen = ref(null);
    const floors = ref([]);
    const active = ref(0);

    onMounted(async () => {
      const r = await api(`/api/canteens/${route.params.id}`);
      canteen.value = r.canteen;
      floors.value = r.floors;
    });

    return { canteen, floors, active };
  },
};
</script>

<style scoped>
.c-head {
  background: #fff;
  padding: 16px 16px 18px;
  border-bottom: 1px solid #f2f3f5;
}
.c-head h2 { font-size: 20px; font-weight: 700; }
.c-head p { font-size: 12.5px; color: #969799; margin-top: 5px; }
.add-tip {
  text-align: center;
  font-size: 12.5px;
  color: #c0392b;
  background: #fff6f5;
  border-radius: 6px;
  padding: 11px;
  margin-top: 6px;
}
</style>
