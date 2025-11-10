<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'
import { Drawer } from 'primevue'

import PanelMenu from 'primevue/panelmenu'
import router from '@/router'

import { hasModuleAccess } from '@/utils/permissionChecker'
import type { ModuleName, Permission } from '@/types/permissions'

interface MenuItem {
  label: string
  icon: string
  command?: () => Promise<void>
  class?: string
  expandIconPosition?: 'right' | 'left'
  items?: MenuItem[]
  module?: ModuleName
  permission?: Permission
  to?: string
}

const sidebarStore = useSidebarStore()

const screenWidth = ref(window.innerWidth)

const updateScreenWidth = (): void => {
  screenWidth.value = window.innerWidth
  if (screenWidth.value >= 1024) {
    sidebarStore.isSidebarVisible = true
  } else {
    sidebarStore.isSidebarVisible = false
  }
}

onMounted((): void => {
  window.addEventListener('resize', updateScreenWidth)
  updateScreenWidth()
})

onUnmounted((): void => {
  window.removeEventListener('resize', updateScreenWidth)
})

const isModal = computed((): boolean => screenWidth.value < 1024)
const isDismissable = computed((): boolean => screenWidth.value < 1024)

const fullMenuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    module: 'Dashboard',
    permission: 'READ',
    to: '/admin/dashboard',
    command: async (): Promise<void> => {
      await router.push('/admin/dashboard')
      if (isModal.value) sidebarStore.isSidebarVisible = false
    },
  },
  {
    label: 'Roles And Access',
    icon: 'pi pi-shield',
    module: 'RolesAndAccess',
    permission: 'READ',
    to: '/admin/roles',
    command: async (): Promise<void> => {
      await router.push('/admin/roles')
      if (isModal.value) sidebarStore.isSidebarVisible = false
    },
  },
  {
    label: 'Events',
    icon: 'pi pi-calendar',
    module: 'Events',
    permission: 'READ',
    to: '/admin/events',
    command: async (): Promise<void> => {
      await router.push('/admin/events')
      if (isModal.value) sidebarStore.isSidebarVisible = false
    },
  },
  {
    label: 'Committee',
    icon: 'pi pi-users',
    module: 'Committee',
    permission: 'READ',
    to: '/admin/committe',
    command: async (): Promise<void> => {
      await router.push('/admin/committe')
      if (isModal.value) sidebarStore.isSidebarVisible = false
    },
  },
  {
    label: 'Aprovals',
    icon: 'pi pi-search',
    module: 'Approvals',
    permission: 'READ',
    to: '/admin/approvals',
  },
  {
    label: 'Finance',
    icon: 'pi pi-money-bill',
    expandIconPosition: 'right',
    module: 'Finance',
    permission: 'READ',
    to: '/admin/finance',
    items: [
      {
        label: 'Fund Collection',
        icon: 'pi pi-wallet',
        module: 'Finance',
        permission: 'READ',
        to: '/admin/finance/fund-collection',
        command: async (): Promise<void> => {
          await router.push('/admin/finance/fund-collection')
          if (isModal.value) sidebarStore.isSidebarVisible = false
        },
      },
      {
        label: 'Expenses',
        icon: 'pi pi-money-bill',
        module: 'Finance',
        permission: 'READ',
        to: '/admin/finance/expenses',
        command: async (): Promise<void> => {
          await router.push('/admin/finance/expenses')
          if (isModal.value) sidebarStore.isSidebarVisible = false
        },
      },
      {
        label: 'Balance Sheet',
        icon: 'pi pi-chart-bar',
        module: 'Finance',
        permission: 'READ',
        to: '/admin/finance/balance-sheet',
        command: async (): Promise<void> => {
          await router.push('/admin/finance/balance-sheet')
          if (isModal.value) sidebarStore.isSidebarVisible = false
        },
      },
      {
        label: 'Bills And Uploads',
        icon: 'pi pi-file-o',
        module: 'Finance',
        permission: 'READ',
        to: '/admin/finance/bills-uploads',
        command: async (): Promise<void> => {
          await router.push('/admin/finance/bills-uploads')
          if (isModal.value) sidebarStore.isSidebarVisible = false
        },
      },
    ],
  },
  {
    label: 'Birthday Gifts',
    icon: 'pi pi-gift',
    module: 'BirthdayGifts',
    permission: 'READ',
    to: '/admin/birthday-gifts',
  },
  {
    label: 'Charity',
    icon: 'pi pi-heart',
    module: 'Charity',
    permission: 'READ',
    to: '/admin/charity',
  },
  {
    label: 'Tournaments',
    icon: 'pi pi-trophy',
    module: 'Tournaments',
    permission: 'READ',
    to: '/admin/tournaments',
  },
  {
    label: 'Feedbacks',
    icon: 'pi pi-comments',
    module: 'Feedbacks',
    permission: 'READ',
    to: '/admin/feedbacks',
  },
  {
    label: 'Meeting Minutes',
    icon: 'pi pi-file-word',
    module: 'MeetingMinutes',
    permission: 'READ',
    to: '/admin/meeting-minutes',
  },
]

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
        } else if (clonedItem.label === 'Aprovals' && currentPath.startsWith('/admin/approvals')) {
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
  return filterMenuItems(fullMenuItems, currentPath)
})
</script>
<template class="sidebar-drawer">
   
  <Drawer
    class="sidebar-drawer"
    v-model:visible="sidebarStore.isSidebarVisible"
    :modal="isModal"
    :dismissable="isDismissable"
  >
    <div class="menu-container">
      <PanelMenu :model="menuItems" />
    </div>
  </Drawer>
</template>

<style lang="scss">
.sidebar-drawer {
  padding-top: 1.25rem;

  .p-drawer-header {
    display: none;
  }
  .p-panelmenu-panel {
    border: none;
  }
  .p-panelmenu {
    gap: 0;
  }
  .p-panelmenu-submenu-icon {
    position: absolute;
    right: 10px;
  }
  .p-panelmenu-header-content {
    &:hover {
      background-color: var(--p-primary-bg-color) !important;
    }
  }
  .p-menuitem-active {
    $root: &;
    .p-panelmenu {
      &-header {
        background-color: var(--p-primary-bg-color);
        border-radius: 5px;
        &-link,
        &-icon,
        #{$root}:hover {
          color: var(--p-primary-600) !important;
          font-weight: 600;
        }
      }
    }
  }
  @media screen and (min-width: 1024px) {
    height: calc(100svh - 118px) !important;
    top: 30px;
    left: 30px;
    border-radius: 6px;
    width: 243px !important;
  }
}
</style>
