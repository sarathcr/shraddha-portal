import DashboardLayout from '@/layouts/DashboardLayout.vue'
import CommitteView from '@/views/admin/committe/CommitteView.vue'
import DashboardView from '@/views/admin/dashboard/DashboardView.vue'
import RolesView from '@/views/admin/roles/RolesView.vue'

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
      path: '/admin',
      name: 'Dashboard Layout',
      component: DashboardLayout,
      children: [
        {
          path: '/admin/committe',
          name: 'committe',
          component: CommitteView,
        },
        {
          path: '/admin/dashboard',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: '/admin/roles',
          name: 'roles',
          component: RolesView,
        },
      ],
    },
  ],
})

export default router
