/**
 * 全局用户状态 — JWT + currentUser。
 *
 * 持久化:仅 token 进 localStorage,currentUser 在内存(刷新通过 fetchMe 恢复)。
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useApi } from '@/composables/useApi'

export interface CurrentUser {
  id: number
  email: string
  display_name: string | null
  email_verified_at: string | null
  created_at: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

const TOKEN_KEY = 'scaffold_v2_token'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const currentUser = ref<CurrentUser | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken: string | null) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  async function login(email: string, password: string) {
    const resp = await useApi<LoginResponse>('/auth/login', {
      method: 'POST',
      data: { email, password },
    })
    setToken(resp.access_token)
    await fetchMe()
  }

  async function register(email: string, password: string, displayName?: string) {
    await useApi<CurrentUser>('/auth/register', {
      method: 'POST',
      data: { email, password, display_name: displayName },
    })
    await login(email, password)
  }

  async function fetchMe() {
    const user = await useApi<CurrentUser>('/auth/me', { method: 'GET' })
    currentUser.value = user
    return user
  }

  function logout() {
    setToken(null)
    currentUser.value = null
  }

  return {
    token,
    currentUser,
    isAuthenticated,
    login,
    register,
    fetchMe,
    logout,
  }
})
