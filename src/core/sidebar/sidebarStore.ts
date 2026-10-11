import { ref } from 'vue'
import { defineStore } from 'pinia'

const isInitiallyDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024

export const useSidebarStore = defineStore('sidebar', () => {
  const isSidebarVisible = ref(isInitiallyDesktop)
  const isCollapsed = ref(false)
  const activeSubMenu = ref<string | null>(null)

  function toggleSidebar(): void {
    isSidebarVisible.value = !isSidebarVisible.value
  }

  function toggleCollapse(): void {
    isCollapsed.value = !isCollapsed.value
  }

  function setCollapsed(value: boolean): void {
    isCollapsed.value = value
  }

  function showSidebar(): void {
    isSidebarVisible.value = true
  }

  function hideSidebar(): void {
    isSidebarVisible.value = false
  }

  function setActiveSubMenu(name: string | null): void {
    activeSubMenu.value = name
  }

  function clearActiveSubMenu(): void {
    activeSubMenu.value = null
  }

  return {
    isSidebarVisible,
    isCollapsed,
    activeSubMenu,
    toggleSidebar,
    toggleCollapse,
    setCollapsed,
    showSidebar,
    hideSidebar,
    setActiveSubMenu,
    clearActiveSubMenu,
  }
})
