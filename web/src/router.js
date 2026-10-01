import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/', component: () => import('./views/Home.vue'), meta: { tab: 'home' } },
  { path: '/canteen/:id', component: () => import('./views/CanteenDetail.vue') },
  { path: '/stall/:id', component: () => import('./views/StallDetail.vue') },
  { path: '/search', component: () => import('./views/Search.vue'), meta: { tab: 'search' } },
  { path: '/contribute', component: () => import('./views/Contribute.vue'), meta: { tab: 'contribute' } },
  { path: '/login', component: () => import('./views/Login.vue') },
  { path: '/me', component: () => import('./views/Profile.vue'), meta: { tab: 'me' } },
  { path: '/favorites', component: () => import('./views/Favorites.vue') },
  { path: '/my-reviews', component: () => import('./views/MyReviews.vue') },
  { path: '/my-contributions', component: () => import('./views/MyContributions.vue') },
  { path: '/admin', component: () => import('./views/Admin.vue') },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
