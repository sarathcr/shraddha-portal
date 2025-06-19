// stores/useSidebarStore.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', () => {
  const isSidebarVisible = ref(true)

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
