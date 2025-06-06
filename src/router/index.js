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
  {
    path: '/players',
    name: 'dashboard-Players',
    component: () => import('@/pages/Players/index.vue'),
    props: true,
  },
  {
    path: '/vehicle',
    name: 'dashboard-Vehicle',
    component: () => import('@/pages/Vehicles/index.vue'),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
