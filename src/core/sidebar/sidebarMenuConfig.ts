import type { Permission } from '@/core/permissions/permission.types'
import router from '@/core/router'
import { useSidebarStore } from '@/core/sidebar/sidebarStore'

export interface MenuItem {
  label: string
  icon: string
  command?: () => Promise<void>
  class?: string
  expandIconPosition?: 'right' | 'left'
  items?: MenuItem[]
  module?: string
  permission?: Permission
  to?: string
}

export const createMenuItems = (isModal: () => boolean): MenuItem[] => {
  const sidebarStore = useSidebarStore()

  const navigate = async (path: string): Promise<void> => {
    await router.push(path)
    if (isModal()) {
      sidebarStore.isSidebarVisible = false
    }
  }

  return [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      module: 'Dashboard',
      permission: 'READ',
      to: '/admin/dashboard',
      command: () => navigate('/admin/dashboard'),
    },
    {
      label: 'Roles And Access',
      icon: 'pi pi-shield',
      module: 'RolesAndAccess',
      permission: 'READ',
      to: '/admin/roles',
      command: () => navigate('/admin/roles'),
    },
    {
      label: 'Events',
      icon: 'pi pi-calendar',
      module: 'Events',
      permission: 'READ',
      to: '/admin/events',
      command: () => navigate('/admin/events'),
    },
    {
      label: 'Committee',
      icon: 'pi pi-users',
      module: 'Committee',
      permission: 'READ',
      to: '/admin/committe',
      command: () => navigate('/admin/committe'),
    },
    {
      label: 'Approvals',
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
          command: () => navigate('/admin/finance/fund-collection'),
        },
        {
          label: 'Expenses',
          icon: 'pi pi-money-bill',
          module: 'Finance',
          permission: 'READ',
          to: '/admin/finance/expenses',
          command: () => navigate('/admin/finance/expenses'),
        },
        {
          label: 'Balance Sheet',
          icon: 'pi pi-chart-bar',
          module: 'Finance',
          permission: 'READ',
          to: '/admin/finance/balance-sheet',
          command: () => navigate('/admin/finance/balance-sheet'),
        },
        {
          label: 'Bills And Uploads',
          icon: 'pi pi-file-o',
          module: 'Finance',
          permission: 'READ',
          to: '/admin/finance/bills-uploads',
          command: () => navigate('/admin/finance/bills-uploads'),
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
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      module: 'Settings',
      permission: 'READ',
      expandIconPosition: 'right',
      items: [
        {
          label: 'Event Types',
          icon: 'pi pi-calendar',
          command: () => navigate('/admin/settings/event-types'),
        },
      ],
    },
  ]
}
