import { createRouter, createWebHashHistory, type RouteRecordRaw, type RouteMeta } from 'vue-router'
import { useAuthStore } from '@/core/auth/authStore'
import { usePermissionStore } from '@/core/permissions/permissionStore'
import { hasModuleAccess } from '@/core/permissions/permissionChecker'
import type { Permission } from '@/core/permissions/permission.types'

interface CustomRouteMeta extends RouteMeta {
  requiresAuth: boolean
  module?: string
  permission?: Permission
}

interface CustomRouteRecordRaw extends Omit<RouteRecordRaw, 'meta' | 'children' | 'component'> {
  component?: RouteRecordRaw['component']
  meta?: CustomRouteMeta
  children?: CustomRouteRecordRaw[]
}

const routes: CustomRouteRecordRaw[] = [
  { path: '/', redirect: '/login' },

  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/views/LoginView.vue'),
    meta: { requiresAuth: false },
  },

  {
    path: '/admin',
    component: () => import('@/core/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/modules/dashboard/views/DashboardView.vue'),
        meta: { requiresAuth: true, module: 'Dashboard', permission: 'READ' },
      },
      {
        path: 'roles',
        component: () => import('@/modules/roles/views/RolesView.vue'),
        meta: { requiresAuth: true, module: 'RolesAndAccess', permission: 'READ' },
      },
      {
        path: 'committe',
        component: () => import('@/modules/committee/views/CommitteeListView.vue'),
        meta: { requiresAuth: true, module: 'Committee', permission: 'READ' },
      },
      {
        path: 'events',
        component: () => import('@/modules/events/views/EventsListView.vue'),
        meta: { requiresAuth: true, module: 'Events', permission: 'READ' },
      },
      {
        path: 'settings/event-types',
        component: () => import('@/modules/events/views/EventTypeListView.vue'),
        meta: { requiresAuth: true, module: 'Settings', permission: 'READ' },
      },
      {
        path: 'profile',
        component: () => import('@/modules/profile/views/ProfileView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: routes as RouteRecordRaw[],
})

const MODULE_ROUTES: Record<string, string> = {
  Dashboard: '/admin/dashboard',
  RolesAndAccess: '/admin/roles',
  Committee: '/admin/committe',
  Events: '/admin/events',
  Settings: '/admin/settings/event-types',
}

function getDefaultAuthorizedRoute(): string {
  if (hasModuleAccess('Dashboard')) {
    return '/admin/dashboard'
  }
  for (const [mod, route] of Object.entries(MODULE_ROUTES)) {
    if (hasModuleAccess(mod)) {
      return route
    }
  }
  return '/admin/profile'
}

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()
  const userIsLoggedIn = !!authStore.accessToken

  const meta = to.meta as unknown as CustomRouteMeta
  const { requiresAuth, module } = meta

  // 1. Unauthenticated users trying to access protected routes -> send to /login
  if (requiresAuth && !userIsLoggedIn) {
    return next('/login')
  }

  // 2. If logged-in user has no permissions (e.g. stale/corrupted session):
  // Clear stale tokens and redirect to login so the user can re-authenticate cleanly
  if (userIsLoggedIn && permissionStore.userPermissions.length === 0) {
    console.warn('Session has no permissions loaded. Logging out and redirecting to login.')
    authStore.clearTokens()
    permissionStore.clearPermissions()
    return next('/login')
  }

  // 3. Logged-in user visiting /login -> redirect to default authorized route
  if (userIsLoggedIn && to.path === '/login') {
    const defaultRoute = getDefaultAuthorizedRoute()
    return next(defaultRoute)
  }

  // 4. Check module-specific access for authenticated user
  if (userIsLoggedIn && module) {
    if (hasModuleAccess(module)) {
      return next()
    }

    console.warn(`Access Denied: User has no access to ${module}.`)
    const fallbackRoute = getDefaultAuthorizedRoute()

    // Guard against infinite redirect loops if fallbackRoute matches the denied route
    if (to.path === fallbackRoute) {
      if (to.path !== '/admin/profile') {
        return next('/admin/profile')
      }
      authStore.clearTokens()
      permissionStore.clearPermissions()
      return next('/login')
    }

    return next(fallbackRoute)
  }

  next()
})

export default router
