import axios, { type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/api'
import { TOKEN_KEY } from '@/constants/storage'

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 12_000,
})

let handlingUnauthorized = false

request.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

request.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const message = (error.response?.data as Partial<ApiResponse<unknown>> | undefined)?.msg ?? (error.code === 'ECONNABORTED' ? '请求超时' : '网络请求失败')
      if (status === 401 && !handlingUnauthorized) {
        handlingUnauthorized = true
        window.dispatchEvent(new CustomEvent('auth:expired'))
        window.setTimeout(() => { handlingUnauthorized = false }, 1000)
      }
      ElMessage.error(message)
    }
    return Promise.reject(error)
  },
)

export function unwrap<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (response.data.code !== 200) throw new Error(response.data.msg)
  return response.data.data
}
