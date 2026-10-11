import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSidebarStore } from '@/core/sidebar/sidebarStore'

describe('Sidebar Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('toggles sidebar visibility correctly', () => {
    const store = useSidebarStore()
    const initial = store.isSidebarVisible

    store.toggleSidebar()
    expect(store.isSidebarVisible).toBe(!initial)

    store.toggleSidebar()
    expect(store.isSidebarVisible).toBe(initial)
  })

  it('toggles collapse state correctly', () => {
    const store = useSidebarStore()
    expect(store.isCollapsed).toBe(false)

    store.toggleCollapse()
    expect(store.isCollapsed).toBe(true)
  })

  it('sets active sub menu correctly', () => {
    const store = useSidebarStore()
    expect(store.activeSubMenu).toBeNull()

    store.setActiveSubMenu('Finance')
    expect(store.activeSubMenu).toBe('Finance')

    store.clearActiveSubMenu()
    expect(store.activeSubMenu).toBeNull()
  })

  it('sets collapsed state and shows/hides sidebar explicitly', () => {
    const store = useSidebarStore()
    store.setCollapsed(true)
    expect(store.isCollapsed).toBe(true)
    store.setCollapsed(false)
    expect(store.isCollapsed).toBe(false)

    store.hideSidebar()
    expect(store.isSidebarVisible).toBe(false)
    store.showSidebar()
    expect(store.isSidebarVisible).toBe(true)
  })
})
