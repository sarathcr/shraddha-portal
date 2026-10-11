<script lang="ts" setup>
import { computed, watch } from 'vue'
import { useSidebarStore } from '@/core/sidebar/sidebarStore'
import Drawer from 'primevue/drawer'
import router from '@/core/router'

import { hasModuleAccess } from '@/core/permissions/permissionChecker'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import { createMenuItems, type MenuItem } from '@/core/sidebar/sidebarMenuConfig'

const sidebarStore = useSidebarStore()
const breakpoints = useBreakpoints(breakpointsTailwind)
const isDesktop = breakpoints.greaterOrEqual('lg')

const isModal = computed((): boolean => !isDesktop.value)

const fullMenuItems = computed(() => createMenuItems(() => isModal.value))

const filterMenuItems = (items: MenuItem[], currentPath: string): MenuItem[] => {
  return items
    .map((item): MenuItem | null => {
      const clonedItem: MenuItem = { ...item }

      if (clonedItem.items) {
        clonedItem.items = filterMenuItems(clonedItem.items, currentPath)
      }

      const requiredModule = clonedItem.module
      let isPermitted = true
      if (requiredModule) {
        isPermitted = hasModuleAccess(requiredModule)
      }

      if (isPermitted || (clonedItem.items && clonedItem.items.length > 0)) {
        clonedItem.class = ''
        if (clonedItem.to && currentPath === clonedItem.to) {
          clonedItem.class = 'p-menuitem-active'
        } else if (clonedItem.to && currentPath.startsWith(clonedItem.to)) {
          clonedItem.class = 'p-menuitem-active'
        }

        if (clonedItem.label === 'Events' && currentPath.startsWith('/admin/events')) {
          clonedItem.class = 'p-menuitem-active'
        } else if (clonedItem.label === 'Approvals' && currentPath.startsWith('/admin/approvals')) {
          clonedItem.class = 'p-menuitem-active'
        } else if (clonedItem.label === 'Finance' && currentPath.startsWith('/admin/finance')) {
          clonedItem.class = 'p-menuitem-active'
        }

        if (
          clonedItem.items &&
          clonedItem.items.some((subItem) => subItem.class === 'p-menuitem-active')
        ) {
          clonedItem.class = 'p-menuitem-active'
        }

        return clonedItem
      }

      return null
    })
    .filter((item): item is MenuItem => item !== null)
}

const menuItems = computed((): MenuItem[] => {
  const currentPath = router.currentRoute.value.path
  return filterMenuItems(fullMenuItems.value, currentPath)
})

const currentSubMenu = computed((): MenuItem | null => {
  if (!sidebarStore.activeSubMenu) return null
  return menuItems.value.find((m) => m.label === sidebarStore.activeSubMenu) || null
})

// Auto-sync activeSubMenu based on current route
watch(
  () => router.currentRoute.value.path,
  (newPath: string) => {
    if (newPath.startsWith('/admin/finance')) {
      sidebarStore.setActiveSubMenu('Finance')
    } else if (newPath.startsWith('/admin/settings')) {
      sidebarStore.setActiveSubMenu('Settings')
    } else {
      sidebarStore.clearActiveSubMenu()
    }
  },
  { immediate: true },
)

const handleItemClick = async (item: MenuItem): Promise<void> => {
  if (item.items && item.items.length > 0) {
    if (sidebarStore.activeSubMenu === item.label) {
      sidebarStore.clearActiveSubMenu()
    } else {
      sidebarStore.setActiveSubMenu(item.label)
    }
    return
  }

  if (item.command) {
    await item.command()
  } else if (item.to) {
    sidebarStore.clearActiveSubMenu()
    await router.push(item.to)
    if (isModal.value) {
      sidebarStore.isSidebarVisible = false
    }
  }
}

const handleSubItemClick = async (subItem: MenuItem): Promise<void> => {
  if (subItem.command) {
    await subItem.command()
  } else if (subItem.to) {
    await router.push(subItem.to)
    if (isModal.value) {
      sidebarStore.isSidebarVisible = false
    }
  }
}
</script>

