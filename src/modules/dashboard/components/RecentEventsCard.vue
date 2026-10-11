<script setup lang="ts">
import { Column, DataTable, Tag } from 'primevue'
import router from '@/core/router'

export interface RecentEventItem {
  id: string
  name: string
  category: string
  date: string
  status: string
}

withDefaults(
  defineProps<{
    events?: RecentEventItem[]
  }>(),
  {
    events: () => [
      {
        id: '1',
        name: 'Annual Sports Meet 2026',
        category: 'Tournament',
        date: 'Mar 15, 2026',
        status: 'Completed',
      },
      {
        id: '2',
        name: 'Charity Food & Clothes Drive',
        category: 'Charity',
        date: 'Apr 10, 2026',
        status: 'Ongoing',
      },
      {
        id: '3',
        name: 'Tech Talk: Vue 3 & AI Integration',
        category: 'Technical',
        date: 'May 20, 2026',
        status: 'Upcoming',
      },
      {
        id: '4',
        name: 'Executive Committee Assembly',
        category: 'Meeting',
        date: 'Jun 05, 2026',
        status: 'Upcoming',
      },
    ],
  },
)

const getStatusSeverity = (status: string): 'success' | 'info' | 'warn' | 'secondary' => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'upcoming':
      return 'info'
    case 'ongoing':
    case 'in progress':
      return 'warn'
    default:
      return 'secondary'
  }
}

const getCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'tournament':
      return 'bg-amber-50 text-amber-700 border-amber-200/60'
    case 'charity':
      return 'bg-rose-50 text-rose-700 border-rose-200/60'
    case 'technical':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200/60'
    default:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
  }
}

const viewAllEvents = async (): Promise<void> => {
  await router.push('/admin/events')
}
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 w-full"
  >
    <!-- Header with Action -->
    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">Recent Events</h2>
        <p class="text-xs text-slate-500">Upcoming schedules and executed club activities</p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 active:scale-95 transition-all duration-150 cursor-pointer"
        @click="viewAllEvents"
      >
        <span>View All</span>
        <i class="pi pi-arrow-right text-[10px]"></i>
      </button>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto">
      <DataTable :value="events" :rows="5" responsiveLayout="scroll" class="p-datatable-sm w-full">
        <!-- Event Name -->
        <Column field="name" header="Event Name">
          <template #body="{ data }">
            <span class="text-xs sm:text-sm font-semibold text-slate-800">{{ data.name }}</span>
          </template>
        </Column>

        <!-- Category -->
        <Column field="category" header="Category">
          <template #body="{ data }">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border"
              :class="getCategoryColor(data.category)"
            >
              {{ data.category }}
            </span>
          </template>
        </Column>

        <!-- Date -->
        <Column field="date" header="Date">
          <template #body="{ data }">
            <div class="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
              <i class="pi pi-calendar text-[11px] text-slate-400"></i>
              <span>{{ data.date }}</span>
            </div>
          </template>
        </Column>

        <!-- Status Tag -->
        <Column field="status" header="Status">
          <template #body="{ data }">
            <Tag
              :value="data.status"
              :severity="getStatusSeverity(data.status)"
              class="!text-[11px] !py-0.5 !px-2 font-semibold"
            />
          </template>
        </Column>

        <template #empty>
          <div class="py-8 text-center text-xs text-slate-400">No events registered yet.</div>
        </template>
      </DataTable>
    </div>
  </div>
</template>
