/**
 * 缓存工具：带过期时间（分钟）
 * - 用途：存 token 等登录态
 * - 过期策略：可选择是否自动跳转到登录页
 */
export function setCache(key, value, expire = 0) {
	const obj = {
		data: value,
		time: Date.now() / 1000,
		expire: expire * 60
	}
	uni.setStorageSync(key, JSON.stringify(obj))
}

export function getCache(key, redirectToLogin = true) {
	let val = uni.getStorageSync(key)
	if (!val) return null
	val = JSON.parse(val)
	if (val.expire && Date.now() / 1000 - val.time > val.expire) {
		uni.removeStorageSync(key)
		if (redirectToLogin) {
			uni.reLaunch({ url: '/pages/auth/login' })
		}
		return null
	}
	return val.data
}

