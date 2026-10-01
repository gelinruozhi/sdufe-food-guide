import { createApp } from 'vue';
import App from './App.vue';
import router from './router.js';
import './style.css';

const app = createApp(App);

// 入场指令：最终可见状态由内联样式直接设定，不依赖 transitionend，
// 即使过渡事件丢失，元素也一定可见；过渡仅作视觉增强。
// 用法：v-rise="错峰毫秒数"
app.directive('rise', {
  mounted(el, binding) {
    const delay = Math.min(Number(binding.value) || 0, 420);
    el.style.opacity = '0';
    el.style.transform = 'translateY(22px) scale(0.985)';
    el.style.transition =
      'opacity .5s cubic-bezier(0.22,1,0.36,1), transform .5s cubic-bezier(0.22,1,0.36,1)';
    el.style.transitionDelay = delay + 'ms';
    void el.offsetWidth; // 强制重排，记录起始态

    // 用宏任务设置最终可见状态，不依赖渲染帧，确保一定执行
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) scale(1)';
    }, 24);

    // 动画完成后清理内联样式，交回 CSS（恢复 .press 按压反馈）
    setTimeout(() => {
      el.style.transition = '';
      el.style.transitionDelay = '';
      el.style.transform = '';
      el.style.opacity = '';
    }, 640 + delay);
  },
});

app.use(router).mount('#app');
