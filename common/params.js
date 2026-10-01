/**
 * 将对象参数格式化为查询字符串（兼容对象嵌套）
 * - 用途：GET/PUT 请求把 params 拼接到 URL 查询串
 * - 注意：仅用于简单查询场景；复杂对象建议统一走 @RequestBody JSON
 */
export function tansParams(params) {
	let result = ''
	for (const propName of Object.keys(params || {})) {
		const value = params[propName]
		const part = encodeURIComponent(propName) + '='
		if (value !== null && value !== '' && typeof value !== 'undefined') {
			if (typeof value === 'object') {
				for (const key of Object.keys(value)) {
					if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
						const p = propName + '[' + key + ']'
						const subPart = encodeURIComponent(p) + '='
						result += subPart + encodeURIComponent(value[key]) + '&'
					}
				}
			} else {
				result += part + encodeURIComponent(value) + '&'
			}
		}
	}
	return result
}

