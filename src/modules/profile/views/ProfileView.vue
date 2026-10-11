<script setup lang="ts">
import { computed } from 'vue'
import { usePermissionStore } from '@/core/permissions/permissionStore'
import Tag from 'primevue/tag'

const permissionStore = usePermissionStore()

const userRole = computed((): string => {
  const firstRole = permissionStore.userPermissions[0]?.role
  return firstRole || 'Admin HR'
})
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <!-- Profile Hero Card -->
    <div
      class="bg-white rounded-2xl border border-slate-200/70 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6"
    >
      <div class="flex items-center gap-4 sm:gap-5">
        <div
          class="size-16 sm:size-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md shrink-0"
        >
          SA
        </div>
        <div class="flex flex-col gap-1">
          <div class="flex flex-wrap items-center gap-2.5">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              System Administrator
            </h1>
            <Tag :value="userRole" severity="info" class="!text-xs font-semibold" />
          </div>
          <p class="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
            <i class="pi pi-envelope text-slate-400"></i>
            admin@shraddha.com
          </p>
          <div class="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
            <span class="inline-flex items-center gap-1">
              <span class="size-2 rounded-full bg-emerald-500"></span>
              Active Account
            </span>
            <span>•</span>
            <span>Joined 2025</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="inline-flex items-center gap-2 h-9 sm:h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 active:scale-95 text-white shadow-xs transition-all duration-150 cursor-pointer"
        >
          <i class="pi pi-user-edit text-xs"></i>
          <span>Edit Profile</span>
        </button>
      </div>
    </div>

    <!-- Details Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Personal Details -->
      <div
        class="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-xs flex flex-col gap-5"
      >
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div
              class="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm"
            >
              <i class="pi pi-id-card"></i>
            </div>
            <h2 class="text-sm sm:text-base font-bold text-slate-800">Personal Information</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div class="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span class="text-slate-400 font-medium text-xs">Full Name</span>
            <span class="font-semibold text-slate-700">System Administrator</span>
          </div>
          <div class="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span class="text-slate-400 font-medium text-xs">Email Address</span>
            <span class="font-semibold text-slate-700">admin@shraddha.com</span>
          </div>
          <div class="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span class="text-slate-400 font-medium text-xs">Designation / Role</span>
            <span class="font-semibold text-slate-700">{{ userRole }}</span>
          </div>
          <div class="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span class="text-slate-400 font-medium text-xs">Phone Number</span>
            <span class="font-semibold text-slate-700">+91 98765 43210</span>
          </div>
        </div>
      </div>

      <!-- Security & Access -->
      <div
        class="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-xs flex flex-col gap-5"
      >
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div
              class="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm"
            >
              <i class="pi pi-shield"></i>
            </div>
            <h2 class="text-sm sm:text-base font-bold text-slate-800">Security & Credentials</h2>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div
            class="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50"
          >
            <div class="flex flex-col gap-0.5">
              <span class="text-xs font-semibold text-slate-700">Password</span>
              <span class="text-[11px] text-slate-400">Last changed 30 days ago</span>
            </div>
            <button
              type="button"
              class="h-8 px-3 rounded-md text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 active:scale-95 transition-all duration-150 cursor-pointer shadow-xs"
            >
              Update
            </button>
          </div>

          <div
            class="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50"
          >
            <div class="flex flex-col gap-0.5">
              <span class="text-xs font-semibold text-slate-700">Two-Factor Authentication</span>
              <span class="text-[11px] text-emerald-600 font-medium"
                >Enabled via Authenticator</span
              >
            </div>
            <span
              class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100"
            >
              <i class="pi pi-check text-[10px]"></i>
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
