import App from './App.vue'
// #ifdef VUE3
import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'

export function createApp() {

  const app = createSSRApp(App)
  const pinia = Pinia.createPinia()

  // 全局注册 pinia
  app.use(pinia)
  return {
    app,
    pinia
  }
}
// #endif