<template>
  <!-- Desktop Two-Tier View (rendered when isDesktop is true) -->
  <div
    v-if="isDesktop"
    class="h-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-2.5 flex flex-row gap-2 overflow-hidden transition-all duration-300"
  >
    <!-- Primary Sidebar Rail -->
    <nav
      class="shrink-0 flex flex-col gap-1 overflow-y-auto transition-all duration-300 pr-0.5"
      :class="[sidebarStore.isCollapsed ? 'w-[56px]' : 'w-[200px]']"
    >
      <!-- Collapse / Expand Toggle Header -->
      <div
        class="flex items-center justify-between pb-2 mb-1 border-b border-slate-100"
        :class="[sidebarStore.isCollapsed ? 'justify-center px-0' : 'px-2']"
      >
        <span
          v-if="!sidebarStore.isCollapsed"
          class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
          >Menu</span
        >
        <button
          type="button"
          class="size-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer"
          v-tooltip.right="sidebarStore.isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
          aria-label="Toggle collapse sidebar"
          @click="sidebarStore.toggleCollapse()"
        >
          <i
            :class="sidebarStore.isCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"
            class="text-sm"
          ></i>
        </button>
      </div>

      <!-- Menu Items -->
      <button
        v-for="item in menuItems"
        :key="item.label"
        type="button"
        v-tooltip.right="sidebarStore.isCollapsed ? item.label : undefined"
        class="flex items-center rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-left"
        :class="[
          sidebarStore.isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5',
          item.class === 'p-menuitem-active' || sidebarStore.activeSubMenu === item.label
            ? 'bg-indigo-50 text-indigo-700 shadow-xs border-l-3 border-indigo-600 font-bold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
        ]"
        @click="handleItemClick(item)"
      >
        <div
          class="flex items-center gap-2.5 truncate"
          :class="{ 'justify-center': sidebarStore.isCollapsed }"
        >
          <i :class="item.icon" class="text-sm shrink-0"></i>
          <span v-if="!sidebarStore.isCollapsed" class="truncate">{{ item.label }}</span>
        </div>

        <i
          v-if="!sidebarStore.isCollapsed && item.items && item.items.length"
          class="pi pi-chevron-right text-[10px] text-slate-400 transition-transform duration-150"
          :class="{ 'rotate-90 text-indigo-600': sidebarStore.activeSubMenu === item.label }"
        ></i>
      </button>
    </nav>

    <!-- Inner Submenu Sidebar (Desktop) -->
    <aside
      v-if="currentSubMenu && currentSubMenu.items"
      class="w-[195px] shrink-0 border-l border-slate-100 pl-3 pr-2.5 flex flex-col gap-2 overflow-y-auto"
    >
      <div class="flex items-center justify-between pb-2 border-b border-slate-100 pt-1.5 px-0.5">
        <div
          class="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider"
        >
          <i :class="currentSubMenu.icon" class="text-indigo-600"></i>
          <span class="truncate">{{ currentSubMenu.label }}</span>
        </div>
        <button
          type="button"
          class="size-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer p-1"
          aria-label="Close sub menu"
          @click="sidebarStore.clearActiveSubMenu()"
        >
          <i class="pi pi-times text-xs"></i>
        </button>
      </div>

      <div class="flex flex-col gap-1 pt-1">
        <button
          v-for="sub in currentSubMenu.items"
          :key="sub.label"
          type="button"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-left"
          :class="[
            sub.class === 'p-menuitem-active'
              ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-600'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
          ]"
          @click="handleSubItemClick(sub)"
        >
          <i :class="sub.icon" class="text-xs"></i>
          <span class="truncate">{{ sub.label }}</span>
        </button>
      </div>
    </aside>
  </div>

  <!-- Mobile Drawer View (rendered when !isDesktop) -->
  <Drawer
    v-else
    v-model:visible="sidebarStore.isSidebarVisible"
    :modal="true"
    :dismissable="true"
    position="left"
    class="mobile-sidebar-drawer"
  >
    <div class="flex flex-col h-full gap-2 p-1">
      <!-- Mobile Sub-Menu View (when activeSubMenu is open) -->
      <div v-if="currentSubMenu && currentSubMenu.items" class="flex flex-col gap-2">
        <button
          type="button"
          class="flex items-center gap-2 text-xs font-semibold text-indigo-700 pb-3 border-b border-slate-100 cursor-pointer"
          @click="sidebarStore.clearActiveSubMenu()"
        >
          <i class="pi pi-arrow-left text-xs"></i>
          <span>Back to Main Menu</span>
        </button>

        <div class="flex items-center gap-2 px-2 py-1 text-sm font-bold text-slate-800">
          <i :class="currentSubMenu.icon" class="text-indigo-600"></i>
          <span>{{ currentSubMenu.label }}</span>
        </div>

        <div class="flex flex-col gap-1 pt-2">
          <button
            v-for="sub in currentSubMenu.items"
            :key="sub.label"
            type="button"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left"
            :class="[
              sub.class === 'p-menuitem-active'
                ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-600'
                : 'text-slate-600 hover:bg-slate-50',
            ]"
            @click="handleSubItemClick(sub)"
          >
            <i :class="sub.icon" class="text-xs"></i>
            <span>{{ sub.label }}</span>
          </button>
        </div>
      </div>

      <!-- Mobile Primary Menu (when no activeSubMenu) -->
      <nav v-else class="flex flex-col gap-1 overflow-y-auto">
        <button
          v-for="item in menuItems"
          :key="item.label"
          type="button"
          class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer"
          :class="[
            item.class === 'p-menuitem-active'
              ? 'bg-indigo-50 text-indigo-700 border-l-3 border-indigo-600'
              : 'text-slate-600 hover:bg-slate-50',
          ]"
          @click="handleItemClick(item)"
        >
          <div class="flex items-center gap-2.5">
            <i :class="item.icon" class="text-sm"></i>
            <span>{{ item.label }}</span>
          </div>

          <i
            v-if="item.items && item.items.length"
            class="pi pi-chevron-right text-xs text-slate-400"
          ></i>
        </button>
      </nav>
    </div>
  </Drawer>
</template>

<style lang="scss">
.mobile-sidebar-drawer {
  width: 280px !important;
  max-width: 85vw !important;

  .p-drawer-header {
    padding: 0.75rem 1rem 0.25rem 1rem !important;
  }

  .p-drawer-content {
    padding: 0.25rem 1rem 1rem 1rem !important;
    overflow-y: auto;
  }

  .p-drawer-close-button {
    margin-left: auto;
    width: 2rem !important;
    height: 2rem !important;
    border-radius: 0.5rem !important;
  }
}
</style>
