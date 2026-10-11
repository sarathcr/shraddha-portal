import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from './AppButton.vue'
import PrimeVue from 'primevue/config'

describe('AppButton.vue', () => {
  it('renders label and handles click', async () => {
    const handleClick = vi.fn()
    const wrapper = mount(AppButton, {
      props: {
        label: 'Submit Action',
        onClick: handleClick,
      },
      global: {
        plugins: [PrimeVue],
      },
    })

    expect(wrapper.text()).toContain('Submit Action')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('renders secondary variant with correct styling', () => {
    const wrapper = mount(AppButton, {
      props: {
        label: 'Cancel',
        variant: 'secondary',
      },
      global: {
        plugins: [PrimeVue],
      },
    })

    expect(wrapper.classes()).toContain('!bg-white')
  })

  it('renders danger variant', () => {
    const wrapper = mount(AppButton, {
      props: {
        label: 'Delete',
        variant: 'danger',
      },
      global: {
        plugins: [PrimeVue],
      },
    })

    expect(wrapper.classes()).toContain('!bg-rose-600')
  })

  it('renders ghost variant and large size', () => {
    const wrapper = mount(AppButton, {
      props: {
        label: 'Ghost',
        variant: 'ghost',
        size: 'large',
      },
      global: {
        plugins: [PrimeVue],
      },
    })

    expect(wrapper.classes()).toContain('!bg-transparent')
    expect(wrapper.classes()).toContain('!h-11')
  })

  it('renders small size and respects disabled state', async () => {
    const wrapper = mount(AppButton, {
      props: {
        label: 'Small Disabled',
        size: 'small',
        disabled: true,
      },
      global: {
        plugins: [PrimeVue],
      },
    })

    expect(wrapper.classes()).toContain('!h-8')
    await wrapper.trigger('click')
    // Click should not emit or should be disabled
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
