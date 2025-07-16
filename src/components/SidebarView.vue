<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'
import { Drawer } from 'primevue'

import PanelMenu from 'primevue/panelmenu'
import router from '@/router'

const sidebarStore = useSidebarStore()

// Reactive screen width
const screenWidth = ref(window.innerWidth)

const updateScreenWidth = (): void => {
  screenWidth.value = window.innerWidth
  if (screenWidth.value >= 1024) {
    sidebarStore.isSidebarVisible = true
  } else {
    sidebarStore.isSidebarVisible = false
  }
}

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth)
  updateScreenWidth()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})

// Computed reactive props
const isModal = computed(() => screenWidth.value < 1024)
const isDismissable = computed(() => screenWidth.value < 1024)

// Computed items for PanelMenu with active state logic
const menuItems = computed(() => {
  const currentPath = router.currentRoute.value.path
  return [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      command: async (): Promise<void> => {
        await router.push('/admin/dashboard')
        if (isModal.value) {
          sidebarStore.isSidebarVisible = false
        }
      },
      // Add a class or a style based on the current route
      class: currentPath === '/admin/dashboard' ? 'p-menuitem-active' : '',
    },
    {
      label: 'Roles And Access',
      icon: 'pi pi-shield',
      command: async (): Promise<void> => {
        await router.push('/admin/roles')
        if (isModal.value) {
          sidebarStore.isSidebarVisible = false
        }
      },
      class: currentPath === '/admin/roles' ? 'p-menuitem-active' : '', // Example for sub-routes
    },
    {
      label: 'Events',
      icon: 'pi pi-calendar',
      class: currentPath.startsWith('/admin/events') ? 'p-menuitem-active' : '',
    },
    {
      label: 'Committee',
      icon: 'pi pi-users',
      command: async (): Promise<void> => {
        await router.push('/admin/committe')
        if (isModal.value) {
          sidebarStore.isSidebarVisible = false
        }
      },
      class: currentPath.startsWith('/admin/committe') ? 'p-menuitem-active' : '',
    },
    {
      label: 'Aprovals',
      icon: 'pi pi-search',
      class: currentPath.startsWith('/admin/approvals') ? 'p-menuitem-active' : '',
    },
    {
      label: 'Finance',
      icon: 'pi pi-money-bill',
      expandIconPosition: 'right',
      items: [
        {
          label: 'Fund Collection',
          icon: 'pi pi-wallet',
          command: async (): Promise<void> => {
            await router.push('/admin/finance/fund-collection')
            if (isModal.value) {
              sidebarStore.isSidebarVisible = false
            }
          },
          class: currentPath === '/admin/finance/fund-collection' ? 'p-menuitem-active' : '',
        },
        {
          label: 'Expenses',
          icon: 'pi pi-money-bill',
          command: async (): Promise<void> => {
            await router.push('/admin/finance/expenses')
            if (isModal.value) {
              sidebarStore.isSidebarVisible = false
            }
          },
          class: currentPath === '/admin/finance/expenses' ? 'p-menuitem-active' : '',
        },
        {
          label: 'Balance Sheet',
          icon: 'pi pi-chart-bar',
          command: async (): Promise<void> => {
            await router.push('/admin/finance/balance-sheet')
            if (isModal.value) {
              sidebarStore.isSidebarVisible = false
            }
          },
          class: currentPath === '/admin/finance/balance-sheet' ? 'p-menuitem-active' : '',
        },
        {
          label: 'Bills And Uploads',
          icon: 'pi pi-file-o',
          command: async (): Promise<void> => {
            await router.push('/admin/finance/bills-uploads')
            if (isModal.value) {
              sidebarStore.isSidebarVisible = false
            }
          },
          class: currentPath === '/admin/finance/bills-uploads' ? 'p-menuitem-active' : '',
        },
      ],
      // Highlight parent "Finance" if any sub-item is active
      class: currentPath.startsWith('/admin/finance') ? 'p-menuitem-active' : '',
    },
    {
      label: 'Birthday Gifts',
      icon: 'pi pi-gift',
      class: currentPath.startsWith('/admin/birthday-gifts') ? 'p-menuitem-active' : '',
    },
    {
      label: 'Charity',
      icon: 'pi pi-heart',
      class: currentPath.startsWith('/admin/charity') ? 'p-menuitem-active' : '',
    },
    {
      label: 'Tournaments',
      icon: 'pi pi-trophy',
      class: currentPath.startsWith('/admin/tournaments') ? 'p-menuitem-active' : '',
    },
    {
      label: 'Feedbacks',
      icon: 'pi pi-comments',
      class: currentPath.startsWith('/admin/feedbacks') ? 'p-menuitem-active' : '',
    },
    {
      label: 'Meeting Minutes',
      icon: 'pi pi-file-word',
      class: currentPath.startsWith('/admin/meeting-minutes') ? 'p-menuitem-active' : '',
    },
  ]
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
    height: calc(100svh - 123px) !important;
    top: 30px;
    left: 30px;
    border-radius: 6px;
    width: 240px !important;
  }
}
</style>
