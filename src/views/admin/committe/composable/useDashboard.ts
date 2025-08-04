import { ref, onMounted, type Ref } from 'vue'
import type { ChartData, ChartOptions } from 'chart.js'
import type { CommitteeDashboard } from '@/types/commitee'
import { getCommitteeDashboard } from '@/views/admin/services/committeeDashboard.services'
import type { APIError, ApiResponse } from '@/types/index'
import { useToast } from 'primevue/usetoast'

export function useDashboard(): {
  chartData: Ref<ChartData<'bar'> | undefined>
  chartOptions: Ref<ChartOptions<'bar'> | undefined>
  cards: Ref<unknown[]>
  moms: Ref<{ date: string; pdfUrl: string }[]>
  tournaments: Ref<{ name: string; startDate: string; endDate: string }[]>
  birthdayGift: Ref<{ month: string; totalCelebrated: number }[]>
  isLoadingCards: Ref<boolean>
  isLoadingTable: Ref<boolean>
  isLoadingTournaments: Ref<boolean>
  isLoadingGraph: Ref<boolean>
  fetchDashboard: () => Promise<void>
} {
  const chartData = ref<ChartData<'bar'>>()
  const chartOptions = ref<ChartOptions<'bar'>>()
  const cards = ref<unknown[]>([])
  const moms = ref<{ date: string; pdfUrl: string }[]>([])
  const tournaments = ref<{ name: string; startDate: string; endDate: string }[]>([])
  const birthdayGift = ref<{ month: string; totalCelebrated: number }[]>([])
  const isLoadingCards = ref(true)
  const isLoadingTable = ref(true)
  const isLoadingTournaments = ref(true)
  const isLoadingGraph = ref(true)

  const toast = useToast()

  const withErrorHandling =
    <T extends unknown[]>(
      asyncFn: (...args: T) => Promise<void>,
      defaultErrorMessage: string,
    ): ((...args: T) => Promise<void>) =>
    async (...args: T): Promise<void> => {
      try {
        await asyncFn(...args)
      } catch (err) {
        const error = err as APIError
        const message =
          error?.error?.message || error.message || defaultErrorMessage || 'Unexpected error'
        toast.add({ severity: 'error', summary: 'Error', detail: message, life: 3000 })
      }
    }

  const fetchDashboard = withErrorHandling(async () => {
    isLoadingCards.value = true
    isLoadingTable.value = true
    isLoadingTournaments.value = true
    isLoadingGraph.value = true

    const response: ApiResponse<CommitteeDashboard[]> = await getCommitteeDashboard()
    if (response?.succeeded && Array.isArray(response.data) && response.data.length > 0) {
      const dashboard = response.data[0]
      const documentStyle = getComputedStyle(document.documentElement)

      chartData.value = {
        labels: dashboard.finance.graph.labels,
        datasets: [
          {
            type: 'bar',
            label: 'Monthly Income',
            backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
            data: dashboard.finance.graph.values,
          },
        ],
      }

      chartOptions.value = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: documentStyle.getPropertyValue('--p-text-color'),
            },
          },
        },
        scales: {
          x: {
            ticks: { color: documentStyle.getPropertyValue('--p-text-muted-color') },
            grid: { color: documentStyle.getPropertyValue('--p-content-border-color') },
          },
          y: {
            ticks: { color: documentStyle.getPropertyValue('--p-text-muted-color') },
            grid: { color: documentStyle.getPropertyValue('--p-content-border-color') },
          },
        },
      }

      cards.value = [
        {
          title: 'Events',
          icon: 'pi pi-calendar',
          colorClasses: { bg: 'bg-purple-100', text: 'text-purple-600' },
          countValue: dashboard.events.totalEvents,
          countLabel: 'done this year',
        },
        {
          title: 'Charity',
          icon: 'pi pi-heart',
          colorClasses: { bg: 'bg-red-100', text: 'text-red-600' },
          countValue: dashboard.charity.count,
          countLabel: 'completed this year',
        },
        {
          title: 'Members',
          icon: 'pi pi-users',
          colorClasses: { bg: 'bg-pink-100', text: 'text-pink-600' },
          countValue: dashboard.members.total,
          countLabel: 'total members this committee',
        },
        {
          title: 'Birthday-Gifts',
          icon: 'pi pi-gift',
          colorClasses: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
          countValue: dashboard.birthdayGift.list.reduce(
            (sum, gift) => sum + gift.totalCelebrated,
            0,
          ),
          countLabel: 'birthdays celebrated this year',
        },
      ]

      moms.value = dashboard.moms
      tournaments.value = dashboard.tournaments.list
      birthdayGift.value = dashboard.birthdayGift.list
    } else {
      toast.add({
        severity: 'warn',
        summary: 'No Data',
        detail: response?.message || 'No dashboard data found.',
        life: 3000,
      })
    }
    isLoadingCards.value = false
    isLoadingTable.value = false
    isLoadingTournaments.value = false
    isLoadingGraph.value = false
  }, 'Failed to fetch committee dashboard data.')

  onMounted(fetchDashboard)

  return {
    chartData,
    chartOptions,
    cards,
    moms,
    tournaments,
    birthdayGift,
    isLoadingCards,
    isLoadingTable,
    isLoadingTournaments,
    isLoadingGraph,
    fetchDashboard,
  }
}
