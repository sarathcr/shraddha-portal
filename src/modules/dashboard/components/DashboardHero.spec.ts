import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardHero from './DashboardHero.vue'
import router from '@/core/router'

describe('DashboardHero.vue', () => {
  it('renders welcome greeting and date information', () => {
    const wrapper = mount(DashboardHero)
    expect(wrapper.text()).toContain('Administrator')
    expect(wrapper.text()).toContain('System Operational')
  })

  it('renders all quick action buttons', () => {
    const wrapper = mount(DashboardHero)
    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map((b) => b.text())
    expect(buttonTexts).toContain('New Event')
    expect(buttonTexts).toContain('Roles & Access')
    expect(buttonTexts).toContain('Committee')
  })

  it('navigates when a quick action button is clicked', async () => {
    const pushSpy = vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve())
    const wrapper = mount(DashboardHero)
    const newEventBtn = wrapper.findAll('button').find((b) => b.text().includes('New Event'))

    expect(newEventBtn).toBeDefined()
    await newEventBtn?.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/admin/events')
  })
})
