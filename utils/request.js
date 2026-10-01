import { getApiBase } from '@/config/env'
import { getCache } from '@/common/cache'
import { clearToken } from '@/utils/storage'

function normalizeUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  const base = getApiBase()
  if (url.startsWith('/')) return `${base}${url}`
  return `${base}/${url}`
}

function showToast(message) {
  uni.showToast({ title: message || '请求失败', icon: 'none' })
}

function shouldAutoLoginRedirect(statusCode, code) {
  return statusCode === 401 || code === 401
}

let isRedirectingToLogin = false

function redirectToLogin() {
  if (isRedirectingToLogin) return
  isRedirectingToLogin = true
  clearToken()
  uni.removeStorageSync('token')
  setTimeout(() => {
    isRedirectingToLogin = false
    uni.reLaunch({ url: '/pages/auth/login' })
  }, 300)
}

/**
 * 统一请求封装（适配若依常见返回：{ code, msg, data }）
 * - 默认携带 Authorization: Bearer <token>
 * - 自动处理 401 并回到登录页
 */
export function request(options) {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    timeout = 20000,
    showErrorToast = true,
    raw = false
  } = options || {}

  const token = getCache('token') || ''
  const finalHeader = {
    'content-type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...header
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: normalizeUrl(url),
      method,
      data,
      header: finalHeader,
      timeout,
      success: (res) => {
        const statusCode = res?.statusCode
        const body = res?.data

        if (raw) return resolve(res)

        // 兼容：若依通常 body = { code: 200, msg: 'ok', data: ... }
        const code = body?.code
        const msg = body?.msg

        if (shouldAutoLoginRedirect(statusCode, code)) {
          redirectToLogin()
          return reject(body || res)
        }

        // 如果后端不是若依结构，直接透传
        if (typeof code === 'undefined') return resolve(body)

        if (code === 200) return resolve(body?.data)

        if (showErrorToast) showToast(msg || '请求失败')
        return reject(body)
      },
      fail: (err) => {
        if (showErrorToast) showToast(err?.errMsg || '网络异常')
        reject(err)
      }
    })
  })
}

export function uploadFile({ url, filePath, name = 'file', formData = {}, header = {} }) {
  const token = getCache('token') || ''
  const finalHeader = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...header
  }

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: normalizeUrl(url),
      filePath,
      name,
      formData,
      header: finalHeader,
      success: (res) => {
        try {
          const body = JSON.parse(res?.data || '{}')
          const code = body?.code
          if (typeof code !== 'undefined') {
            if (code === 200) return resolve(body?.data)
            if (code === 401) {
              redirectToLogin()
              return reject(body)
            }
            showToast(body?.msg || '上传失败')
            return reject(body)
          }
          return resolve(body)
        } catch (e) {
          resolve(res?.data)
        }
      },
      fail: (err) => {
        showToast(err?.errMsg || '上传失败')
        reject(err)
      }
    })
  })
}

