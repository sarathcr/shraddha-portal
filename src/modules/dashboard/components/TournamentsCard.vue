<script setup lang="ts">
import { ProgressBar, Tag } from 'primevue'
import router from '@/core/router'

interface Tournament {
  id: string
  title: string
  dateRange: string
  progress: number
  status: 'In Progress' | 'Upcoming' | 'Completed'
  participantsCount: number
}

const tournaments: Tournament[] = [
  {
    id: '1',
    title: 'Inter-Department Badminton Championship',
    dateRange: 'Jul 10 - Aug 20, 2026',
    progress: 68,
    status: 'In Progress',
    participantsCount: 32,
  },
  {
    id: '2',
    title: 'Table Tennis Monsoon Cup 2026',
    dateRange: 'Sep 05 - Sep 28, 2026',
    progress: 20,
    status: 'Upcoming',
    participantsCount: 24,
  },
  {
    id: '3',
    title: 'Annual Cricket League 2025',
    dateRange: 'Jan 15 - Feb 28, 2025',
    progress: 100,
    status: 'Completed',
    participantsCount: 64,
  },
]

const getStatusSeverity = (status: Tournament['status']): 'warn' | 'info' | 'success' => {
  switch (status) {
    case 'In Progress':
      return 'warn'
    case 'Upcoming':
      return 'info'
    case 'Completed':
      return 'success'
  }
}

const navigateToTournaments = async (): Promise<void> => {
  await router.push('/admin/tournaments')
}
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 w-full"
  >
    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
          Active Tournaments
        </h2>
        <p class="text-xs text-slate-500">Championship progression and participant engagement</p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 active:scale-95 transition-all duration-150 cursor-pointer"
        @click="navigateToTournaments"
      >
        <span>View All</span>
        <i class="pi pi-arrow-right text-[10px]"></i>
      </button>
    </div>

    <div class="flex flex-col gap-3">
      <div
        v-for="tournament in tournaments"
        :key="tournament.id"
        class="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col gap-2.5"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex flex-col">
            <h3 class="text-xs sm:text-sm font-semibold text-slate-800">
              {{ tournament.title }}
            </h3>
            <div class="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>{{ tournament.dateRange }}</span>
              <span>•</span>
              <span>{{ tournament.participantsCount }} Teams</span>
            </div>
          </div>

          <Tag
            :value="tournament.status"
            :severity="getStatusSeverity(tournament.status)"
            class="!text-[10px] !py-0.5 !px-2 font-semibold shrink-0"
          />
        </div>

        <div class="flex items-center gap-3">
          <div class="grow">
            <ProgressBar
              :value="tournament.progress"
              :showValue="false"
              class="!h-2 !bg-slate-200 rounded-full"
            />
          </div>
          <span class="text-xs font-bold text-slate-700 min-w-[32px] text-right"
            >{{ tournament.progress }}%</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
