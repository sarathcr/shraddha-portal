import type { Meta, StoryObj } from '@storybook/vue3'
import AppButton from '@/shared/components/AppButton.vue'

const meta: Meta<typeof AppButton> = {
  title: 'Shared/AppButton',
  component: AppButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['small', 'normal', 'large'],
    },
    label: { control: 'text' },
    icon: { control: 'text' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof AppButton>

export const Primary: Story = {
  args: {
    label: 'Primary Button',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    variant: 'secondary',
  },
}

export const Danger: Story = {
  args: {
    label: 'Delete Item',
    variant: 'danger',
    icon: 'pi pi-trash',
  },
}

export const Ghost: Story = {
  args: {
    label: 'Ghost Action',
    variant: 'ghost',
    icon: 'pi pi-refresh',
  },
}

export const WithIcon: Story = {
  args: {
    label: 'New Committee',
    icon: 'pi pi-plus',
    variant: 'primary',
  },
}

export const Loading: Story = {
  args: {
    label: 'Saving...',
    loading: true,
    variant: 'primary',
  },
}

export const Small: Story = {
  args: {
    label: 'Small Button',
    size: 'small',
    variant: 'primary',
  },
}
