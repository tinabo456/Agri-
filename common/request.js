import axios from 'axios'
import uniAxiosAdapter from '@/common/uniAxiosAdapter'
import { getCache } from '@/common/cache'
import { tansParams } from '@/common/params'
import { ENV, getApiBase } from '@/config/env'
import { logRequest, logResponse, logError } from '@/common/logger'

/**
 * axios 实例（uni.request 适配器）
 * - 统一注入 token
 * - 统一拼接 GET/PUT 查询参数
 * - 统一 toast / 登录跳转策略
 * - 统一输出请求日志：路径/方式/参数
 */
const request = axios.create({
	baseURL: getApiBase(),
	timeout: 10000,
	adapter: uniAxiosAdapter,
	headers: { 'Content-Type': 'application/json' }
})

request.interceptors.request.use((config) => {
	uni.showLoading({ title: '数据加载中...' })
	const isToken = (config.headers || {}).isToken === false
	// 登录/验证码等请求不应触发“过期自动跳登录”的副作用
	const token = getCache('token', !isToken) || ''
	if (token && !isToken) {
		config.headers['Authorization'] = 'Bearer ' + token
	}
	// 小程序端对 params 处理不一致，按你的文档统一拼接
	if (config.params && (config.method === 'get' || config.method === 'put')) {
		const query = tansParams(config.params)
		if (query) config.url = config.url + (config.url.includes('?') ? '&' : '?') + query
		config.params = undefined
	}
	logRequest({ url: config.url, method: config.method, data: config.data, params: config.params })
	return config
})

request.interceptors.response.use(
	(response) => {
		const body = response?.data
		const code = body?.code
		logResponse({ url: response?.config?.url, method: response?.config?.method, code, msg: body?.msg })
		if (code === 200 || typeof code === 'undefined') {
			uni.hideLoading()
			if (typeof code === 'undefined') return body
			// 若依常见：{ code, msg, data }
			if (typeof body.data !== 'undefined') return body.data
			// 兼容：{ code, msg, token, ... }
			const { code: _c, msg: _m, ...rest } = body
			return rest
		}
		// 登录页相关接口（登录/验证码）返回 401 时，不要再强制跳转登录页，避免循环
		const url = response?.config?.url || ''
		const isAuthEndpoint = url.includes('/login') || url.includes('/captchaImage')
		// 预览模式下不做“强制跳登录”，否则你无法浏览页面
		if (code === 401 && !isAuthEndpoint && !ENV.MOCK_PREVIEW) {
			uni.showModal({
				mask: true,
				title: '未登录，请跳转至登录界面',
				showCancel: false,
				success() {
					uni.reLaunch({ url: '/pages/auth/login' })
				}
			})
			uni.hideLoading()
			return Promise.reject(body)
		}
		if (code === 401 && !isAuthEndpoint && ENV.MOCK_PREVIEW) {
			uni.showToast({ title: '预览模式：接口未接入', icon: 'none', duration: 1200 })
			uni.hideLoading()
			return Promise.reject(body)
		}
		if (code === 403) {
			uni.showToast({ mask: true, title: '权限不足', icon: 'error', duration: 2000 })
		} else if (code === 404) {
			uni.showToast({ mask: true, title: '未找到资源', icon: 'error', duration: 2000 })
		} else if (code === 500) {
			uni.showToast({ mask: true, title: '后台服务器异常', icon: 'error', duration: 2000 })
		} else {
			uni.showToast({ mask: true, title: body?.msg || '请求失败', icon: 'none', duration: 2000 })
		}
		uni.hideLoading()
		return Promise.reject(body)
	},
	(error) => {
		uni.hideLoading()
		logError({ url: error?.config?.url, method: error?.config?.method, error })
		// HTTP 层错误（例如 404/500）：尽量按若依结构提示
		const resp = error?.response
		if (resp && resp.data && typeof resp.data === 'object' && 'code' in resp.data) {
			const body = resp.data
			const code = body.code
			const url = resp?.config?.url || ''
			const isAuthEndpoint = url.includes('/login') || url.includes('/captchaImage')
			if (code === 401 && !isAuthEndpoint && !ENV.MOCK_PREVIEW) {
				uni.showModal({
					mask: true,
					title: '未登录，请跳转至登录界面',
					showCancel: false,
					success() {
						uni.reLaunch({ url: '/pages/auth/login' })
					}
				})
				return Promise.reject(body)
			}
			if (code === 401 && !isAuthEndpoint && ENV.MOCK_PREVIEW) {
				uni.showToast({ title: '预览模式：接口未接入', icon: 'none', duration: 1200 })
				return Promise.reject(body)
			}
			uni.showToast({ mask: true, title: body?.msg || '请求失败', icon: 'none', duration: 2000 })
			return Promise.reject(body)
		}
		uni.showToast({ title: error?.message || '网络异常', icon: 'none' })
		return Promise.reject(error)
	}
)

export default request

