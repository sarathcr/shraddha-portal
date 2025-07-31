import { ref, onMounted } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'

export function useDashboard(): {
  chartData: typeof chartData
  chartOptions: typeof chartOptions
  cards: typeof cards
  moms: typeof moms
} {
  const chartData = ref<ChartData<'bar'>>()
  const chartOptions = ref<ChartOptions<'bar'>>()

  const cards = ref([
    {
      title: 'Finance',
      icon: 'pi pi-wallet',
      colorClasses: { bg: 'bg-green-100', text: 'text-green-600' },
      countValue: 32_500,
      countLabel: '₹ balance this month',
    },
    {
      title: 'MOM',
      icon: 'pi pi-file',
      colorClasses: { bg: 'bg-blue-100', text: 'text-blue-600' },
      countValue: 5,
      countLabel: 'minutes recorded this month',
    },
    {
      title: 'Birthday Gift',
      icon: 'pi pi-gift',
      colorClasses: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      countValue: 3,
      countLabel: 'birthdays celebrated',
    },
    {
      title: 'Tournaments',
      icon: 'pi pi-trophy',
      colorClasses: { bg: 'bg-pink-100', text: 'text-pink-600' },
      countValue: 6,
      countLabel: 'tournaments completed this year',
    },
    {
      title: 'Events',
      icon: 'pi pi-calendar',
      colorClasses: { bg: 'bg-purple-100', text: 'text-purple-600' },
      countValue: 12,
      countLabel: 'done this month',
    },
    {
      title: 'Charity',
      icon: 'pi pi-heart',
      colorClasses: { bg: 'bg-red-100', text: 'text-red-600' },
      countValue: 5,
      countLabel: 'completed this year',
    },
  ])

  const moms = ref([
    {
      date: '2025-07-02',
      pdfUrl: '#',
    },
    {
      date: '2025-07-08',
      pdfUrl: '#',
    },
    {
      date: '2025-07-12',
      pdfUrl: '#',
    },
    {
      date: '2025-07-19',
      pdfUrl: '#',
    },
    {
      date: '2025-07-26',
      pdfUrl: '#',
    },
  ])

  const setChartData = (): ChartData<'bar'> => {
    const documentStyle = getComputedStyle(document.documentElement)

    return {
      labels: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'June',
        'July',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      datasets: [
        {
          type: 'bar' as const,
          label: 'Monthly Income',
          backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
          data: [5000, 8000, 7000, 12500, 8000, 2000, 15000, 12000],
        },
      ],
    }
  }

  const setChartOptions = (): ChartOptions<'bar'> => {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--p-text-color')
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color')
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color')

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
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
    cards,
    moms,
  }
}
