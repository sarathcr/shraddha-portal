import { api } from '@/constants'
import type { ModuleApiData } from '@/types/module'

export async function fetchAvailableModules(): Promise<ModuleApiData[]> {
  try {
    const response = await api.get('/authorization/modules')
    return response.data.data
  } catch (error) {
    console.error('Module Service: Failed to fetch available modules from API:', error)
    return []
  }
}
