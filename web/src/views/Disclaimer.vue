<template>
  <div>
    <header class="sub-header">
      <button class="sh-back" @click="$router.back()">
        <Icon name="back" :size="19" />
      </button>
      <h1>内容声明与免责</h1>
    </header>

    <div class="sub-body">
      <div class="intro panel">
        <span class="intro-kicker">食在山财 · EAT LAB</span>
        <p>
          本平台是山东财经大学同学自发建立的<strong>非营利性</strong>校园美食信息共建与技术实践作品。
          为保护使用者与维护者，我们把规则光明正大写在这里，请你阅读。
        </p>
        <p class="muted tiny">生效日期：{{ EFFECTIVE_DATE }}</p>
      </div>

      <section v-for="(s, i) in SECTIONS" :key="i" class="term">
        <h2 class="term-title">
          <span class="tt-bar" />{{ s.title }}
        </h2>
        <p v-for="(it, j) in s.items" :key="j" class="term-item">{{ it }}</p>
      </section>

      <div class="contact panel">
        <h2 class="contact-title"><Icon name="chat" :size="18" /> 反馈与侵权联系</h2>
        <p class="term-item">
          如发现内容失实、侵权或违规，最快捷的方式是使用对应窗口 / 评价上的<strong>“举报”</strong>按钮，我们会在后台收到并处理。
        </p>
        <p class="term-item">其他事项可联系维护者：<span class="contact-mail">{{ CONTACT }}</span></p>
        <p class="muted tiny">本项目为学生作品，与山东财经大学官方无涉。</p>
      </div>

      <button class="btn btn-acid btn-block mt" @click="$router.back()">我已知晓，返回</button>
    </div>
  </div>
</template>

<script>
import Icon from '../components/Icon.vue';
import { EFFECTIVE_DATE, CONTACT, SECTIONS } from '../lib/disclaimer.js';

export default {
  components: { Icon },
  data: () => ({ EFFECTIVE_DATE, CONTACT, SECTIONS }),
};
</script>

<style scoped>
@import './subpage.css';
.intro {
  padding: 16px;
}
.intro-kicker {
  font-family: var(--font-en);
  font-size: 11px;
  color: var(--acid);
}
.intro p {
  font-size: 13px;
  line-height: 1.8;
  margin: 9px 0 0;
}
.term {
  margin-top: 20px;
}
.term-title {
  font-size: 15.5px;
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 10px;
}
.tt-bar {
  width: 6px;
  height: 18px;
  background: var(--acid);
  flex: none;
}
.term-item {
  font-size: 13px;
  line-height: 1.8;
  color: var(--ink-1);
  margin: 0 0 9px;
  padding-left: 15px;
  position: relative;
}
.term-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 11px;
  width: 5px;
  height: 5px;
  background: var(--cyan);
}
.contact {
  margin-top: 22px;
  padding: 16px;
}
.contact-title {
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 11px;
}
.contact-title :deep(svg) {
  color: var(--acid);
}
.contact-mail {
  color: var(--cyan);
  font-weight: 700;
}
.mt {
  margin-top: 16px;
}
</style>
