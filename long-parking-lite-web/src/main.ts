import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import '@/styles/main.scss'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

const auth = useAuthStore(pinia)
auth.restoreSession()
window.addEventListener('auth:expired', () => {
  const redirect = router.currentRoute.value.fullPath
  auth.reset()
  void router.replace({ path: '/login', query: { redirect } })
})

async function bootstrap() {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    const { setupMock } = await import('./mock')
    setupMock()
  }
  app.mount('#app')
}

void bootstrap()
