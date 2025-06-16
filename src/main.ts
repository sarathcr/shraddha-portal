import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import { PrimeVue } from '@primevue/core'
import App from './App.vue'
import router from './router'
import { myPreset } from './theme-preset'
const app = createApp(App)
app.use(PrimeVue, { theme: { preset: myPreset } })

app.use(createPinia())
app.use(router)

app.mount('#app')
