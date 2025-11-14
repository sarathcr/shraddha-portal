import { api } from '@/constants'

export async function fetchAvailableModules(): Promise<string[]> {
  try {
    const response = await api.get('/authorization/modules')
    return response.data.data.map((item: { module: string }) => item.module)
  } catch (error) {
    console.error('Module Service: Failed to fetch available modules from API:', error)

    return []
  }
}
