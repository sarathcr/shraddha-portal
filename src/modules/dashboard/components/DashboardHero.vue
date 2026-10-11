<script setup lang="ts">
import { computed } from 'vue'
import router from '@/core/router'
import { formatLongDate } from '@/shared/utils/dateUtils'

const greeting = computed((): string => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

const formattedDate = computed((): string => {
  return formatLongDate()
})

const quickActions = [
  {
    label: 'New Event',
    icon: 'pi pi-calendar-plus',
    route: '/admin/events',
  },
  {
    label: 'Roles & Access',
    icon: 'pi pi-shield',
    route: '/admin/roles',
  },
  {
    label: 'Committee',
    icon: 'pi pi-users',
    route: '/admin/committe',
  },
]

const navigateTo = async (path: string): Promise<void> => {
  await router.push(path)
}
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-indigo-900/30"
  >
    <!-- Background Ambient Lighting Effect -->
    <div
      class="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-indigo-500/20 blur-3xl"
    ></div>
    <div
      class="pointer-events-none absolute right-1/3 -bottom-16 size-64 rounded-full bg-emerald-500/15 blur-2xl"
    ></div>

    <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <!-- Left: Contextual Greeting & Date -->
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center gap-2.5">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/15 backdrop-blur-xs"
          >
            <span class="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Operational
          </span>
          <span class="text-xs font-medium text-slate-300">{{ formattedDate }}</span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
          {{ greeting }}, <span class="text-indigo-200">Administrator</span>
        </h1>
        <p class="text-sm text-slate-300 max-w-xl">
          Here is your portal snapshot today. Monitor registrations, event schedules, and revenue
          streams in real-time.
        </p>
      </div>

      <!-- Right: Quick Action Shortcuts -->
      <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <button
          v-for="action in quickActions"
          :key="action.label"
          type="button"
          class="inline-flex items-center justify-center gap-2 h-9 sm:h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 backdrop-blur-xs transition-all duration-150 cursor-pointer shadow-xs"
          @click="navigateTo(action.route)"
        >
          <i :class="action.icon" class="text-indigo-200 text-sm"></i>
          <span>{{ action.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
