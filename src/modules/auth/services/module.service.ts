import type { ModuleApiData } from '@/core/permissions/types/module.types'
import { createApi } from '@/api/httpClient'
import { SECURITY_API_BASE_URL } from '@/api/apiConfig'

const api = createApi(SECURITY_API_BASE_URL)

let cachedModules: ModuleApiData[] | null = null

export async function fetchAvailableModules(force = false): Promise<ModuleApiData[]> {
  if (!force && cachedModules) {
    return cachedModules
  }
  try {
    const response = await api.get('/authorization/modules')
    const modules: ModuleApiData[] = response.data?.data || []
    cachedModules = modules
    return modules
  } catch (error) {
    console.error('Module Service: Failed to fetch available modules from API:', error)
    return cachedModules ?? []
  }
}

export function clearModuleCache(): void {
  cachedModules = null
}
