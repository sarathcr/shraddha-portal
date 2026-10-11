import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppLogo from '@/shared/components/AppLogo.vue'

describe('AppLogo Component', () => {
  it('renders title and logo correctly with emblem variant', () => {
    const wrapper = mount(AppLogo)

    expect(wrapper.text()).toContain('SHRADDHA')
    expect(wrapper.text()).toContain('Connect | Engage | Support')

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Shraddha Logo')
  })

  it('renders full logo correctly when variant="full"', () => {
    const wrapper = mount(AppLogo, {
      props: { variant: 'full' },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Shraddha Logo')
  })
})
