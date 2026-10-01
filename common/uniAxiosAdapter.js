/**
 * axios adapter for uni-app（微信小程序/uni.request）
 * - 避免第三方 uniapp-axios-adapter 在不同构建链下入口文件不一致导致的 ENOENT
 * - 作用：让 axios 在小程序端底层走 uni.request
 * - 约束：此文件只做“请求适配”，不做业务错误码处理（由 common/request.js 负责）
 */
function buildFullUrl(config) {
	const baseURL = config.baseURL || ''
	let url = config.url || ''
	if (url && !/^https?:\/\//i.test(url)) {
		if (baseURL) {
			const b = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
			const p = url.startsWith('/') ? url : `/${url}`
			url = `${b}${p}`
		}
	}
	return url
}

function toUniHeader(headers) {
	const h = {}
	if (!headers) return h
	// axios 在小程序里 headers 可能是普通对象；尽量兼容 toJSON()
	const plain = typeof headers.toJSON === 'function' ? headers.toJSON() : headers
	Object.keys(plain).forEach((k) => {
		const v = plain[k]
		if (v === undefined || v === null) return
		h[k] = v
	})
	return h
}

function parseResponseData(data) {
	if (typeof data === 'object') return data
	if (typeof data === 'string') {
		try {
			return JSON.parse(data)
		} catch (e) {
			return data
		}
	}
	return data
}

export default function uniAxiosAdapter(config) {
	return new Promise((resolve, reject) => {
		const method = (config.method || 'get').toUpperCase()
		const url = buildFullUrl(config)
		const header = toUniHeader(config.headers)

		const requestTask = uni.request({
			url,
			method,
			data: config.data,
			header,
			timeout: config.timeout,
			responseType: config.responseType === 'arraybuffer' ? 'arraybuffer' : 'text',
			success: (res) => {
				const status = res.statusCode || 0
				const response = {
					data: parseResponseData(res.data),
					status,
					statusText: String(status),
					headers: res.header || {},
					config,
					request: requestTask
				}
				// axios：2xx 走 then；否则走 catch（走响应拦截器的 error 分支）
				if (status >= 200 && status < 300) resolve(response)
				else {
					const err = new Error(`Request failed with status code ${status}`)
					err.config = config
					err.response = response
					err.isAxiosError = true
					reject(err)
				}
			},
			fail: (err) => {
				const e = new Error(err?.errMsg || 'Network Error')
				e.config = config
				e.isAxiosError = true
				reject(e)
			}
		})
	})
}
