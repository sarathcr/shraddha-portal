<script setup lang="ts">
import Chart from 'primevue/chart'
import { useRevenueChart } from '@/modules/dashboard/composables/useRevenueChart'

const { chartData, chartOptions } = useRevenueChart()
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 w-full"
  >
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3"
    >
      <div>
        <h2 class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
          Financial Stream
        </h2>
        <p class="text-xs text-slate-500">
          Monthly contributions, sponsorships, and event expenses
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"
        >
          <span class="size-1.5 rounded-full bg-emerald-600"></span>
          Total: ₹ 1.24L
        </span>
      </div>
    </div>

    <div class="relative w-full h-[260px] sm:h-[300px]">
      <Chart
        v-if="chartData && chartOptions"
        type="bar"
        :data="chartData"
        :options="chartOptions"
        class="h-full w-full"
      />
      <div v-else class="h-full w-full flex items-center justify-center text-xs text-slate-400">
        Loading financial analytics...
      </div>
    </div>
  </div>
</template>
