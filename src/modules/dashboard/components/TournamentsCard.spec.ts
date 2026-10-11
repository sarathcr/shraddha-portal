import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TournamentsCard from './TournamentsCard.vue'
import router from '@/core/router'
import PrimeVue from 'primevue/config'

describe('TournamentsCard.vue', () => {
  it('renders tournament list with progress values', () => {
    const wrapper = mount(TournamentsCard, {
      global: {
        plugins: [PrimeVue],
      },
    })

    expect(wrapper.text()).toContain('Active Tournaments')
    expect(wrapper.text()).toContain('Inter-Department Badminton Championship')
    expect(wrapper.text()).toContain('Table Tennis Monsoon Cup 2026')
    expect(wrapper.text()).toContain('68%')
  })

  it('navigates to tournaments page when View All is clicked', async () => {
    const pushSpy = vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve())
    const wrapper = mount(TournamentsCard, {
      global: {
        plugins: [PrimeVue],
      },
    })

    const viewAllBtn = wrapper.find('button')
    await viewAllBtn.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/admin/tournaments')
  })
})
