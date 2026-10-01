import { createApp } from 'vue';
import Vant, { Lazyload } from 'vant';
import 'vant/lib/index.css';
import App from './App.vue';
import router from './router.js';
import './style.css';

createApp(App).use(router).use(Vant).use(Lazyload).mount('#app');
