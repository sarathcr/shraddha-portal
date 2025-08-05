import { createRouter, createWebHashHistory } from 'vue-router'

import DashboardLayout from '@/layouts/DashboardLayout.vue'
import CommitteView from '@/views/admin/committe/CommitteView.vue'
import CommitteeDashboarView from '@/views/admin/committe/dashboard/committeeDashboarView.vue'
import DashboardView from '@/views/admin/dashboard/DashboardView.vue'
import RolesView from '@/views/admin/roles/RolesView.vue'
import LoginView from '@/views/auth/login/LoginView.vue'
import CommitteeListView from '@/views/admin/committe/CommitteeListView.vue'

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
      component: DashboardLayout,
      children: [
        {
          path: 'committe',
          component: CommitteView,
          children: [
            { path: '', component: CommitteeListView },
            {
              path: ':id',
              component: CommitteeDashboarView,
            },
          ],
        },
        {
          path: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'roles',
          component: RolesView,
        },
      ],
    },
  ],
})

export default router
