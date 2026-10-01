/**
 * 统一日志工具（前端等价于后端 log 规范）
 * - 目的：记录“请求路径/方式/参数”，便于联调排查
 * - 约束：不要用 sout；前端用 console.* 统一封装
 */

const LOG_PREFIX = '[agri]'

function safeJson(value) {
  try {
    return JSON.stringify(value)
  } catch (e) {
    return '"<unserializable>"'
  }
}

export function logRequest({ url, method, data, params }) {
  const m = (method || 'GET').toUpperCase()
  const payload = typeof params !== 'undefined' ? params : data
  // eslint-disable-next-line no-console
  console.info(`${LOG_PREFIX} request ${m} ${url} params=${safeJson(payload)}`)
}

export function logResponse({ url, method, code, msg }) {
  const m = (method || 'GET').toUpperCase()
  // eslint-disable-next-line no-console
  console.info(`${LOG_PREFIX} response ${m} ${url} code=${code} msg=${msg || ''}`)
}

export function logError({ url, method, error }) {
  const m = (method || 'GET').toUpperCase()
  // eslint-disable-next-line no-console
  console.error(`${LOG_PREFIX} error ${m} ${url}`, error)
}

