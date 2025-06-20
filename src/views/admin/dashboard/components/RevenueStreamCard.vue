<script setup lang="ts">
import Chart from 'primevue/chart'
import { useRevenueChart } from '@/composables/useRevenueChart'

const { chartData, chartOptions } = useRevenueChart()
</script>

<template>
  <div class="bg-white rounded-md shadow-md w-full p-4 flex flex-col gap-2">
    <h2>Revenue Stream</h2>
    <Chart type="bar" :data="chartData" :options="chartOptions" class="h-auto grow-1" />
  </div>
</template>
