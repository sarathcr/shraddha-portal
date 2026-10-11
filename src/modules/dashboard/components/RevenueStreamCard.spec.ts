import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import RevenueStreamCard from './RevenueStreamCard.vue'
import PrimeVue from 'primevue/config'

describe('RevenueStreamCard.vue', () => {
  it('renders card title, subtitle, and total revenue metric', async () => {
    const wrapper = mount(RevenueStreamCard, {
      global: {
        plugins: [PrimeVue],
        stubs: {
          Chart: {
            template: '<div class="chart-stub">Chart Rendered</div>',
          },
        },
      },
    })

    await nextTick()

    expect(wrapper.text()).toContain('Financial Stream')
    expect(wrapper.text()).toContain('Total: ₹ 1.24L')
    expect(wrapper.find('.chart-stub').exists()).toBe(true)
  })
})
