import { createRouter, createWebHashHistory } from 'vue-router'

import DashboardLayout from '@/layouts/DashboardLayout.vue'
import CommitteView from '@/views/admin/committe/CommitteView.vue'
import CommitteeDashboarView from '@/views/admin/committe/dashboard/committeeDashboarView.vue'
import DashboardView from '@/views/admin/dashboard/DashboardView.vue'
import RolesView from '@/views/admin/roles/RolesView.vue'
import LoginView from '@/views/auth/login/LoginView.vue'
import CommitteeListView from '@/views/admin/committe/CommitteeListView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },

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
            { path: ':id', component: CommitteeDashboarView },
          ],
        },
        { path: 'dashboard', component: DashboardView },
        { path: 'roles', component: RolesView },
      ],
    },

    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (!authStore.accessToken && to.path.startsWith('/admin')) {
    return next('/login')
  }
  if (authStore.accessToken && to.path === '/login') {
    return next('/admin/dashboard')
  }

  next()
})

export default router
