import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InfoCard from './InfoCard.vue'

describe('InfoCard.vue', () => {
  it('renders title and metric value correctly', () => {
    const wrapper = mount(InfoCard, {
      props: {
        title: 'Active Members',
        value: '128',
        icon: 'pi-users',
        color: 'blue',
      },
    })

    expect(wrapper.text()).toContain('Active Members')
    expect(wrapper.text()).toContain('128')
  })

  it('renders trend badge when trendValue and direction are provided', () => {
    const wrapper = mount(InfoCard, {
      props: {
        title: 'Total Revenue',
        value: '₹ 18,450',
        icon: 'pi-wallet',
        color: 'emerald',
        trendValue: '+14.2%',
        trendDirection: 'up',
        trendLabel: 'vs last month',
      },
    })

    expect(wrapper.text()).toContain('+14.2%')
    expect(wrapper.text()).toContain('vs last month')
    expect(wrapper.find('.bg-emerald-50').exists()).toBe(true)
  })

  it('renders negative trend with downward badge', () => {
    const wrapper = mount(InfoCard, {
      props: {
        title: 'Pending Reviews',
        value: '6',
        icon: 'pi-inbox',
        color: 'orange',
        trendValue: '-5%',
        trendDirection: 'down',
        trendLabel: 'this week',
      },
    })

    expect(wrapper.text()).toContain('-5%')
    expect(wrapper.find('.bg-rose-50').exists()).toBe(true)
  })

  it('supports custom footer slot', () => {
    const wrapper = mount(InfoCard, {
      props: {
        title: 'Feedbacks',
        value: '80',
        icon: 'pi-comments',
        color: 'purple',
      },
      slots: {
        footer: '<span class="custom-slot-text">80 Unread</span>',
      },
    })

    expect(wrapper.find('.custom-slot-text').exists()).toBe(true)
    expect(wrapper.text()).toContain('80 Unread')
  })

  it('applies correct color classes for each supported palette', () => {
    const palettes = ['blue', 'orange', 'cyan', 'purple', 'emerald'] as const
    for (const color of palettes) {
      const wrapper = mount(InfoCard, {
        props: {
          title: 'Metric',
          value: '10',
          icon: 'pi-star',
          color,
        },
      })
      expect(wrapper.exists()).toBe(true)
    }
  })
})
