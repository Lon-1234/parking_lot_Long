import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import { TOKEN_KEY, USER_KEY } from '@/constants/storage'
import type { LoginRequest, ProfileRequest, UserInfo, UserRole } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = computed(() => Boolean(token.value && userInfo.value))

  function persist() {
    if (token.value && userInfo.value) {
      localStorage.setItem(TOKEN_KEY, token.value)
      localStorage.setItem(USER_KEY, JSON.stringify(userInfo.value))
    }
  }

  function restoreSession() {
    try {
      token.value = localStorage.getItem(TOKEN_KEY) ?? ''
      const raw = localStorage.getItem(USER_KEY)
      userInfo.value = raw ? JSON.parse(raw) as UserInfo : null
      if (!token.value || !userInfo.value?.roleCode) reset()
    } catch { reset() }
  }

  async function login(payload: LoginRequest) {
    const result = await authApi.login(payload)
    token.value = result.token
    userInfo.value = result.userInfo
    persist()
    return result
  }

  async function logout() {
    try { await authApi.logout() } finally { reset() }
  }

  async function fetchCurrentUser() {
    userInfo.value = await authApi.getCurrentUser()
    persist()
    return userInfo.value
  }

  async function updateProfile(payload: ProfileRequest) {
    userInfo.value = await authApi.updateProfile(payload)
    persist()
  }

  const hasRole = (roles: UserRole[]) => Boolean(userInfo.value && roles.includes(userInfo.value.roleCode))

  function reset() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, userInfo, isLoggedIn, login, logout, restoreSession, fetchCurrentUser, updateProfile, hasRole, reset }
})
