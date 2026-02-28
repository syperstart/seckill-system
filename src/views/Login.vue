<template>
  <div class="login-page">
    <header class="login-header">
      <span class="logo">闪电秒杀</span>
    </header>

    <main class="login-main">
      <div class="login-card">
        <h1 class="card-title">账号登录</h1>
        <div class="title-divider"></div>

        <el-tabs v-model="loginType" class="login-tabs">
          <el-tab-pane label="账号密码" name="password">
            <div class="tab-content">
              <!-- autocomplete="off" 屏蔽浏览器"保存密码？"弹窗，避免遮挡页面 -->
<form class="login-form" autocomplete="off" @submit.prevent="handleLogin">
                <!-- 隐藏假输入框，干扰浏览器识别登录表单，减少"保存密码"弹窗 -->
                <input type="text" name="prevent_autofill" style="position:absolute;left:-9999px" tabindex="-1" autocomplete="off" />
                <input type="password" name="prevent_autofill_pw" style="position:absolute;left:-9999px" tabindex="-1" autocomplete="off" />
                <div class="form-item" :class="{ error: errors.phone }">
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="form-input"
                    placeholder="请输入11位手机号"
                    maxlength="11"
                    autocomplete="off"
                    @focus="clearError('phone')"
                    @keyup.enter="handleLogin"
                  />
                  <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
                </div>
                <div class="form-item" :class="{ error: errors.password }">
                  <div class="input-wrap">
                    <input
                      v-model="form.password"
                      :type="showPwd ? 'text' : 'password'"
                      class="form-input"
                      placeholder="请输入6-16位密码"
                      autocomplete="new-password"
                      @focus="clearError('password')"
                      @keyup.enter="handleLogin"
                    />
                    <span class="pwd-toggle" @click="showPwd = !showPwd">{{ showPwd ? '隐藏' : '显示' }}</span>
                  </div>
                  <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
                </div>
                <div v-if="loginError" class="form-item">
                  <span class="login-error">{{ loginError }}</span>
                </div>
                <div class="form-item">
                  <button type="submit" class="btn-login" :disabled="loading">
                    <span v-if="loading" class="btn-loading"></span>
                    <span v-else>登 录</span>
                  </button>
                </div>
              </form>
            </div>
          </el-tab-pane>
          <el-tab-pane label="验证码" name="code">
            <div class="tab-content">
              <!-- autocomplete="off" 屏蔽浏览器"保存密码？"弹窗，避免遮挡页面 -->
<form class="login-form" autocomplete="off" @submit.prevent="handleLogin">
                <!-- 隐藏假输入框，干扰浏览器识别登录表单，减少"保存密码"弹窗 -->
                <input type="text" name="prevent_autofill" style="position:absolute;left:-9999px" tabindex="-1" autocomplete="off" />
                <input type="password" name="prevent_autofill_pw" style="position:absolute;left:-9999px" tabindex="-1" autocomplete="off" />
                <div class="form-item" :class="{ error: errors.phone }">
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="form-input"
                    placeholder="请输入11位手机号"
                    maxlength="11"
                    autocomplete="off"
                    @focus="clearError('phone')"
                    @keyup.enter="handleLogin"
                  />
                  <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
                </div>
                <div class="form-item" :class="{ error: errors.code }">
                  <div class="code-row">
                    <input
                      v-model="form.code"
                      type="text"
                      class="form-input code-input"
                      placeholder="请输入验证码"
                      maxlength="6"
                      @focus="clearError('code')"
                      @keyup.enter="handleLogin"
                    />
                    <button
                      type="button"
                      class="btn-code"
                      :disabled="countdown > 0 || codeSending"
                      @click="handleSendCode"
                    >
                      {{ codeSending ? '发送中...' : (countdown > 0 ? `${countdown}s 后重发` : '获取验证码') }}
                    </button>
                  </div>
                  <span v-if="errors.code" class="field-error">{{ errors.code }}</span>
                </div>
                <div v-if="loginError" class="form-item">
                  <span class="login-error">{{ loginError }}</span>
                </div>
                <div class="form-item">
                  <button type="submit" class="btn-login" :disabled="loading">
                    <span v-if="loading" class="btn-loading"></span>
                    <span v-else>登 录</span>
                  </button>
                </div>
              </form>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="footer-info">
          <p class="helper-line">测试账号：13800138000 / 密码：123456</p>
          <p class="helper-line">验证码登录固定码：123456</p>
          <p class="link-register-wrap">
            <span class="link-prefix">没有账号？</span>
            <router-link to="/register" class="link-register">立即注册</router-link>
          </p>
        </div>
      </div>
    </main>

    <footer class="login-footer">
      <p>© 2025 闪电秒杀 版权所有</p>
    </footer>
  </div>
</template>

<script setup>
/**
 * 登录页 - 模拟登录逻辑（面试可讲解）
 * 1. 不调用真实后端接口，本地校验账号密码
 * 2. 测试账号：13800138000，密码：123456，验证码：123456
 * 3. 校验通过后生成模拟 token 存入 localStorage，跳转后台首页
 * 4. 校验失败显示友好提示「账号或密码错误」，无 500 等原生错误
 */
import { ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginType = ref('password')
const loading = ref(false)
const codeSending = ref(false)
const countdown = ref(0)
const showPwd = ref(false)

const form = reactive({ phone: '', password: '', code: '' })
const errors = reactive({ phone: '', password: '', code: '' })
const loginError = ref('')

const MOCK_PHONE = '13800138000'
const MOCK_PASSWORD = '123456'
const MOCK_CODE = '123456'

watch(loginType, () => { loginError.value = '' })

function clearError(field) {
  errors[field] = ''
  loginError.value = ''
}

function validate() {
  errors.phone = ''
  errors.password = ''
  errors.code = ''
  loginError.value = ''
  if (!form.phone.trim()) {
    errors.phone = '请输入手机号'
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    errors.phone = '请输入正确的11位手机号'
    return false
  }
  if (loginType.value === 'password') {
    if (!form.password) {
      errors.password = '请输入密码'
      return false
    }
    if (form.password.length < 6 || form.password.length > 16) {
      errors.password = '密码长度为6-16位'
      return false
    }
  } else {
    if (!form.code) {
      errors.code = '请输入验证码'
      return false
    }
  }
  return true
}

function handleSendCode() {
  if (!form.phone.trim()) {
    errors.phone = '请先输入手机号'
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    errors.phone = '请输入正确的11位手机号'
    return
  }
  codeSending.value = true
  setTimeout(() => {
    codeSending.value = false
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  }, 500)
}

async function handleLogin() {
  if (!validate()) return
  loading.value = true
  loginError.value = ''
  try {
    const ok = loginType.value === 'password'
      ? form.phone === MOCK_PHONE && form.password === MOCK_PASSWORD
      : form.phone === MOCK_PHONE && form.code === MOCK_CODE
    if (ok) {
      userStore.mockLogin(form.phone)
      await router.replace(route.query.redirect || '/')
    } else {
      loginError.value = '账号或密码错误'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-gradient-auth);
  background-attachment: fixed;
  position: relative;
}
.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 20% 30%, rgba(228, 61, 19, 0.06) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(255, 215, 0, 0.04) 0%, transparent 40%);
  pointer-events: none;
}

.login-header {
  flex-shrink: 0;
  height: 56px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.logo {
  font-size: 22px;
  font-weight: 600;
  color: #E41D13;
}

.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-card {
  width: 420px;
  padding: 40px 35px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(228, 61, 19, 0.08), 0 0 0 1px rgba(228, 61, 19, 0.04);
  position: relative;
  z-index: 1;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #333333;
  text-align: center;
  margin: 0;
}

.title-divider {
  height: 1px;
  background: #EEEEEE;
  margin: 25px 0 0;
}

.login-tabs { margin-top: 20px; }

.login-tabs :deep(.el-tabs__header) { margin-bottom: 16px; border: none; }
.login-tabs :deep(.el-tabs__nav-wrap::after) { display: none; }
.login-tabs :deep(.el-tabs__nav-scroll) { display: flex; justify-content: center; }
.login-tabs :deep(.el-tabs__nav) { border: none; }
.login-tabs :deep(.el-tabs__item) { padding: 0 24px; font-size: 15px; color: #666666; }
.login-tabs :deep(.el-tabs__item:hover) { color: #E41D13; }
.login-tabs :deep(.el-tabs__item.is-active) { color: #E41D13; font-weight: 500; }
.login-tabs :deep(.el-tabs__active-bar),
.login-tabs :deep(.el-tabs__ink-bar),
.login-tabs :deep(.el-tabs__indicator) {
  background-color: #E41D13;
  height: 2px;
}

.tab-content { padding-top: 0; }

.login-form { }
.form-item {
  margin-bottom: 20px;
}
.form-item:last-child { margin-bottom: 0; }

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  font-size: 14px;
  border: 1px solid #E6E6E6;
  border-radius: 6px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}
.form-input::placeholder { color: #999999; }
.form-input:hover { border-color: #CCCCCC; }
.form-input:focus { border-color: #E41D13; }

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-wrap .form-input { padding-right: 56px; }
.pwd-toggle {
  position: absolute;
  right: 12px;
  font-size: 12px;
  color: #666666;
  cursor: pointer;
  user-select: none;
}
.pwd-toggle:hover { color: #E41D13; }

.field-error, .login-error {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #E41D13;
}
.login-error { margin-bottom: 8px; }

.code-row {
  display: flex;
  align-items: center;
  gap: 3%;
}
.code-input { flex: 0 0 65%; }
.btn-code {
  flex: 0 0 32%;
  height: 44px;
  padding: 0;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  background: #E41D13;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-code:not(:disabled):hover { background: #C9161E; }
.btn-code:disabled {
  background: #CCCCCC;
  cursor: not-allowed;
}

.btn-login {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  background: #E41D13;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-login:hover:not(:disabled) { background: #C9161E; }
.btn-login:active:not(:disabled) { background: #A8121A; }
.btn-login:disabled { cursor: not-allowed; opacity: 0.8; }

.btn-loading {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.footer-info {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid #EEEEEE;
  padding-bottom: 20px;
}

.helper-line {
  margin: 0 0 4px;
  font-size: 12px;
  color: #999999;
  text-align: center;
  line-height: 1.5;
}

.link-register-wrap {
  margin: 25px 0 0;
  text-align: center;
  font-size: 14px;
}
.link-prefix { color: #666666; }
.link-register {
  color: #E41D13;
  text-decoration: none;
  margin-left: 4px;
}
.link-register:hover { text-decoration: underline; }

.login-footer {
  flex-shrink: 0;
  padding: 20px;
  background: #F5F5F5;
}
.login-footer p {
  margin: 0;
  font-size: 12px;
  color: #999999;
  text-align: center;
}

@media (max-width: 480px) {
  .login-main { padding: 24px 5%; }
  .login-card { width: 90%; padding: 32px 24px; }
  .card-title { font-size: 22px; }
  .code-input { flex: 1; }
  .btn-code { flex: 0 0 110px; }
}
</style>
