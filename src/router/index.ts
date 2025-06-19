import DashboardView from '@/views/admin/dashboard/DashboardView.vue'
import LoginView from '@/views/auth/login/LoginView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/:pathMatch(.*)*', redirect: '/login' },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/admin/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
  ],
})

export default router
