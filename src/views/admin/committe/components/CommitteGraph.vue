<script setup lang="ts">
import Chart from 'primevue/chart'
import { useDashboard } from '../composable/useDashboard'

const { chartData, chartOptions } = useDashboard()

defineProps<{
  isLoading?: boolean
}>()
</script>

<template>
  <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-2">
    <h2 class="text-xl font-semibold mb-2">Finance Stream</h2>

    <div class="h-[250px]">
      <template v-if="isLoading"> </template>
      <template v-else>
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-full w-full" />
      </template>
    </div>
  </div>
</template>
