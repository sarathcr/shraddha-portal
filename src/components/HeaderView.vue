<script setup lang="ts">
import { useSidebarStore } from '@/stores/sidebar'
import AppLogo from './AppLogo.vue'

const sidebarStore = useSidebarStore()
</script>

<template>
  <header class="header flex items-center justify-between py-3 px-8 bg-white w-full fixed z-1">
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
          <a href="/contact"><i class="pi pi-sign-out"></i></a>
        </li>
      </ul>
    </nav>
  </header>
</template>
