import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Permission, UserPermissionsData } from '@/types/permissions'

import { fetchAvailableModules } from '../views/auth/services/module.service'
import type { ModuleApiData } from '@/types/module'

export const usePermissionStore = defineStore(
  'permission',
  () => {
    const userPermissions = ref<UserPermissionsData[]>([])

    const moduleNames = ref<ModuleApiData[]>([])

    function setPermissions(permissionsData: UserPermissionsData[]): void {
      userPermissions.value = permissionsData
    }
    function clearPermissions(): void {
      userPermissions.value = []
      moduleNames.value = []
    }

    async function loadModuleNames(force = false): Promise<void> {
      if (force || moduleNames.value.length === 0) {
        try {
          const modules = await fetchAvailableModules()
          moduleNames.value = modules
        } catch (error) {
          console.error('Permission Store: Error loading module names:', error)
        }
      }
    }

    const permissionMap = computed<Record<string, Permission[]>>(() => {
      const map = new Map<string, Set<Permission>>()

      const allModulePermissions = userPermissions.value.flatMap(
        (roleData) => roleData.modulePermissions,
      )

      for (const modulePerm of allModulePermissions) {
        const moduleName = modulePerm.module

        if (!map.has(moduleName)) {
          map.set(moduleName, new Set<Permission>())
        }
        const permissionSet = map.get(moduleName)!

        for (const perm of modulePerm.permissions) {
          permissionSet.add(perm.permission)
        }
      }

      return Object.fromEntries(Array.from(map.entries(), ([name, set]) => [name, Array.from(set)]))
    })

    const permissionsLoaded = computed(() => userPermissions.value.length > 0)
    const modulesLoaded = computed(() => moduleNames.value.length > 0)

    return {
      userPermissions,
      moduleNames,
      permissionMap,
      permissionsLoaded,
      modulesLoaded,
      setPermissions,
      clearPermissions,
      loadModuleNames,
    }
  },
  {
    persist: {
      storage: sessionStorage,
      pick: ['userPermissions', 'moduleNames'],
    },
  },
)
