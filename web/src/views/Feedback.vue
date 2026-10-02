<template>
  <div class="feedback-page">
    <header class="fb-hero">
      <button class="fb-back" @click="$router.back()">
        <Icon name="back" :size="20" />
      </button>
      <span class="fb-kicker">FEEDBACK / 反馈</span>
      <h1 class="fb-title">意见反馈</h1>
      <p>这是学生自建的小项目，你提的每条建议、遇到的每个问题都会被真实看到和记录。</p>
    </header>

    <!-- 提交反馈 -->
    <section class="fb-form panel">
      <div class="type-row">
        <button
          v-for="t in TYPES"
          :key="t.v"
          class="type-btn"
          :class="{ on: form.type === t.v }"
          @click="form.type = t.v"
        >
          {{ t.t }}
        </button>
      </div>

      <textarea
        v-model="form.content"
        class="fb-textarea"
        rows="5"
        maxlength="1000"
        placeholder="想说的建议、遇到的问题、希望增加的功能……（至少 3 个字）"
      />
      <div class="char-note muted tiny">{{ form.content.length }} / 1000</div>

      <input
        v-model="form.contact"
        class="fb-input"
        maxlength="100"
        placeholder="联系方式（可选）：微信 / QQ / 邮箱，方便把处理结果回复你"
      />

      <!-- 可选图片 -->
      <div class="img-row">
        <div v-for="(im, i) in form.images" :key="i" class="img-thumb">
          <img :src="im" :alt="'反馈图' + (i + 1)" @click="openImg(im)" />
          <button class="img-x" @click="removeImg(i)">
            <Icon name="close" :size="12" />
          </button>
        </div>
        <button
          v-if="form.images.length < 3"
          class="img-add"
          @click="pickFile"
        >
          <Icon name="camera" :size="20" />
          <span>加图</span>
        </button>
        <input
          ref="fileEl"
          type="file"
          accept="image/*"
          class="hidden-file"
          @change="onFile"
        />
      </div>

      <button class="btn btn-acid btn-block submit-btn" :disabled="submitting" @click="submit">
        <Icon name="check" :size="16" />
        {{ submitting ? '提交中…' : '提交反馈' }}
      </button>
    </section>

    <!-- 我的反馈记录 -->
    <section class="mine-block">
      <div class="block-head">
        <h2 class="block-title">我的反馈</h2>
      </div>

      <template v-if="isLogin">
        <div v-for="f in mine" :key="f.id" class="mine-item panel">
          <div class="mi-top">
            <span class="mi-type">{{ typeLabel(f.type) }}</span>
            <span class="mi-status" :class="f.status">
              {{ f.status === 'handled' ? '已处理' : '待处理' }}
            </span>
          </div>
          <p class="mi-content">{{ f.content }}</p>

          <div v-if="f.images.length" class="mi-imgs">
            <img
              v-for="(im, k) in f.images"
              :key="k"
              :src="im"
              loading="lazy"
              decoding="async"
              @click="openImg(im)"
            />
          </div>

          <div v-if="f.reply" class="mi-reply">
            <span class="reply-label">维护者回复</span>
            <p>{{ f.reply }}</p>
          </div>

          <p class="mi-time muted tiny">{{ f.created_at }}</p>
        </div>
        <Empty v-if="!mine.length" icon="edit" text="还没有反馈记录" />
      </template>

      <div v-else class="login-tip panel">
        <p class="muted">登录后可查看你的反馈记录与处理回复</p>
        <button class="btn btn-outline btn-block" @click="$router.push('/login')">去登录</button>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { api, uploadImage, getToken } from '../api.js';
import { toast } from '../lib/toast.js';
import Icon from '../components/Icon.vue';
import Empty from '../components/Empty.vue';

const TYPES = [
  { v: 'suggestion', t: '产品建议' },
  { v: 'bug', t: '问题 / Bug' },
  { v: 'content', t: '内容问题' },
  { v: 'other', t: '其他' },
];

export default {
  components: { Icon, Empty },
  setup() {
    const isLogin = !!getToken();
    const submitting = ref(false);
    const mine = ref([]);
    const fileEl = ref(null);
    const form = reactive({
      type: 'suggestion',
      content: '',
      contact: '',
      images: [],
    });

    function typeLabel(v) {
      const hit = TYPES.find((x) => x.v === v);
      return hit ? hit.t : '其他';
    }

    async function loadMine() {
      if (!getToken()) return;
      try {
        const r = await api('/api/feedback/mine');
        mine.value = r.feedback;
      } catch {
        /* 未登录或失效，忽略 */
      }
    }

    function pickFile() {
      if (fileEl.value) fileEl.value.click();
    }
    async function onFile(e) {
      const files = [...(e.target.files || [])];
      e.target.value = '';
      for (const file of files) {
        if (form.images.length >= 3) break;
        try {
          const url = await uploadImage(file);
          if (url) form.images.push(url);
        } catch {
          toast.fail('图片上传失败');
        }
      }
    }
    function removeImg(i) {
      form.images.splice(i, 1);
    }
    function openImg(url) {
      window.open(url, '_blank');
    }

    async function submit() {
      if (form.content.trim().length < 3) {
        toast.fail('请填写至少 3 个字的内容');
        return;
      }
      submitting.value = true;
      try {
        await api('/api/feedback', {
          method: 'POST',
          body: {
            type: form.type,
            content: form.content.trim(),
            contact: form.contact || '',
            images: form.images,
          },
        });
        toast.success('已提交，感谢反馈');
        form.content = '';
        form.contact = '';
        form.images = [];
        await loadMine();
      } catch (err) {
        toast.fail(err.message || '提交失败');
      } finally {
        submitting.value = false;
      }
    }

    onMounted(loadMine);

    return {
      TYPES, form, mine, isLogin, submitting, fileEl,
      typeLabel, pickFile, onFile, removeImg, openImg, submit,
    };
  },
};
</script>

