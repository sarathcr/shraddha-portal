import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from './ConfirmDialog.vue'

describe('ConfirmDialog Component', () => {
  const mountComponent = (props = {}) => {
    return mount(ConfirmDialog, {
      props: {
        visible: true,
        message: 'Are you sure?',
        ...props,
      },
      global: {
        stubs: {
          Dialog: {
            props: ['visible', 'header'],
            template: `
              <div v-if="visible" class="p-dialog">
                <div class="p-dialog-header">{{ header }}</div>
                <div class="p-dialog-content"><slot /></div>
                <div class="p-dialog-footer"><slot name="footer" /></div>
              </div>
            `,
          },
        },
      },
    })
  }

  it('renders default title and message when visible', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain('Confirm Deletion')
    expect(wrapper.text()).toContain('Are you sure?')
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Delete')
  })

  it('renders custom title and action labels', () => {
    const wrapper = mountComponent({
      title: 'Custom Title',
      confirmLabel: 'Proceed',
      cancelLabel: 'Dismiss',
    })
    expect(wrapper.text()).toContain('Custom Title')
    expect(wrapper.text()).toContain('Proceed')
    expect(wrapper.text()).toContain('Dismiss')
  })

  it('emits confirm when confirm button is clicked', async () => {
    const wrapper = mountComponent()
    const buttons = wrapper.findAllComponents({ name: 'AppButton' })
    const confirmBtn = buttons.find((b) => b.props('label') === 'Delete')
    expect(confirmBtn).toBeDefined()
    await confirmBtn!.trigger('click')
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('emits cancel and update:visible(false) when cancel button is clicked', async () => {
    const wrapper = mountComponent()
    const buttons = wrapper.findAllComponents({ name: 'AppButton' })
    const cancelBtn = buttons.find((b) => b.props('label') === 'Cancel')
    expect(cancelBtn).toBeDefined()
    await cancelBtn!.trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')![0]).toEqual([false])
  })
})
