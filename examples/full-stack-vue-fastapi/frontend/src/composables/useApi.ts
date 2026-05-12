/**
 * 统一 HTTP 入口。所有 API 调用必须走这里(详见 AGENTS.md)。
 *
 * 自动处理:
 *   - 加 Authorization: Bearer <token>(从 user store 拿)
 *   - 401 自动登出 + 跳 login
 *   - 错误统一抛 ApiError(组件用 try/catch 处理)
 */
import axios, { type AxiosRequestConfig, AxiosError } from 'axios'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export class ApiError extends Error {
  status: number
  detail: unknown

  constructor(status: number, detail: unknown, message?: string) {
    super(message || (typeof detail === 'string' ? detail : `HTTP ${status}`))
    this.status = status
    this.detail = detail
    this.name = 'ApiError'
  }
}

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

client.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

client.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0
    const detail = (error.response?.data as { detail?: unknown })?.detail ?? error.message

    if (status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      // 不在登录页时才跳转,避免循环
      if (router.currentRoute.value.name !== 'login') {
        router.push({ name: 'login' })
      }
    }

    return Promise.reject(new ApiError(status, detail))
  },
)

export async function useApi<T = unknown>(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<T> {
  const { data } = await client.request<T>({ url, ...config })
  return data
}
