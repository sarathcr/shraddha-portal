import type { Meta, StoryObj } from '@storybook/vue3'
import PageTitle from '@/shared/components/PageTitle.vue'

const meta: Meta<typeof PageTitle> = {
  title: 'Shared/PageTitle',
  component: PageTitle,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PageTitle>

export const Default: Story = {
  args: {
    title: 'Events Management',
  },
}
