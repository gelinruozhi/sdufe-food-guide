<template>
  <div class="stall-card" @click="go">
    <div class="cover" :style="{ background: bg }">
      <img v-if="stall.cover" :src="stall.cover" alt="">
      <span v-else class="cover-char">{{ stall.name.charAt(0) }}</span>
    </div>
    <div class="info">
      <div class="name-row">
        <span class="name">{{ stall.name }}</span>
        <span v-if="stall.stall_type === 'outside'" class="tag-out">校外</span>
      </div>
      <div class="meta">
        <span class="stars-gold">{{ stars }}</span>
        <span class="score">{{ stall.rating_avg ? stall.rating_avg.toFixed(1) : '暂无' }}</span>
        <span class="muted">{{ stall.rating_count }} 条评价</span>
      </div>
      <div class="bottom">
        <span class="cat">{{ stall.category }}</span>
        <span class="price" v-if="stall.avg_price">人均 ¥{{ stall.avg_price }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({ stall: { type: Object, required: true } });
const router = useRouter();

const PALETTES = [
  'linear-gradient(135deg,#f6d365,#fda085)',
  'linear-gradient(135deg,#fbc2eb,#a6c1ee)',
  'linear-gradient(135deg,#fdcbf1,#e6dee9)',
  'linear-gradient(135deg,#ffecd2,#fcb69f)',
  'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
  'linear-gradient(135deg,#d4fc79,#96e6a1)',
];
const bg = computed(() => {
  let h = 0;
  for (const ch of props.stall.name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTES[h % PALETTES.length];
});

const stars = computed(() => {
  const s = props.stall.rating_avg || 0;
  let out = '';
  for (let i = 1; i <= 5; i++) out += s >= i - 0.5 ? '★' : '☆';
  return out;
});

function go() {
  router.push(`/stall/${props.stall.id}`);
}
</script>

<style scoped>
.stall-card {
  display: flex;
  gap: 11px;
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}
.cover {
  width: 76px;
  height: 76px;
  border-radius: 6px;
  flex: none;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover img { width: 100%; height: 100%; object-fit: cover; }
.cover-char { font-size: 30px; color: rgba(255,255,255,0.92); font-weight: 700; }
.info { flex: 1; min-width: 0; }
.name-row { display: flex; align-items: center; gap: 6px; }
.name {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tag-out {
  font-size: 10px;
  color: #fff;
  background: #7232dd;
  border-radius: 3px;
  padding: 0 5px;
  flex: none;
}
.meta { display: flex; align-items: center; gap: 5px; margin-top: 3px; font-size: 12px; }
.meta .score { font-weight: 700; color: #323233; }
.bottom {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  font-size: 12px;
}
.cat { color: #969799; }
</style>