<style scoped>
.feedback-page {
  padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0) + 24px);
}

/* Hero */
.fb-hero {
  position: relative;
  padding: 18px 20px 22px;
  border-bottom: 2.5px solid var(--ink);
  overflow: hidden;
}
.fb-back {
  width: 38px;
  height: 38px;
  border: 2px solid var(--ink);
  border-radius: 4px;
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}
.fb-back:active {
  background: var(--hot);
  color: #fff;
  border-color: #000;
}
.fb-kicker {
  font-family: var(--font-en);
  font-size: 11px;
  color: var(--acid);
}
.fb-title {
  font-size: 28px;
  margin: 8px 0 8px;
}
.fb-hero p {
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--ink-2);
  max-width: 420px;
}

/* 表单 */
.fb-form {
  margin: 18px 16px 8;
  padding: 16px;
}
.type-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.type-btn {
  border: 2px solid var(--line);
  background: var(--bg-2);
  color: var(--ink-2);
  border-radius: 4px;
  padding: 7px 13px;
  font-size: 12.5px;
  font-weight: 700;
}
.type-btn.on {
  background: var(--acid);
  color: #000;
  border-color: #000;
  box-shadow: 3px 3px 0 #000;
}
.fb-textarea,
.fb-input {
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-2);
  border: 2px solid var(--line);
  border-radius: 4px;
  color: var(--ink);
  font-size: 13.5px;
  font-family: inherit;
  padding: 11px 12px;
}
.fb-textarea {
  resize: vertical;
  min-height: 96px;
  line-height: 1.7;
}
.fb-input {
  margin-top: 10px;
}
.fb-textarea:focus,
.fb-input:focus {
  border-color: var(--acid);
  outline: none;
}
.char-note {
  text-align: right;
  margin: 5px 2px 0;
}

/* 图片 */
.img-row {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 12px;
}
.img-thumb {
  position: relative;
  width: 62px;
  height: 62px;
  border: 2px solid var(--ink);
  border-radius: 4px;
  overflow: hidden;
}
.img-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.img-x {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border: none;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.img-add {
  width: 62px;
  height: 62px;
  border: 2px dashed var(--line);
  border-radius: 4px;
  background: var(--bg-2);
  color: var(--ink-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 10px;
}
.hidden-file {
  display: none;
}
.submit-btn {
  margin-top: 16px;
}

/* 我的反馈 */
.block-head {
  padding: 20px 18px 4px;
}
.mine-item {
  margin: 0 16px 12px;
  padding: 14px 15px;
}
.mi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}
.mi-type {
  font-size: 11px;
  font-weight: 800;
  border: 1.5px solid var(--line);
  border-radius: 2px;
  padding: 2px 9px;
  color: var(--ink-1);
}
.mi-status {
  font-size: 11px;
  font-weight: 700;
}
.mi-status.pending {
  color: var(--orange);
}
.mi-status.handled {
  color: var(--acid);
}
.mi-content {
  font-size: 13.5px;
  line-height: 1.7;
  margin: 0;
  color: var(--ink);
  white-space: pre-wrap;
  word-break: break-word;
}
.mi-imgs {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.mi-imgs img {
  width: 58px;
  height: 58px;
  object-fit: cover;
  border: 1.5px solid var(--ink);
  border-radius: 3px;
}
.mi-reply {
  margin-top: 11px;
  border: 2px solid var(--acid);
  border-radius: 4px;
  background: rgba(204, 255, 0, 0.06);
  padding: 10px 12px;
}
.reply-label {
  font-size: 10.5px;
  font-weight: 800;
  color: var(--acid);
}
.mi-reply p {
  font-size: 12.5px;
  line-height: 1.7;
  margin: 5px 0 0;
  color: var(--ink-1);
}
.mi-time {
  margin: 9px 0 0;
}
.login-tip {
  margin: 4px 16px;
  padding: 18px 16px;
  text-align: center;
}
.login-tip p {
  margin: 0 0 13px;
}
</style>
