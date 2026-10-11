import type { Meta, StoryObj } from '@storybook/vue3'
import ActionButton from '@/shared/components/ActionButton.vue'

const meta: Meta<typeof ActionButton> = {
  title: 'Shared/ActionButton',
  component: ActionButton,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    title: { control: 'text' },
    variant: {
      control: 'select',
      options: ['default', 'danger', 'info', 'success'],
    },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof ActionButton>

export const Default: Story = {
  args: {
    icon: 'pi pi-pencil',
    title: 'Edit Record',
    variant: 'default',
  },
}

export const Danger: Story = {
  args: {
    icon: 'pi pi-trash',
    title: 'Delete Record',
    variant: 'danger',
  },
}

export const Success: Story = {
  args: {
    icon: 'pi pi-check',
    title: 'Approve Record',
    variant: 'success',
  },
}

export const Info: Story = {
  args: {
    icon: 'pi pi-eye',
    title: 'View Details',
    variant: 'info',
  },
}
