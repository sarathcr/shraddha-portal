import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationCard from './NotificationCard.vue'

describe('NotificationCard.vue', () => {
  it('renders recent activity stream grouped by Today and Yesterday', () => {
    const wrapper = mount(NotificationCard)

    expect(wrapper.text()).toContain('Recent Activity')
    expect(wrapper.text()).toContain('Today')
    expect(wrapper.text()).toContain('Yesterday')
    expect(wrapper.text()).toContain('Justin Thomas requested ₹ 200')
    expect(wrapper.text()).toContain('Equipment budget for Shuttlecocks was approved')
    expect(wrapper.text()).toContain('New member registration completed: Alex Doe')
  })

  it('renders live status indicator', () => {
    const wrapper = mount(NotificationCard)
    expect(wrapper.text()).toContain('Live')
  })
})
