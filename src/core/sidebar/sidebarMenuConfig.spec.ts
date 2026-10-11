import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createMenuItems } from './sidebarMenuConfig'
import { useSidebarStore } from './sidebarStore'
import router from '@/core/router'

describe('sidebarMenuConfig', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('creates menu items and executes command navigation for non-modal mode', async () => {
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined as never)
    const sidebarStore = useSidebarStore()
    sidebarStore.isSidebarVisible = true

    const items = createMenuItems(() => false)
    expect(items.length).toBeGreaterThan(0)

    const dashboardItem = items.find((i) => i.label === 'Dashboard')
    expect(dashboardItem).toBeDefined()

    await dashboardItem?.command?.()
    expect(pushSpy).toHaveBeenCalledWith('/admin/dashboard')
    expect(sidebarStore.isSidebarVisible).toBe(true)
  })

  it('closes sidebar when navigating in modal mode', async () => {
    vi.spyOn(router, 'push').mockResolvedValue(undefined as never)
    const sidebarStore = useSidebarStore()
    sidebarStore.isSidebarVisible = true

    const items = createMenuItems(() => true)
    const rolesItem = items.find((i) => i.label === 'Roles And Access')

    await rolesItem?.command?.()
    expect(sidebarStore.isSidebarVisible).toBe(false)
  })
})
