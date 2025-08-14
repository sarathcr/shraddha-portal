import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { PrimeVue } from '@primevue/core'
import App from './App.vue'
import router from './router'
import { myPreset } from './theme-preset'

import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
const app = createApp(App)
app.use(PrimeVue, {
  theme: {
    preset: myPreset,
    options: {
      darkModeSelector: 'app-dark',
    },
  },
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(router)
app.use(ToastService)
app.use(ConfirmationService)
app.mount('#app')
