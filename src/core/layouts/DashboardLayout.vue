<script setup lang="ts">
import HeaderView from '@/core/layouts/components/HeaderView.vue'
import SidebarView from '@/core/layouts/components/SidebarView.vue'
import { useSidebarStore } from '@/core/sidebar/sidebarStore'
import { watch } from 'vue'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'

// --- STATE & STORE ---
const sidebarStore = useSidebarStore()
const breakpoints = useBreakpoints(breakpointsTailwind)
const isDesktop = breakpoints.greaterOrEqual('lg')

watch(isDesktop, (isNowDesktop, wasPreviouslyDesktop) => {
  if (wasPreviouslyDesktop === undefined) {
    return
  }

  if (isNowDesktop && !wasPreviouslyDesktop) {
    sidebarStore.showSidebar()
  } else if (!isNowDesktop && wasPreviouslyDesktop) {
    sidebarStore.hideSidebar()
  }
})
</script>

<template>
  <div class="dashboardLayout min-h-screen bg-slate-50/70 flex flex-col">
    <div class="dashboardLayout__header">
      <HeaderView />
    </div>

    <div class="dashboardLayout__main flex-1 pt-[84px] pb-10 px-4 sm:px-6 lg:px-8 max-w-full">
      <!-- Desktop Fixed Sidebar -->
      <aside
        v-if="isDesktop"
        class="dashboardLayout__sidebar fixed top-[84px] left-4 sm:left-6 lg:left-8 z-20 transition-all duration-300 ease-in-out"
        :class="[
          sidebarStore.isCollapsed
            ? sidebarStore.activeSubMenu
              ? 'w-[266px]'
              : 'w-[76px]'
            : sidebarStore.activeSubMenu
              ? 'w-[410px]'
              : 'w-[220px]',
        ]"
        style="height: calc(100vh - 104px)"
      >
        <SidebarView />
      </aside>

      <!-- Mobile Off-Canvas Sidebar Wrapper -->
      <SidebarView v-else />

      <!-- Main Content View -->
      <main
        class="dashboardLayout__content flex flex-col gap-6 transition-all duration-300 ease-in-out"
        :class="[
          isDesktop
            ? sidebarStore.isCollapsed
              ? sidebarStore.activeSubMenu
                ? 'lg:ml-[290px]'
                : 'lg:ml-[100px]'
              : sidebarStore.activeSubMenu
                ? 'lg:ml-[434px]'
                : 'lg:ml-[244px]'
            : 'ml-0',
        ]"
      >
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .dashboardLayout__main {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 76px;
  }
}
</style>
