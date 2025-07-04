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

export const getRoles = async (): Promise<OptionItem[]> => {
  const { data, get } = useFetch('/test.json').json<{ roles: OptionItem[] }>()
  await get() // 👈 triggers fetch
  return data.value?.roles || []
}

export const getTeams = async (): Promise<OptionItem[]> => {
  const { data, get } = useFetch('/test.json').json<{ teams: OptionItem[] }>()
  await get() // 👈 triggers fetch
  return data.value?.teams || []
}
