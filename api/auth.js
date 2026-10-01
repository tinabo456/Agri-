import request from '@/common/request'

/**
 * 认证相关接口
 * - 若依默认登录需要验证码：/captchaImage + /login(code+uuid)
 * - 小程序扩展：短信验证码登录/注册
 */

/**
 * 账号密码登录（若依）
 * @param {Object} payload 登录参数
 * @param {string} payload.username 用户名
 * @param {string} payload.password 密码
 * @param {string} payload.code 图形验证码
 * @param {string} payload.uuid 验证码 uuid
 */
export function loginByPassword({ username, password, code, uuid }) {
  return request({
    url: '/login',
    method: 'POST',
    data: { username, password, code, uuid },
    headers: { isToken: false }
  })
}

// 若依验证码
/**
 * 获取图形验证码（若依）
 * @returns {Promise<{img:string, uuid:string}>}
 */
export function getCaptchaImage() {
  return request({
    url: '/captchaImage',
    method: 'GET',
    headers: { isToken: false },
    timeout: 20000
  })
}

/**
 * 退出登录
 */
export function logout() {
  return request({ url: '/logout', method: 'POST' })
}

// 手机号验证码：建议你后端在 ruoyi-admin 下实现 /app/auth/sms/code & /app/auth/sms/login
/**
 * 发送短信验证码（小程序扩展）
 */
export function sendSmsCode({ mobile, scene = 'login' }) {
  return request({
    url: '/app/auth/sms/code',
    method: 'POST',
    data: { mobile, scene }
  })
}

/**
 * 手机号验证码登录（小程序扩展）
 */
export function loginBySms({ mobile, code }) {
  return request({
    url: '/app/auth/sms/login',
    method: 'POST',
    data: { mobile, code }
  })
}

/**
 * 注册（小程序扩展）
 */
export function register({ username, password, mobile, code }) {
  return request({
    url: '/app/auth/register',
    method: 'POST',
    data: { username, password, mobile, code }
  })
}

