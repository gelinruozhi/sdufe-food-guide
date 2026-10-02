import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/', component: () => import('./views/Home.vue'), meta: { tab: true } },
  { path: '/canteen/:id', component: () => import('./views/CanteenDetail.vue') },
  { path: '/stall/:id', component: () => import('./views/StallDetail.vue') },
  { path: '/search', component: () => import('./views/Search.vue'), meta: { tab: true } },
  { path: '/ranking', component: () => import('./views/Ranking.vue') },
  { path: '/contribute', component: () => import('./views/Contribute.vue') },
  { path: '/login', component: () => import('./views/Login.vue') },
  { path: '/register', component: () => import('./views/Register.vue') },
  { path: '/profile', component: () => import('./views/Profile.vue'), meta: { tab: true } },
  { path: '/favorites', component: () => import('./views/Favorites.vue') },
  { path: '/my-reviews', component: () => import('./views/MyReviews.vue') },
  { path: '/my-contributions', component: () => import('./views/MyContributions.vue') },
  { path: '/admin', component: () => import('./views/Admin.vue') },
  { path: '/disclaimer', component: () => import('./views/Disclaimer.vue') },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
