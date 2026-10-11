<script setup lang="ts">
import { useSidebarStore } from '@/stores/sidebar'
import AppLogo from './AppLogo.vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const sidebarStore = useSidebarStore()
const authStore = useAuthStore()

const handleLogout = async (): Promise<void> => {
  authStore.clearTokens()
  await router.push('/login')
}
</script>

<template>
  <header class="header flex items-center justify-between py-3 px-8 bg-white w-full fixed z-25">
    <div class="flex items-center gap-4">
      <i class="pi pi-bars cursor-pointer !text-[20px]" @click="sidebarStore.toggleSidebar()"></i>
      <AppLogo />
    </div>
    <nav class="nav">
      <ul class="flex space-x-4">
        <li>
          <a href="/home"><i class="pi pi-bell"></i></a>
        </li>
        <li>
          <a href="/about"><i class="pi pi-user"></i></a>
        </li>
        <li>
          <a @click="handleLogout"><i class="pi pi-sign-out"></i></a>
        </li>
      </ul>
    </nav>
  </header>
</template>
