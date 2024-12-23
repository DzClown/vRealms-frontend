import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/pages/Login.vue'), // Halaman login
  },
  {
    path: '/dashboard',
    name: 'dashboard-Dashboard',
    component: () => import('@/pages/Dashboard/index.vue'),
  },
  {
    path: '/logs',
    name: 'dashboard-Logs',
    component: () => import('@/pages/Logs/index.vue'),
  },
  {
    path: '/images',
    name: 'dashboard-Image',
    component: () => import('@/pages/Image/index.vue'),
  },
  {
    path: '/images/:id',
    name: 'dashboard-Image-id',
    component: () => import('@/pages/Image/[id].vue'),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
