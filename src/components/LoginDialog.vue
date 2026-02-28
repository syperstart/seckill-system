<template>
  <el-dialog
    v-model="visible"
    title="登录"
    width="400px"
    :close-on-click-modal="false"
    class="login-dialog"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <LightningIcon :size="24" color="var(--seckill-red)" />
        <span>闪电秒杀 - 登录享优惠</span>
      </div>
    </template>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">
        <LightningIcon :size="16" color="#fff" />
        登录
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LightningIcon from './LightningIcon.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const visible = ref(props.modelValue)
const loading = ref(false)
const formRef = ref(null)
const form = reactive({ phone: '', password: '' })
const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (v) => { visible.value = v })
watch(visible, (v) => emit('update:modelValue', v))

function handleClose() {
  form.phone = ''
  form.password = ''
  formRef.value?.resetFields()
}

async function handleLogin() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    if (form.phone === '13800138000' && form.password === '123456') {
      const mockToken = 'mock-token-' + Date.now()
      userStore.token = mockToken
      userStore.userInfo = { phone: form.phone }
      localStorage.setItem('token', mockToken)
      localStorage.setItem('userInfo', JSON.stringify({ phone: form.phone }))
      ElMessage.success('登录成功！')
      visible.value = false
      const redirect = route.query.redirect
      if (redirect) router.push(redirect)
    } else {
      ElMessage.error('手机号或密码错误！测试账号：13800138000/123456')
    }
  } catch {
    ElMessage.error('登录失败，请重试！')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.login-dialog :deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border-color);
}

.login-dialog :deep(.el-dialog__body) {
  padding: 24px;
}
</style>
