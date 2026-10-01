import request from '@/common/request'

/**
 * 用户相关接口
 * - 与若依系统用户模块兼容：profile
 * - 小程序扩展：保存定位信息（用于天气/圈子/本地化推荐）
 */

/**
 * 获取当前登录用户资料
 * @returns {Promise<Object>} 用户资料
 */
export function getProfile() {
  return request({ url: '/system/user/profile', method: 'GET' })
}

/**
 * 更新当前登录用户资料
 * @param {Object} data 用户资料（建议后端按接口文档用 @RequestBody）
 * @returns {Promise<null>}
 */
export function updateProfile(data) {
  return request({ url: '/system/user/profile', method: 'PUT', data })
}

/**
 * 保存用户定位（小程序扩展）
 * - 说明：定位信息查询频次高但修改频次低，后端可存入用户定位表并标记当前定位
 * @param {Object} payload 定位信息
 * @param {number} payload.latitude 纬度
 * @param {number} payload.longitude 经度
 * @param {string} payload.province 省
 * @param {string} payload.city 市
 * @param {string} payload.district 区县
 * @param {string} payload.township 乡镇/街道
 * @param {string} payload.address 详细地址
 * @returns {Promise<null>}
 */
export function saveLocation({ latitude, longitude, province, city, district, township, address }) {
  return request({
    url: '/app/user/location',
    method: 'POST',
    data: { latitude, longitude, province, city, district, township, address }
  })
}

