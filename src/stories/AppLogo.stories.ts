import type { Meta, StoryObj } from '@storybook/vue3'
import AppLogo from '@/shared/components/AppLogo.vue'

const meta: Meta<typeof AppLogo> = {
  title: 'Shared/AppLogo',
  component: AppLogo,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['emblem', 'full'],
    },
  },
}

export default meta
type Story = StoryObj<typeof AppLogo>

export const Emblem: Story = {
  args: {
    variant: 'emblem',
  },
}

export const FullLogo: Story = {
  args: {
    variant: 'full',
  },
}
