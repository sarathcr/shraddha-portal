import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { PrimeVue } from '@primevue/core'
import Tooltip from 'primevue/tooltip'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import { myPreset } from '../src/theme-preset'
import '../src/assets/main.css'
import 'primeicons/primeicons.css'

setup((app) => {
  app.use(PrimeVue, {
    theme: {
      preset: myPreset,
      options: {
        darkModeSelector: 'app-dark',
      },
    },
  })
  app.directive('tooltip', Tooltip)
  app.use(ToastService)
  app.use(ConfirmationService)
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
