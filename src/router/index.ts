import { createRouter, createWebHashHistory, type RouteRecordRaw, type RouteMeta } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import { hasPermission } from '@/utils/permissionChecker'
import type { ModuleName, Permission } from '@/types/permissions'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import CommitteView from '@/views/admin/committe/CommitteView.vue'
import CommitteeDashboarView from '@/views/admin/committe/dashboard/committeeDashboarView.vue'
import DashboardView from '@/views/admin/dashboard/DashboardView.vue'
import RolesView from '@/views/admin/roles/RolesView.vue'
import LoginView from '@/views/auth/login/LoginView.vue'
import CommitteeListView from '@/views/admin/committe/CommitteeListView.vue'

interface CustomRouteMeta extends RouteMeta {
  requiresAuth: boolean
  module?: ModuleName
  permission?: Permission
}

interface CustomRouteRecordRaw extends Omit<RouteRecordRaw, 'meta' | 'children'> {
  meta?: CustomRouteMeta
  children?: CustomRouteRecordRaw[]
}

const routes: CustomRouteRecordRaw[] = [
  { path: '/', redirect: '/login' },

  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false },
  },

  {
    path: '/admin',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true, module: 'Dashboard', permission: 'READ' },
      },
      {
        path: 'roles',
        component: RolesView,
        meta: { requiresAuth: true, module: 'RolesAndAccess', permission: 'MANAGE' },
      },
      {
        path: 'committe',
        component: CommitteView,
        meta: { requiresAuth: true, module: 'Committee', permission: 'MANAGE' },
        children: [
          { path: '', component: CommitteeListView },
          { path: ':id', component: CommitteeDashboarView },
        ],
      },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: routes as RouteRecordRaw[],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()
  const userIsLoggedIn = !!authStore.accessToken

  const meta = to.meta as unknown as CustomRouteMeta
  const { requiresAuth, module, permission } = meta

  const permissionsLoaded = permissionStore.permissionsLoaded

  if (userIsLoggedIn && to.path === '/login') {
    return next('/admin/dashboard')
  }

  if (requiresAuth && !userIsLoggedIn) {
    return next('/login')
  }

  if (userIsLoggedIn && module && permission) {
    if (permissionsLoaded) {
      if (hasPermission(module, permission)) {
        return next()
      } else {
        console.error(`Access Denied: ${module} requires ${permission}. Redirecting to Dashboard.`)
        return next('/admin/dashboard')
      }
    } else {
      return next()
    }
  }

  next()
})

export default router
