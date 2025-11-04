import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  Permission,
  ModuleName,
  UserPermissionsData,
  PermissionMap,
} from '@/types/permissions'

export const usePermissionStore = defineStore(
  'permission',
  () => {
    const userPermissions = ref<UserPermissionsData[]>([])
    function setPermissions(permissionsData: UserPermissionsData[]): void {
      userPermissions.value = permissionsData
    }
    function clearPermissions(): void {
      userPermissions.value = []
    }
    const permissionMap = computed<PermissionMap>(() => {
      const map = new Map<ModuleName, Set<Permission>>()

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

      const finalMapWithArrays = Object.fromEntries(
        Array.from(map.entries(), ([moduleName, permissionSet]) => [
          moduleName,
          Array.from(permissionSet),
        ]),
      )

      return finalMapWithArrays as PermissionMap
    })

    const permissionsLoaded = computed(() => userPermissions.value.length > 0)

    return {
      userPermissions,
      permissionMap,
      permissionsLoaded,
      setPermissions,
      clearPermissions,
    }
  },
  {
    persist: {
      storage: sessionStorage,
    },
  },
)
