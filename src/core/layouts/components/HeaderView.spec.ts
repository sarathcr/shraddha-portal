import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HeaderView from '@/core/layouts/components/HeaderView.vue'
import { useSidebarStore } from '@/core/sidebar/sidebarStore'
import { useAuthStore } from '@/core/auth/authStore'
import PrimeVue from 'primevue/config'

const pushMock = vi.fn()
vi.mock('@/core/router', () => ({
  default: {
    push: (...args: unknown[]) => pushMock(...args),
  },
}))

describe('HeaderView Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    pushMock.mockClear()
  })

  const mountComponent = () => {
    return mount(HeaderView, {
      global: {
        plugins: [PrimeVue],
        stubs: {
          AppLogo: true,
          Menu: {
            name: 'Menu',
            props: ['model'],
            methods: {
              toggle: vi.fn(),
            },
            template: '<div class="menu-stub"><slot /></div>',
          },
        },
      },
    })
  }

  it('renders correctly', () => {
    const wrapper = mountComponent()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('System Admin')
  })

  it('toggles mobile sidebar when menu button clicked', async () => {
    const sidebarStore = useSidebarStore()
    const toggleSpy = vi.spyOn(sidebarStore, 'toggleSidebar')

    const wrapper = mountComponent()
    const toggleBtn = wrapper.find('button[aria-label="Toggle navigation sidebar"]')

    expect(toggleBtn.exists()).toBe(true)
    await toggleBtn.trigger('click')

    expect(toggleSpy).toHaveBeenCalledOnce()
  })

  it('triggers user menu toggle and handles profile / signout commands', async () => {
    const authStore = useAuthStore()
    const clearTokensSpy = vi.spyOn(authStore, 'clearTokens')

    const wrapper = mountComponent()
    const userBtn = wrapper.find('button[aria-controls="user_header_menu"]')
    expect(userBtn.exists()).toBe(true)
    await userBtn.trigger('click')

    // Find the Menu component and verify commands
    const menuComponent = wrapper.findComponent({ name: 'Menu' })
    const model = menuComponent.props('model') as any[]
    expect(model).toBeDefined()
    expect(model[2].items).toHaveLength(2)

    // Execute Profile command
    await model[2].items[0].command()
    expect(pushMock).toHaveBeenCalledWith('/admin/profile')

    // Execute Sign Out command
    await model[2].items[1].command()
    expect(clearTokensSpy).toHaveBeenCalled()
    expect(pushMock).toHaveBeenCalledWith('/login')
  })
})
