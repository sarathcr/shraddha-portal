<script setup lang="ts">
import HeaderView from '@/components/HeaderView.vue'
import SidebarView from '@/components/SidebarView.vue'
import { useSidebarStore } from '@/stores/sidebar'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

// ---  STATE & STORE ---
const sidebarStore = useSidebarStore()

const screenWidth = ref(window.innerWidth)
const isDesktop = computed(() => screenWidth.value >= 1024)

const updateScreenWidth = (): void => {
  screenWidth.value = window.innerWidth
}

watch(isDesktop, (isNowDesktop, wasPreviouslyDesktop) => {
  // This check prevents the watch from running on initial component load
  if (wasPreviouslyDesktop === undefined) {
    return
  }

  // If we just resized from mobile to desktop, show the sidebar.
  if (isNowDesktop && !wasPreviouslyDesktop) {
    sidebarStore.showSidebar()
  }

  // If we just resized from desktop to mobile, hide the sidebar.
  if (!isNowDesktop && wasPreviouslyDesktop) {
    sidebarStore.hideSidebar()
  }
})

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  window.addEventListener('resize', updateScreenWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})
</script>
<template>
  <div class="dashboardLayout min-h-screen flex flex-col bg-[#f1f5f9] z-0">
    <div class="dashboardLayout__header">
      <HeaderView />
    </div>

    <div
      class="dashboardLayout__main p-4 lg:p-8 grow-1 flex mt-[62px]"
      :class="[sidebarStore.isSidebarVisible && isDesktop ? 'gap-[30px]' : 'gap-0']"
    >
      <div
        class="dashboardLayout__sidebar transition-all duration-400 ease-in-out"
        :class="[sidebarStore.isSidebarVisible && isDesktop ? 'w-[240px]' : 'w-0']"
      >
        <div class="w-[240px] bg-white">
          <SidebarView />
        </div>
      </div>

      <div
        class="dashboardLayout__content w-full flex flex-col gap-7 lg:h-[calc(100svh-126px)] overflow-auto"
      >
        <RouterView />
      </div>
    </div>
  </div>
</template>
