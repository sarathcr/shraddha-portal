import CommitteView from '@/views/admin/committe/CommitteView.vue'
import DashboardView from '@/views/admin/dashboard/DashboardView.vue'
import LoginView from '@/views/auth/login/LoginView.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
    {
      path: '/admin/committe',
      name: 'committe',
      component: CommitteView,
    },
  ],
})

export default router
