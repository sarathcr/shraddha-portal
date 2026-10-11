import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchAvailableModules, clearModuleCache } from './module.service'

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    get: vi.fn(),
  },
}))

vi.mock('@/api/httpClient', () => ({
  createApi: vi.fn(() => mockApi),
}))

describe('module.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearModuleCache()
  })

  it('fetches modules from API and caches the result', async () => {
    const fakeModules = [
      { id: '1', module: 'RolesAndAccess' },
      { id: '2', module: 'Events' },
    ]
    ;(mockApi.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { data: fakeModules },
    })

    const result1 = await fetchAvailableModules()
    expect(result1).toEqual(fakeModules)
    expect(mockApi.get).toHaveBeenCalledTimes(1)
    expect(mockApi.get).toHaveBeenCalledWith('/authorization/modules')

    // Second call should return cached data without extra API call
    const result2 = await fetchAvailableModules()
    expect(result2).toEqual(fakeModules)
    expect(mockApi.get).toHaveBeenCalledTimes(1)
  })

  it('clears cache when clearModuleCache is called', async () => {
    const fakeModules = [{ id: '1', module: 'RolesAndAccess' }]
    ;(mockApi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: fakeModules },
    })

    await fetchAvailableModules()
    expect(mockApi.get).toHaveBeenCalledTimes(1)

    clearModuleCache()

    await fetchAvailableModules()
    expect(mockApi.get).toHaveBeenCalledTimes(2)
  })

  it('handles API error gracefully and returns empty array', async () => {
    ;(mockApi.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'))

    const result = await fetchAvailableModules()
    expect(result).toEqual([])
  })
})
