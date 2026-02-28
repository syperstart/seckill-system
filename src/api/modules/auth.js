import request from '../request'

/** 用户登录（支持密码/验证码） */
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

/** 用户注册 */
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

/** 发送短信验证码（模拟：固定 123456） */
export function sendCode(phone) {
  return request({
    url: '/user/sendCode',
    method: 'get',
    params: { phone }
  })
}

/** 获取当前用户信息 */
export function getUserInfo() {
  return request({ url: '/user/info', method: 'get' })
}
