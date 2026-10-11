import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionButton from './ActionButton.vue'

describe('ActionButton.vue', () => {
  it('renders icon and title correctly', () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: 'pi pi-pencil',
        title: 'Edit Item',
      },
    })

    expect(wrapper.attributes('title')).toBe('Edit Item')
    expect(wrapper.find('i').classes()).toContain('pi-pencil')
    expect(wrapper.classes()).toContain('text-slate-400')
  })

  it('handles click events', async () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: 'pi pi-trash',
      },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('renders danger variant styling', () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: 'pi pi-trash',
        variant: 'danger',
      },
    })

    expect(wrapper.classes()).toContain('hover:text-rose-600')
  })

  it('renders success variant styling', () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: 'pi pi-check',
        variant: 'success',
      },
    })

    expect(wrapper.classes()).toContain('hover:text-emerald-600')
  })

  it('respects disabled state', () => {
    const wrapper = mount(ActionButton, {
      props: {
        icon: 'pi pi-pencil',
        disabled: true,
      },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
