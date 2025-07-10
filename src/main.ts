import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import { PrimeVue } from '@primevue/core'
import App from './App.vue'
import router from './router'
import { myPreset } from './theme-preset'

import ToastService from 'primevue/toastservice'

const app = createApp(App)
app.use(PrimeVue, { theme: { preset: myPreset } })

const pinia = createPinia()
app.use(pinia)

app.use(router)

app.mount('#app')
app.use(ToastService)
