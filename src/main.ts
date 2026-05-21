import App from './App.vue'
// #ifdef VUE3
import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'

import { ROUTES } from '@/config/routes'

export function createApp() {

  const app = createSSRApp(App)
  const pinia = Pinia.createPinia()
  app.config.globalProperties.$ROUTES = ROUTES

  // 全局注册 pinia
  app.use(pinia)
  return {
    app,
    pinia
  }
}
// #endif