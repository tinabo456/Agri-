import request from '@/common/request'

/**
 * 天气接口（建议后端转发腾讯天气 API，避免小程序泄露 key）
 * - 前端用于：顶部天气条、天气详情页、AI 本地化建议上下文
 * - 数据维度：
 *   - 实时：温度/湿度/风速/降水等
 *   - 未来24小时：降水概率
 *   - 未来7天/15天：趋势
 *   - 农业预警：暴雨/霜冻/大风等
 */

/**
 * 获取实时天气
 * @param {Object} payload
 * @param {number} payload.latitude 纬度
 * @param {number} payload.longitude 经度
 * @param {string} [payload.adcode] 行政区划代码(可选)
 * @returns {Promise<Object>} WeatherNowDTO
 */
export function getWeatherNow({ latitude, longitude, adcode }) {
  return request({
    url: '/app/weather/now',
    method: 'GET',
    params: { latitude, longitude, adcode }
  })
}

/**
 * 获取未来24小时天气（重点：降水概率）
 * @param {Object} payload
 * @param {number} payload.latitude
 * @param {number} payload.longitude
 * @param {string} [payload.adcode]
 * @returns {Promise<Object>} Weather24hDTO
 */
export function getWeather24h({ latitude, longitude, adcode }) {
  return request({
    url: '/app/weather/24h',
    method: 'GET',
    params: { latitude, longitude, adcode }
  })
}

/**
 * 获取未来7天天气
 * @param {Object} payload
 * @param {number} payload.latitude
 * @param {number} payload.longitude
 * @param {string} [payload.adcode]
 * @returns {Promise<Object>} Weather7dDTO
 */
export function getWeather7d({ latitude, longitude, adcode }) {
  return request({
    url: '/app/weather/7d',
    method: 'GET',
    params: { latitude, longitude, adcode }
  })
}

/**
 * 获取未来15天趋势
 * @param {Object} payload
 * @param {number} payload.latitude
 * @param {number} payload.longitude
 * @param {string} [payload.adcode]
 * @returns {Promise<Object>} Weather15dDTO
 */
export function getWeather15d({ latitude, longitude, adcode }) {
  return request({
    url: '/app/weather/15d',
    method: 'GET',
    params: { latitude, longitude, adcode }
  })
}

/**
 * 获取农业气象预警
 * @param {Object} payload
 * @param {number} payload.latitude
 * @param {number} payload.longitude
 * @param {string} [payload.adcode]
 * @returns {Promise<Object>} AgriAlertsDTO
 */
export function getAgriAlerts({ latitude, longitude, adcode }) {
  return request({
    url: '/app/weather/alerts',
    method: 'GET',
    params: { latitude, longitude, adcode }
  })
}

