import { useFetch } from '@vueuse/core'
import type { User, OptionItem } from '@/types/user'
import type { ApiResponse, APIError } from '@/types/index'
interface TestJsonData {
  users: User[]
  roles: OptionItem[]
  teams: OptionItem[]
}

function createMockApiResponse<T>(
  data: T,
  message: string,
  succeeded: boolean = true,
  errors: string | null = null,
  pageNumber: number = 1,
  pageSize: number = 10,
  totalPages: number = 1,
  totalRecords: number = Array.isArray(data) ? data.length : 1,
): ApiResponse<T> {
  return {
    data,
    message,
    succeeded,
    errors,
    pageNumber,
    pageSize,
    totalPages,
    totalRecords,
  }
}

export const createUser = async (payload: Omit<User, 'id' | 'dob'>): Promise<ApiResponse<User>> => {
  const { data: json } = await useFetch('/test.json').json<TestJsonData>()

  const users = json.value?.users || []

  const emailExists = users.some((u) => u.email === payload.email)
  if (emailExists) {
    throw {
      error: {
        businessError: 1002,
        message: 'User creation failed',
        errorValue: 'Email already exists',
        type: 'ConflictError',
      },
      message: 'Failed to create user: Email already exists',
    } as APIError
  }

  const newUser: User = {
    id: Math.random().toString(36).slice(2),
    dob: new Date().toISOString().slice(0, 10),
    ...payload,
  }

  return createMockApiResponse(newUser, 'User created successfully')
}

export const editUser = async (
  userId: string,
  payload: Partial<Omit<User, 'id' | 'dob'>>,
): Promise<ApiResponse<User>> => {
  const { data: json } = await useFetch('/test.json').json<TestJsonData>()

  const users = json.value?.users || []

  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    throw {
      error: {
        businessError: 1003,
        message: 'User update failed',
        errorValue: 'User not found',
        type: 'NotFoundError',
      },
      message: 'Failed to update user: User not found',
    } as APIError
  }

  if (payload.email && users.some((u, index) => u.email === payload.email && index !== userIndex)) {
    throw {
      error: {
        businessError: 1002,
        message: 'User update failed',
        errorValue: 'Email already exists for another user',
        type: 'ConflictError',
      },
      message: 'Failed to update user: Email already exists for another user',
    } as APIError
  }

  const updatedUser: User = {
    ...users[userIndex],
    ...payload,
    id: userId,
  }

  return createMockApiResponse(updatedUser, 'User updated successfully')
}

export const getRoles = async (): Promise<ApiResponse<OptionItem[]>> => {
  const { data, get } = useFetch('/test.json').json<TestJsonData>()
  await get()
  const roles = data.value?.roles || []
  return createMockApiResponse(roles, 'Roles fetched successfully')
}

export const getTeams = async (): Promise<ApiResponse<OptionItem[]>> => {
  const { data, get } = useFetch('/test.json').json<TestJsonData>()
  await get()
  const teams = data.value?.teams || []
  return createMockApiResponse(teams, 'Teams fetched successfully')
}
