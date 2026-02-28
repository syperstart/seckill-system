/**
 * 表单校验规则
 */
export const phoneReg = /^1[3-9]\d{9}$/

export function validatePhone(phone) {
  if (!phone || !String(phone).trim()) return '请输入手机号'
  if (!phoneReg.test(phone)) return '请输入正确的11位手机号'
  return ''
}

export function validatePassword(pwd, min = 6, max = 16) {
  if (!pwd) return '请输入密码'
  const len = String(pwd).length
  if (len < min || len > max) return `密码长度为${min}-${max}位`
  return ''
}

export function validateCode(code) {
  if (!code || !String(code).trim()) return '请输入验证码'
  return ''
}
