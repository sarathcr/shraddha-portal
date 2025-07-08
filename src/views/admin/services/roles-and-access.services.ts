import { useFetch } from '@vueuse/core'
import type { User, OptionItem } from '@/types/user'

export const createUser = async (
  payload: Omit<User, 'id'>,
): Promise<{ message: string; data: User }> => {
  const { data: json } = await useFetch('/test.json').json<{
    users: User[]
    roles: OptionItem[]
    teams: OptionItem[]
  }>()

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
    }
  }

  const newUser: User = {
    id: Math.random().toString(36).slice(2),
    ...payload,
  }
  return {
    message: 'User created successfully',
    data: newUser,
  }
}

export const editUser = async (
  userId: string,
  payload: Partial<Omit<User, 'id'>>,
): Promise<{ message: string; data: User }> => {
  const { data: json } = await useFetch('/test.json').json<{
    users: User[]
    roles: OptionItem[]
    teams: OptionItem[]
  }>()

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
    }
  }
  if (payload.email && users.some((u, index) => u.email === payload.email && index !== userIndex)) {
    throw {
      error: {
        businessError: 1002,
        message: 'User update failed',
        errorValue: 'Email already exists for another user',
        type: 'ConflictError',
      },
    }
  }
  const updatedUser: User = {
    ...users[userIndex],
    ...payload,
    id: userId,
  }

  return {
    message: 'User updated successfully',
    data: updatedUser,
  }
}

export const getRoles = async (): Promise<OptionItem[]> => {
  const { data, get } = useFetch('/test.json').json<{ roles: OptionItem[] }>()
  await get()
  return data.value?.roles || []
}

export const getTeams = async (): Promise<OptionItem[]> => {
  const { data, get } = useFetch('/test.json').json<{ teams: OptionItem[] }>()
  await get()
  return data.value?.teams || []
}
