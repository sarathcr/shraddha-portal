import { ref, onMounted } from 'vue'

export function useRevenueChart() {
  const chartData = ref()
  const chartOptions = ref()

  const setChartData = () => {
    const documentStyle = getComputedStyle(document.documentElement)

    return {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Revenue',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: documentStyle.getPropertyValue('--p-indigo-500') || '#6366f1',
          tension: 0.4,
        },
      ],
    }
  }

  const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--p-text-color') || '#475569'
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color') || '#94a3b8'
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color') || '#e2e8f0'

    return {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
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

  return {
    chartData,
    chartOptions,
    setChartData,
    setChartOptions,
  }
}
