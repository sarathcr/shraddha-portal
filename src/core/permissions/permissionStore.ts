import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserPermission } from '@/core/permissions/permission.types'
import type { ModuleApiData } from '@/core/permissions/types/module.types'
import { createApi } from '@/api/httpClient'
import { SECURITY_API_BASE_URL } from '@/api/apiConfig'
import { useAuthStore } from '@/core/auth/authStore'

export interface MenuApiResponseItem {
  roleId: string
  role: string
  moduleId: string
  module: string
  read: boolean
  create: boolean
  update: boolean
  delete: boolean
}

const api = createApi(SECURITY_API_BASE_URL)

export const usePermissionStore = defineStore(
  'permission',
  () => {
    const userPermissions = ref<UserPermission[]>([])

    function setPermissions(permissions: any[]): void {
      if (!Array.isArray(permissions)) {
        userPermissions.value = []
        return
      }

      const normalized: UserPermission[] = []

      for (const item of permissions) {
        if (!item) continue

        // Structure 1: Nested role with modulePermissions from /authorization/login
        if (Array.isArray(item.modulePermissions)) {
          for (const modItem of item.modulePermissions) {
            if (!modItem) continue
            const perms: UserPermission['permissions'] = []
            if (Array.isArray(modItem.permissions)) {
              for (const p of modItem.permissions) {
                if (typeof p === 'string') {
                  perms.push(p.toUpperCase() as any)
                } else if (p && typeof p.permission === 'string') {
                  perms.push(p.permission.toUpperCase() as any)
                }
              }
            }
            normalized.push({
              role: item.role || '',
              module: modItem.module as UserPermission['module'],
              permissions: perms,
            })
          }
        }
        // Structure 2: MenuApiResponseItem format (read, create, update, delete boolean properties)
        else if ('read' in item || 'create' in item) {
          const perms: UserPermission['permissions'] = []
          if (item.read) perms.push('READ')
          if (item.create) perms.push('CREATE')
          if (item.update) perms.push('UPDATE')
          if (item.delete) perms.push('DELETE')

          normalized.push({
            role: item.role || '',
            module: item.module as UserPermission['module'],
            permissions: perms,
          })
        }
        // Structure 3: Flat UserPermission format ({ role, module, permissions: ['READ', ...] })
        else if ('module' in item && Array.isArray(item.permissions)) {
          normalized.push({
            role: item.role || '',
            module: item.module as UserPermission['module'],
            permissions: item.permissions.map((p: any) =>
              typeof p === 'string' ? (p.toUpperCase() as any) : p,
            ),
          })
        }
      }

      userPermissions.value = normalized
    }

    const availableModules = ref<ModuleApiData[]>([])

    const moduleIdToNameMap = computed((): Record<string, string> => {
      const map: Record<string, string> = {}
      for (const m of availableModules.value) {
        map[m.id] = m.module
      }
      return map
    })

    function setAvailableModules(modules: ModuleApiData[]): void {
      availableModules.value = Array.isArray(modules) ? modules : []
    }

    function clearPermissions(): void {
      userPermissions.value = []
      availableModules.value = []
    }

    async function fetchAvailableModules(force = false): Promise<ModuleApiData[]> {
      if (!force && availableModules.value.length > 0) {
        return availableModules.value
      }
      try {
        const response = await api.get<{ data?: ModuleApiData[] }>('/authorization/modules')
        const data: ModuleApiData[] = response.data?.data || []
        availableModules.value = data
        return data
      } catch (error) {
        console.error('Permission Store: Failed to fetch available modules:', error)
        return availableModules.value
      }
    }

    async function fetchUserPermissions(): Promise<void> {
      try {
        const authStore = useAuthStore()
        if (!authStore.accessToken) return

        const response = await api.get<MenuApiResponseItem[]>('/menu')
        if (response.data && Array.isArray(response.data)) {
          setPermissions(response.data)
        }
      } catch (error) {
        // Silently handle if /menu is not available on current backend
        console.warn('Unable to fetch additional menu permissions:', error)
      }
    }

    return {
      userPermissions,
      availableModules,
      moduleIdToNameMap,
      setPermissions,
      setAvailableModules,
      fetchAvailableModules,
      clearPermissions,
      fetchUserPermissions,
    }
  },
  {
    persist: true,
  },
)
