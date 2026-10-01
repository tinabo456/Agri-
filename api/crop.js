import request from '@/common/request'
import { uploadFile } from '@/utils/request'

/**
 * 我的作物接口
 * - 目标：支持“从播种到收获”的阶段影像记录与月度 AI 总结
 * - 关键数据：
 *   - 作物档案（crop）
 *   - 阶段影像（stage：按 year+month）
 *   - 月度总结（summary：按 year+month）
 */

/**
 * 查询作物阶段列表（按年）
 * @param {Object} payload
 * @param {number} payload.cropId 作物ID
 * @param {number} payload.year 年份
 * @returns {Promise<Object>} PageResult<CropStageDTO> 或数组（以接口文档为准）
 */
export function listMyCropStages({ cropId, year }) {
  return request({
    url: '/app/crop/stage/list',
    method: 'GET',
    params: { cropId, year }
  })
}

/**
 * 上传作物阶段图片（拍照/相册）
 * - 上传属于 multipart/form-data（无法用 JSON）
 * - 后端建议返回：stageId + url（前端用于立即渲染）
 * @param {Object} payload
 * @param {number} payload.cropId 作物ID
 * @param {number} payload.stageMonth 月份(1-12)
 * @param {string} payload.filePath 本地临时文件路径
 * @returns {Promise<Object>} 上传结果（建议 { stageId, url }）
 */
export function uploadStageImage({ cropId, stageMonth, filePath }) {
  return uploadFile({
    url: '/app/crop/stage/upload',
    filePath,
    name: 'file',
    formData: { cropId, stageMonth }
  })
}

/**
 * 查询阶段详情
 * @param {Object} payload
 * @param {number} payload.stageId 阶段ID
 * @returns {Promise<Object>} 阶段详情
 */
export function getStageDetail({ stageId }) {
  return request({
    url: '/app/crop/stage/detail',
    method: 'GET',
    params: { stageId }
  })
}

/**
 * 查询月度 AI 总结
 * @param {Object} payload
 * @param {number} payload.cropId 作物ID
 * @param {number} payload.year 年份
 * @param {number} payload.month 月份(1-12)
 * @returns {Promise<Object>} 月度总结（含水肥/病虫害摘要）
 */
export function getAiMonthlySummary({ cropId, year, month }) {
  return request({
    url: '/app/crop/ai/summary',
    method: 'GET',
    params: { cropId, year, month }
  })
}

/**
 * 创建作物档案
 * @param {Object} data 作物档案数据（建议后端按 @RequestBody）
 * @returns {Promise<Object>} 创建结果（建议返回 cropId）
 */
export function createCrop(data) {
  return request({
    url: '/app/crop/create',
    method: 'POST',
    data
  })
}

/**
 * 查询我的作物档案列表
 * @returns {Promise<Array>} 作物列表
 */
export function listMyCrops() {
  return request({
    url: '/app/crop/list',
    method: 'GET'
  })
}

