<script setup lang="ts">
import Chart from 'primevue/chart'
import { useDashboard } from '../composable/useDashboard'

const { chartData, chartOptions } = useDashboard()
</script>

<template>
  <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-2">
    <h2>Finance Stream</h2>
    <Chart type="bar" :data="chartData" :options="chartOptions" class="h-auto grow-1" />
  </div>
</template>
