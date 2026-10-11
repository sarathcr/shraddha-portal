import { createRouter, createWebHashHistory, type RouteRecordRaw, type RouteMeta } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import { hasModuleAccess } from '@/utils/permissionChecker'
import type { Permission } from '@/types/permissions'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import CommitteView from '@/views/admin/committe/CommitteView.vue'
import CommitteeDashboarView from '@/views/admin/committe/dashboard/committeeDashboarView.vue'
import DashboardView from '@/views/admin/dashboard/DashboardView.vue'
import RolesView from '@/views/admin/roles/RolesView.vue'
import LoginView from '@/views/auth/login/LoginView.vue'
import CommitteeListView from '@/views/admin/committe/CommitteeListView.vue'
import EventTypesView from '@/views/admin/events/EventTypesView.vue'
import EventView from '@/views/admin/events/EventView.vue'
import EventsListView from '@/views/admin/events/EventsListView.vue'
import EventTypeListView from '@/views/admin/event-type/EventTypeListView.vue'

interface CustomRouteMeta extends RouteMeta {
  requiresAuth: boolean
  module?: string
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
        meta: { requiresAuth: true, module: 'RolesAndAccess', permission: 'READ' },
      },
      {
        path: 'committe',
        component: CommitteView,
        meta: { requiresAuth: true, module: 'Committee', permission: 'READ' },
        children: [
          { path: '', component: CommitteeListView },
          { path: ':id', component: CommitteeDashboarView },
        ],
      },
      {
        path: 'events',
        component: EventView,
        meta: { requiresAuth: true, module: 'Events', permission: 'READ' },
        children: [
          { path: '', component: EventTypesView },
          { path: ':id', component: EventsListView },
        ],
      },
      {
        path: 'settings/event-types',
        component: EventTypeListView,
        children: [{ path: 'settings/event-types', component: EventTypeListView }],
        meta: { requiresAuth: true, module: 'Settings', permission: 'READ' },
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
  const { requiresAuth, module } = meta

  const permissionsLoaded = permissionStore.permissionsLoaded

  if (userIsLoggedIn && to.path === '/login') {
    return next('/admin/dashboard')
  }

  if (requiresAuth && !userIsLoggedIn) {
    return next('/login')
  }

  if (userIsLoggedIn && module) {
    if (permissionsLoaded) {
      if (hasModuleAccess(module)) {
        return next()
      } else {
        console.error(`Access Denied: User has no access to ${module}. Redirecting to Dashboard.`)
        return next('/admin/dashboard')
      }
    } else {
      return next()
    }
  }

  next()
})

export default router
