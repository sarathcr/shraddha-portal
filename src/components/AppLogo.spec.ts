import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppLogo from './AppLogo.vue'

describe('AppLogo.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(AppLogo)
    // A simple test to ensure the component does not throw an error on mount
    expect(wrapper.exists()).toBe(true)
  })
})
