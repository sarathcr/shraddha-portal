import { describe, it, expect } from 'vitest'
import { useRevenueChart } from '@/shared/composables/useRevenueChart'

describe('useRevenueChart Composable', () => {
  it('returns valid chartData structure', () => {
    const { setChartData } = useRevenueChart()
    const data = setChartData()

    expect(data).toHaveProperty('labels')
    expect(data).toHaveProperty('datasets')
    expect(data.labels).toHaveLength(7)
    expect(data.datasets[0].data).toHaveLength(7)
  })

  it('returns valid chartOptions configuration', () => {
    const { setChartOptions } = useRevenueChart()
    const options = setChartOptions()

    expect(options).toHaveProperty('maintainAspectRatio', false)
    expect(options).toHaveProperty('plugins')
    expect(options).toHaveProperty('scales')
  })
})
