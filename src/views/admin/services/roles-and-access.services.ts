import { setLoading } from '@/stores/loader'
import { roles as staticRoles, permissions as staticPermissions } from '@/services/RoleService'
import type { User, OptionItem } from '@/types/user'
import type { Role, PermissionOptions } from '@/types/role'
import type { ApiResponse, APIError } from '@/types/index'
import { useFetch } from '@vueuse/core'

interface TestJsonData {
  users: User[]
  roles: OptionItem[]
  teams: OptionItem[]
  committeeUsers: OptionItem[]
}

let cachedUserData: TestJsonData | null = null

const getMockUserData = async (): Promise<TestJsonData> => {
  if (cachedUserData) return cachedUserData

  const { data } = await useFetch('/test.json').json<TestJsonData>()
  if (!data.value) throw new Error('Failed to fetch or parse test.json')
  cachedUserData = data.value
  return cachedUserData
}

const createMockApiResponse = <T>(data: T, message: string): ApiResponse<T> => ({
  data,
  message,
  succeeded: true,
  errors: null,
  pageNumber: 1,
  pageSize: Array.isArray(data) ? data.length : 1,
  totalPages: 1,
  totalRecords: Array.isArray(data) ? data.length : 1,
})

const simulateApiCall = async <T>(callback: () => Promise<T>): Promise<T> => {
  setLoading(true)
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return await callback()
  } finally {
    setLoading(false)
  }
}

const getOptionData = async (key: 'roles' | 'teams'): Promise<ApiResponse<OptionItem[]>> => {
  return simulateApiCall(async () => {
    const data = await getMockUserData()
    const items = data[key] || []
    const message = `${key.charAt(0).toUpperCase() + key.slice(1)} fetched successfully`
    return createMockApiResponse(items, message)
  })
}

export const getRoles = (): Promise<ApiResponse<OptionItem[]>> => getOptionData('roles')
export const getTeams = (): Promise<ApiResponse<OptionItem[]>> => getOptionData('teams')

const roles: Role[] = [...staticRoles]

const createRoleApiError = (
  businessError: number,
  errorValue: string,
  type: 'ConflictError' | 'NotFoundError',
  failedAction: string,
): APIError => ({
  error: {
    businessError,
    message: `Role ${failedAction} failed`,
    errorValue,
    type,
  },
  message: `Role ${failedAction} failed: ${errorValue}`,
})

export const roleService = {
  getRolesData: async (): Promise<ApiResponse<Role[]>> =>
    simulateApiCall(async () => createMockApiResponse(roles, 'Roles fetched successfully')),

  getPermissions: async (): Promise<ApiResponse<PermissionOptions[]>> =>
    simulateApiCall(async () =>
      createMockApiResponse(staticPermissions, 'Permissions fetched successfully'),
    ),

  createRole: async (payload: Role): Promise<ApiResponse<Role>> =>
    simulateApiCall(async () => {
      if (roles.some((r) => r.roleName === payload.roleName)) {
        throw createRoleApiError(2001, 'Role name already exists', 'ConflictError', 'creation')
      }

      const newRole: Role = { ...payload, id: Math.random().toString(36).slice(2) }
      roles.push(newRole)
      return createMockApiResponse(newRole, 'Role created successfully')
    }),

  editRole: async (
    roleId: string,
    payload: Partial<Omit<Role, 'id'>>,
  ): Promise<ApiResponse<Role>> =>
    simulateApiCall(async () => {
      const index = roles.findIndex((r) => r.id === roleId)
      if (index === -1) {
        throw createRoleApiError(2002, 'Role not found', 'NotFoundError', 'update')
      }

      if (
        payload.roleName &&
        roles.some((r, i) => r.roleName === payload.roleName && i !== index)
      ) {
        throw createRoleApiError(2001, 'Role name already exists', 'ConflictError', 'update')
      }

      const updated = { ...roles[index], ...payload, id: roleId }
      roles[index] = updated
      return createMockApiResponse(updated, 'Role updated successfully')
    }),

  deleteRole: async (roleId: string): Promise<ApiResponse<{ id: string }>> =>
    simulateApiCall(async () => {
      const index = roles.findIndex((r) => r.id === roleId)
      if (index === -1) {
        throw createRoleApiError(2003, 'Role not found', 'NotFoundError', 'deletion')
      }

      const [deleted] = roles.splice(index, 1)
      return createMockApiResponse({ id: deleted.id }, 'Role deleted successfully')
    }),
}
