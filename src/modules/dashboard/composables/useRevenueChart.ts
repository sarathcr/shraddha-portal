import { ref, onMounted } from 'vue'

import type { ChartData, ChartOptions } from 'chart.js'

export function useRevenueChart(): {
  chartData: typeof chartData
  chartOptions: typeof chartOptions
} {
  const chartData = ref<ChartData>()
  const chartOptions = ref<ChartOptions>()

  const setChartData = (): ChartData => {
    const documentStyle = getComputedStyle(document.documentElement)
    return {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          type: 'bar' as const,
          label: 'Dataset 1',
          backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
          data: [50, 25, 12, 48, 90, 76, 42],
        },
        {
          type: 'bar' as const,
          label: 'Dataset 2',
          backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
          data: [21, 84, 24, 75, 37, 65, 34],
        },
        {
          type: 'bar' as const,
          label: 'Dataset 3',
          backgroundColor: documentStyle.getPropertyValue('--p-orange-500'),
          data: [41, 52, 24, 74, 23, 21, 32],
        },
      ],
    }
  }

  const setChartOptions = (): ChartOptions => {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--p-text-color')
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color')
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color')

    return {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
        },
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          stacked: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
      },
    }
  }

  onMounted(() => {
    chartData.value = setChartData()
    chartOptions.value = setChartOptions()
  })

  return { chartData, chartOptions }
}
