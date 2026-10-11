// stores/sidebar.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'

const isInitiallyDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024

export const useSidebarStore = defineStore('sidebar', () => {
  const isSidebarVisible = ref(isInitiallyDesktop)

  function toggleSidebar(): void {
    isSidebarVisible.value = !isSidebarVisible.value
  }

  function showSidebar(): void {
    isSidebarVisible.value = true
  }

  function hideSidebar(): void {
    isSidebarVisible.value = false
  }

  return { isSidebarVisible, toggleSidebar, showSidebar, hideSidebar }
})
