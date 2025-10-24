import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  Permission,
  ModulePermission,
  UserPermissionsData,
  PermissionMap,
} from '@/types/permissions'

export const usePermissionStore = defineStore(
  'permission',
  () => {
    const userPermissions = ref<UserPermissionsData>({
      roleId: '',
      role: '',
      modulePermissions: [] as ModulePermission[],
    })

    function setPermissions(permissionsData: UserPermissionsData): void {
      userPermissions.value = permissionsData
    }

    function clearPermissions(): void {
      userPermissions.value = { roleId: '', role: '', modulePermissions: [] } as UserPermissionsData
    }

    const permissionMap = computed<PermissionMap>(() => {
      return userPermissions.value.modulePermissions.reduce((map, module) => {
        map[module.module] = module.permissions.map((p) => p.permission) as Permission[]
        return map
      }, {} as PermissionMap)
    })

    const permissionsLoaded = computed(() => userPermissions.value.modulePermissions.length > 0)

    return { userPermissions, permissionMap, permissionsLoaded, setPermissions, clearPermissions }
  },
  {
    persist: {
      storage: sessionStorage,
    },
  },
)
