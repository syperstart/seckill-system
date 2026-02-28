<template>
  <div class="register-page">
    <header class="register-header">
      <router-link to="/" class="logo-wrap">
        <span class="logo-text">闪电秒杀</span>
      </router-link>
      <div class="header-divider"></div>
    </header>

    <main class="register-main">
      <div class="register-card">
        <h2 class="card-title">用户注册</h2>

        <form class="register-form" @submit.prevent="handleRegister">
          <div class="form-item" :class="{ 'item-error': showError }">
            <div class="input-wrap">
              <span class="input-label">手机号</span>
              <input
                v-model="form.phone"
                type="tel"
                class="input-field"
                placeholder="请输入11位手机号"
                maxlength="11"
                autocomplete="tel"
                @focus="showError = false"
              />
            </div>
          </div>

          <div class="form-item" :class="{ 'item-error': showError }">
            <div class="input-wrap">
              <span class="input-label">密码</span>
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                class="input-field"
                placeholder="请设置6-20位密码"
                autocomplete="new-password"
                @focus="showError = false"
              />
              <span class="pwd-toggle" @click="showPwd = !showPwd">{{ showPwd ? '隐藏' : '显示' }}</span>
            </div>
          </div>

          <div class="form-item" :class="{ 'item-error': showError }">
            <div class="input-wrap code-wrap">
              <span class="input-label">验证码</span>
              <input
                v-model="form.code"
                type="text"
                class="input-field"
                placeholder="请输入验证码"
                maxlength="6"
                @focus="showError = false"
                @keyup.enter="handleRegister"
              />
              <button
                type="button"
                class="btn-code"
                :disabled="countdown > 0 || codeSending"
                @click="handleSendCode"
              >
                {{ countdown > 0 ? `${countdown}s后重发` : (codeSending ? '发送中...' : '获取验证码') }}
              </button>
            </div>
          </div>

          <div class="form-item">
            <button type="submit" class="btn-register" :class="{ loading }" :disabled="loading">
              <span v-if="loading" class="loading-dots"><span></span><span></span><span></span></span>
              <span v-else>注 册</span>
            </button>
          </div>
        </form>

        <p class="helper-text">验证码固定为 123456（模拟）</p>

        <p class="link-login">
          <router-link to="/login">已有账号？去登录</router-link>
        </p>
      </div>
    </main>

    <footer class="register-footer">
      <p>© 2025 闪电秒杀 版权所有</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register as registerApi, sendCode } from '@/api/modules/auth'

const router = useRouter()
const loading = ref(false)
const showPwd = ref(false)
const showError = ref(false)
const codeSending = ref(false)
const countdown = ref(0)

const form = reactive({
  phone: '',
  password: '',
  code: ''
})

function validate() {
  if (!form.phone.trim()) {
    ElMessage.warning('请输入手机号')
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    ElMessage.warning('请输入正确的11位手机号')
    return false
  }
  if (!form.password) {
    ElMessage.warning('请设置密码')
    return false
  }
  if (form.password.length < 6 || form.password.length > 20) {
    ElMessage.warning('密码长度为6-20位')
    return false
  }
  if (!form.code) {
    ElMessage.warning('请输入验证码')
    return false
  }
  return true
}

async function handleSendCode() {
  if (!form.phone.trim()) {
    ElMessage.warning('请先输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    ElMessage.warning('请输入正确的11位手机号')
    return
  }
  codeSending.value = true
  try {
    await sendCode(form.phone)
    ElMessage.success('验证码已发送（模拟：123456）')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    ElMessage.error(e?.message || '发送失败')
  } finally {
    codeSending.value = false
  }
}

async function handleRegister() {
  if (!validate()) return

  loading.value = true
  showError.value = false

  try {
    await registerApi({
      phone: form.phone,
      password: form.password,
      code: form.code
    })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (e) {
    showError.value = true
    ElMessage.error(e?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-gradient-auth);
  background-attachment: fixed;
  position: relative;
}
.register-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 80% 20%, rgba(228, 61, 19, 0.06) 0%, transparent 40%),
    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.04) 0%, transparent 40%);
  pointer-events: none;
}

.register-header {
  flex-shrink: 0;
  width: 100%;
  background: #fff;
}

.logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  text-decoration: none;
  color: inherit;
}

.logo-text {
  font-size: 24px;
  font-weight: 600;
  color: #E41D13;
}

.header-divider {
  width: 100%;
  height: 1px;
  background: #eee;
}

.register-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.register-card {
  width: 100%;
  max-width: 400px;
  padding: 40px 36px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(228, 61, 19, 0.08), 0 0 0 1px rgba(228, 61, 19, 0.04);
  position: relative;
  z-index: 1;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #E41D13;
  text-align: center;
  margin: 0 0 32px 0;
}

.form-item { margin-bottom: 20px; }

.input-wrap {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background: #fff;
  transition: border-color 0.2s;
}

.input-wrap:focus-within { border-color: #E41D13; }
.form-item.item-error .input-wrap { border-color: #f56c6c; }

.input-label {
  flex-shrink: 0;
  width: 70px;
  font-size: 14px;
  color: #666;
}

.input-field {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
}

.code-wrap {
  padding-right: 8px;
  align-items: center;
}
.code-wrap .input-field { margin-right: 8px; }

.btn-code {
  flex-shrink: 0;
  padding: 0 14px;
  height: 32px;
  border: 1px solid #E41D13;
  border-radius: 4px;
  background: transparent;
  font-size: 12px;
  color: #E41D13;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.btn-code:hover:not(:disabled) { background: #fff5f0; }
.btn-code:disabled { border-color: #ccc; color: #ccc; cursor: not-allowed; }

.pwd-toggle {
  flex-shrink: 0;
  font-size: 12px;
  color: #999;
  cursor: pointer;
}

.btn-register {
  width: 100%;
  height: 48px;
  background: #E41D13;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.btn-register:hover:not(:disabled) { background: #FF3300; }
.btn-register:disabled { cursor: not-allowed; opacity: 0.9; }

.loading-dots {
  display: inline-flex;
  gap: 6px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  animation: dot-bounce 1.2s ease-in-out infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.6; }
  40% { transform: scale(1.2); opacity: 1; }
}

.helper-text {
  margin: 16px 0 0 0;
  font-size: 12px;
  color: #999;
  text-align: center;
}

.link-login {
  margin: 20px 0 0 0;
  text-align: center;
}

.link-login a {
  font-size: 14px;
  color: #E41D13;
  text-decoration: none;
}

.link-login a:hover { text-decoration: underline; }

.register-footer {
  flex-shrink: 0;
  padding: 24px;
  background: #F5F5F5;
}

.register-footer p {
  margin: 0;
  font-size: 12px;
  color: #999;
  text-align: center;
}
</style>
