/**
 * 用户状态管理
 * mockLogin：模拟登录，不调用接口，直接存储 token 用于演示/面试
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

function safeParseUserInfo() {
  try {
    const raw = localStorage.getItem('userInfo')
    if (!raw || raw === 'undefined') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(safeParseUserInfo())

  /**
   * 模拟登录：不请求接口，直接存储 token
   * 用于后端未就绪时的演示，面试可讲解
   */
  function mockLogin(phone) {
    const tok = 'token_' + Date.now()
    const info = { phone }
    token.value = tok
    userInfo.value = info
    localStorage.setItem('token', tok)
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    mockLogin,
    logout
  }
})
