import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/login',
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
    path: '/logs/:id',
    name: 'dashboard-Logs-id',
    component: () => import('@/pages/Logs/[id].vue'),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
