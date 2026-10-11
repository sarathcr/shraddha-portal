import type { Meta, StoryObj } from '@storybook/vue3'
import DialogFooter from '@/shared/components/DialogFooter.vue'

const meta: Meta<typeof DialogFooter> = {
  title: 'Shared/DialogFooter',
  component: DialogFooter,
  tags: ['autodocs'],
  argTypes: {
    saveLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    saveLoading: { control: 'boolean' },
    saveDisabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof DialogFooter>

export const Default: Story = {
  args: {
    saveLabel: 'Save',
    cancelLabel: 'Cancel',
  },
}

export const Saving: Story = {
  args: {
    saveLabel: 'Saving...',
    saveLoading: true,
  },
}
