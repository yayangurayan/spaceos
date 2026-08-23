import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)

// Plugins
app.use(createPinia())
app.use(router)
app.use(MotionPlugin)

// Mount
app.mount('#app')
