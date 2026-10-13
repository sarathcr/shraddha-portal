<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSidebarStore } from '@/core/sidebar/sidebarStore'
import AppLogo from '@/shared/components/AppLogo.vue'
import { useAuthStore } from '@/core/auth/authStore'
import { usePermissionStore } from '@/core/permissions/permissionStore'
import { useProfile, filterDisplayRoles } from '@/modules/profile/composables/useProfile'
import router from '@/core/router'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'

const sidebarStore = useSidebarStore()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const { profile, displayRoles, fetchProfile } = useProfile()

const menuRef = ref<InstanceType<typeof Menu> | null>(null)
const avatarImageError = ref(false)

watch(
  () => profile.avatarUrl,
  () => {
    avatarImageError.value = false
  },
)

onMounted(() => {
  void fetchProfile()
})

const userRole = computed((): string => {
  if (displayRoles.value && displayRoles.value.length > 0) {
    return displayRoles.value.join(', ')
  }
  const permRoles = permissionStore.userPermissions.map((p) => p.role).filter(Boolean)
  const filtered = filterDisplayRoles(permRoles)
  return filtered.length > 0 ? filtered.join(', ') : ''
})

const userInitials = computed((): string => {
  if (!profile.name) return 'SA'
  const parts = profile.name.trim().split(/\s+/)
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return profile.name.slice(0, 2).toUpperCase()
})

const userMenuItems = computed((): MenuItem[] => [
  {
    label: 'Signed in as',
    items: [
      {
        label: profile.email || 'admin@shraddha.com',
        icon: 'pi pi-user',
        disabled: true,
      },
      {
        label: `Role: ${userRole.value}`,
        icon: 'pi pi-shield',
        disabled: true,
      },
    ],
  },
  {
    separator: true,
  },
  {
    label: 'Account Actions',
    items: [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: async (): Promise<void> => {
          await router.push('/admin/profile')
        },
      },
      {
        label: 'Sign Out',
        icon: 'pi pi-sign-out',
        class: 'text-rose-600',
        command: async (): Promise<void> => {
          await handleLogout()
        },
      },
    ],
  },
])

const toggleUserMenu = (event: Event): void => {
  menuRef.value?.toggle(event)
}

const handleLogout = async (): Promise<void> => {
  authStore.clearTokens()
  permissionStore.clearPermissions()
  await router.push('/login')
}
</script>

<template>
  <header
    class="header flex items-center justify-between h-[64px] px-4 lg:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200/80 w-full fixed top-0 left-0 z-40 transition-all duration-200 shadow-xs"
  >
    <!-- Left Section: Logo & Mobile Toggle -->
    <div class="flex items-center gap-3 lg:gap-4">
      <!-- Mobile Only Toggle Button -->
      <button
        type="button"
        class="lg:hidden size-9 sm:size-10 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all duration-150 cursor-pointer"
        aria-label="Toggle navigation sidebar"
        @click="sidebarStore.toggleSidebar()"
      >
        <i class="pi pi-bars text-lg"></i>
      </button>
      <AppLogo />
    </div>

    <!-- Right Section: Alerts & Profile -->
    <div class="flex items-center gap-3 sm:gap-4">
      <!-- Notification Trigger -->
      <button
        type="button"
        class="relative size-9 sm:size-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all duration-150 cursor-pointer"
        aria-label="View notifications"
      >
        <i class="pi pi-bell text-lg"></i>
        <span
          class="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white animate-pulse"
        ></span>
      </button>

      <!-- Vertical Divider -->
      <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>

      <!-- User Profile Pill -->
      <button
        type="button"
        class="h-9 sm:h-10 flex items-center gap-2.5 px-2 sm:px-3 rounded-lg hover:bg-slate-100/80 border border-transparent hover:border-slate-200/60 active:scale-95 transition-all duration-150 cursor-pointer"
        aria-haspopup="true"
        aria-controls="user_header_menu"
        @click="toggleUserMenu"
      >
        <div
          v-if="profile.avatarUrl && !avatarImageError"
          class="size-7 sm:size-8 rounded-full overflow-hidden shadow-xs shrink-0 border border-slate-200"
        >
          <img
            :src="profile.avatarUrl"
            :alt="profile.name"
            class="w-full h-full object-cover"
            @error="avatarImageError = true"
          />
        </div>
        <div
          v-else
          class="size-7 sm:size-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs select-none"
        >
          {{ userInitials }}
        </div>
        <div class="hidden sm:flex flex-col items-start text-left">
          <span class="text-xs font-semibold text-slate-800 leading-tight">System Admin</span>
          <span
            class="text-[11px] font-semibold text-indigo-600 leading-tight truncate max-w-[160px]"
            :title="userRole"
            >{{ userRole }}</span
          >
        </div>
        <i class="pi pi-angle-down text-slate-400 text-xs hidden sm:block"></i>
      </button>

      <!-- User Dropdown Menu -->
      <Menu
        id="user_header_menu"
        ref="menuRef"
        :model="userMenuItems"
        :popup="true"
        class="!min-w-[200px]"
      />
    </div>
  </header>
</template>
