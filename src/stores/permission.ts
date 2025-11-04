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
      const map: PermissionMap = {} as PermissionMap

      userPermissions.value.forEach((roleData) => {
        roleData.modulePermissions.forEach((modulePerm) => {
          const moduleName: ModuleName = modulePerm.module
          if (!map[moduleName]) {
            map[moduleName] = [] as Permission[]
          }
          modulePerm.permissions.forEach((perm) => {
            const permission = perm.permission
            if (!map[moduleName]!.includes(permission)) {
              map[moduleName]!.push(permission)
            }
          })
        })
      })

      return map
    })

    const permissionsLoaded = computed(() => userPermissions.value.length > 0)

    return { userPermissions, permissionMap, permissionsLoaded, setPermissions, clearPermissions }
  },
  {
    persist: {
      storage: sessionStorage,
    },
  },
)
