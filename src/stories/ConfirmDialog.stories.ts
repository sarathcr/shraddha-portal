import type { Meta, StoryObj } from '@storybook/vue3'
import ConfirmDialog from '@/shared/components/ConfirmDialog.vue'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Shared/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  argTypes: {
    confirmVariant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
  },
}

export default meta
type Story = StoryObj<typeof ConfirmDialog>

export const DeleteConfirmation: Story = {
  args: {
    visible: true,
    title: 'Confirm Deletion',
    message: 'Are you sure you want to delete this user? This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    confirmVariant: 'danger',
  },
}

export const WarningConfirmation: Story = {
  args: {
    visible: true,
    title: 'Disable Active Committee',
    message: 'Are you sure you want to disable the currently active committee?',
    confirmLabel: 'OK',
    cancelLabel: 'Cancel',
    confirmVariant: 'danger',
    iconClass: 'text-yellow-500 text-3xl',
  },
}
