import { useFetch } from '@vueuse/core'
import type { User, OptionItem } from '@/types/user'
import type { ApiResponse, APIError } from '@/types/index'
import { setLoading } from '@/stores/loader'

interface TestJsonData {
  users: User[]
  roles: OptionItem[]
  teams: OptionItem[]
}

let cachedData: TestJsonData | null = null
const getMockData = async (): Promise<TestJsonData> => {
  if (cachedData) {
    return cachedData
  }

  const { data } = await useFetch('/test.json').json<TestJsonData>()
  if (!data.value) {
    throw new Error('Failed to fetch or parse test.json')
  }
  cachedData = data.value
  return cachedData
}

const createMockApiResponse = <T>(data: T, message: string): ApiResponse<T> => {
  return {
    data,
    message,
    succeeded: true,
    errors: null,
    pageNumber: 1,
    pageSize: Array.isArray(data) ? data.length : 1,
    totalPages: 1,
    totalRecords: Array.isArray(data) ? data.length : 1,
  }
}

const createApiError = (
  businessError: number,
  errorValue: string,
  type: 'ConflictError' | 'NotFoundError',
  failedAction: string,
): APIError => {
  const message = `User ${failedAction} failed`
  return {
    error: { businessError, message, errorValue, type },
    message: `${message}: ${errorValue}`,
  }
}

const simulateApiCall = async <T>(callback: () => Promise<T>): Promise<T> => {
  setLoading(true)
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return await callback()
  } finally {
    setLoading(false)
  }
}

export const createUser = async (payload: User): Promise<ApiResponse<User>> => {
  return simulateApiCall(async () => {
    const { users } = await getMockData()

    if (users.some((u) => u.email === payload.email)) {
      throw createApiError(1002, 'Email already exists', 'ConflictError', 'creation')
    }

    const newUser: User = {
      ...payload,
      id: Math.random().toString(36).slice(2),
      dob: new Date().toISOString().slice(0, 10),
    }

    return createMockApiResponse(newUser, 'User created successfully')
  })
}

export const editUser = async (
  userId: string,
  payload: Partial<Omit<User, 'id' | 'dob'>>,
): Promise<ApiResponse<User>> => {
  return simulateApiCall(async () => {
    const { users } = await getMockData()
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      throw createApiError(1003, 'User not found', 'NotFoundError', 'update')
    }

    if (
      payload.email &&
      users.some((u, index) => u.email === payload.email && index !== userIndex)
    ) {
      throw createApiError(1002, 'Email already exists for another user', 'ConflictError', 'update')
    }

    const updatedUser: User = {
      ...users[userIndex],
      ...payload,
      id: userId,
    }

    return createMockApiResponse(updatedUser, 'User updated successfully')
  })
}

const getOptionData = async (key: 'roles' | 'teams'): Promise<ApiResponse<OptionItem[]>> => {
  return simulateApiCall(async () => {
    const data = await getMockData()
    const items = data[key] || []
    const message = `${key.charAt(0).toUpperCase() + key.slice(1)} fetched successfully`
    return createMockApiResponse(items, message)
  })
}

export const getRoles = (): Promise<ApiResponse<OptionItem[]>> => getOptionData('roles')
export const getTeams = (): Promise<ApiResponse<OptionItem[]>> => getOptionData('teams')
