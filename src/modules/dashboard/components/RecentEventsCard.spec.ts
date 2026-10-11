import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RecentEventsCard from './RecentEventsCard.vue'
import router from '@/core/router'
import PrimeVue from 'primevue/config'

describe('RecentEventsCard.vue', () => {
  it('renders table with default recent event rows', () => {
    const wrapper = mount(RecentEventsCard, {
      global: {
        plugins: [PrimeVue],
      },
    })

    expect(wrapper.text()).toContain('Recent Events')
    expect(wrapper.text()).toContain('Annual Sports Meet 2026')
    expect(wrapper.text()).toContain('Charity Food & Clothes Drive')
  })

  it('navigates to /admin/events when View All button is clicked', async () => {
    const pushSpy = vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve())
    const wrapper = mount(RecentEventsCard, {
      global: {
        plugins: [PrimeVue],
      },
    })

    const viewAllBtn = wrapper.find('button')
    await viewAllBtn.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/admin/events')
  })

  it('renders custom events passed through props', () => {
    const customEvents = [
      {
        id: '101',
        name: 'Custom Hackathon',
        category: 'Technical',
        date: 'Oct 12, 2026',
        status: 'Completed',
      },
    ]

    const wrapper = mount(RecentEventsCard, {
      props: {
        events: customEvents,
      },
      global: {
        plugins: [PrimeVue],
      },
    })

    expect(wrapper.text()).toContain('Custom Hackathon')
    expect(wrapper.text()).toContain('Technical')
  })
})
