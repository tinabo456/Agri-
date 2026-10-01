import request from '@/common/request'

/**
 * 商城接口
 * - 目标：完成“诊断 -> 方案 -> 购品”闭环
 * - 关键能力：
 *   - 分类列表（种子/肥料/农药/补贴专区等）
 *   - 商品列表：支持排序/搜索/分页
 *   - 商品详情
 *   - 商家列表：支持入驻时间/人气等排序
 */

/**
 * 查询分类列表
 * @returns {Promise<Array>} 分类数组
 */
export function listCategories() {
  return request({ url: '/app/mall/category/list', method: 'GET' })
}

/**
 * 查询商品列表（分页）
 * @param {Object} payload
 * @param {number|string} [payload.categoryId] 分类ID(可选)
 * @param {string} [payload.sort] 排序(sales|settled|popularity)
 * @param {number} [payload.pageNum] 页码
 * @param {number} [payload.pageSize] 每页数量
 * @param {string} [payload.keyword] 搜索关键词(可选)
 * @returns {Promise<Object>} PageResult<GoodsDTO>
 */
export function listGoods({ categoryId, sort = 'sales', pageNum = 1, pageSize = 10, keyword }) {
  return request({
    url: '/app/mall/goods/list',
    method: 'GET',
    params: { categoryId, sort, pageNum, pageSize, keyword }
  })
}

/**
 * 查询商品详情
 * @param {Object} payload
 * @param {number} payload.goodsId 商品ID
 * @returns {Promise<Object>} GoodsDetailDTO
 */
export function getGoodsDetail({ goodsId }) {
  return request({
    url: '/app/mall/goods/detail',
    method: 'GET',
    params: { goodsId }
  })
}

/**
 * 查询商家列表（分页）
 * @param {Object} payload
 * @param {string} [payload.sort] 排序(popularity|settled|sales)
 * @param {number} [payload.pageNum]
 * @param {number} [payload.pageSize]
 * @returns {Promise<Object>} PageResult<ShopDTO>
 */
export function listShops({ sort = 'popularity', pageNum = 1, pageSize = 10 }) {
  return request({
    url: '/app/mall/shop/list',
    method: 'GET',
    params: { sort, pageNum, pageSize }
  })
}

