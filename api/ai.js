import request from '@/common/request'
import { uploadFile } from '@/utils/request'

/**
 * AI 模块接口
 * - 后端对接：Doubao-Seed-2.0-pro（由后端转发/鉴权）
 * - 核心能力：
 *   1) 作物影像分析（病虫害/缺素/长势异常/水肥建议）
 *   2) 文本问答（带上下文：定位/天气/作物阶段）
 *   3) 语音问答（前端上传音频，后端 ASR -> LLM）
 *   4) 历史记录（诊断/方案/问答）
 */

/**
 * 上传 AI 分析图片（multipart）
 * @param {Object} payload
 * @param {string} payload.filePath 本地临时文件路径
 * @returns {Promise<Object>} AiImageDTO（建议 { imageId, url }）
 */
export function uploadAiImage({ filePath }) {
  return uploadFile({
    url: '/app/ai/upload',
    filePath,
    name: 'file',
    formData: {}
  })
}

/**
 * 作物诊断/分析（核心）
 * @param {Object} payload 分析入参（定位/天气/作物/图片等）
 * @returns {Promise<Object>} AiReportDTO（标准化输出，便于前端结构化展示）
 */
export function analyzeCrop(payload) {
  return request({
    url: '/app/ai/crop/analyze',
    method: 'POST',
    data: payload
  })
}

/**
 * 文本问答
 * @param {Object} payload
 * @param {string} [payload.sessionId] 会话ID（可选，用于连续对话）
 * @param {string} payload.text 用户问题文本
 * @param {Object} [payload.context] 上下文（定位/天气/作物/阶段等）
 * @returns {Promise<Object>} AiChatDTO（建议 { sessionId, answer }）
 */
export function chatText({ sessionId, text, context }) {
  return request({
    url: '/app/ai/chat/text',
    method: 'POST',
    data: { sessionId, text, context }
  })
}

/**
 * 语音问答（multipart）
 * - 说明：前端录音后上传音频文件；后端负责 ASR 识别并调用模型回答
 * @param {Object} payload
 * @param {string} [payload.sessionId] 会话ID（可选）
 * @param {string} payload.audioFilePath 本地音频路径
 * @param {Object} [payload.context] 上下文
 * @returns {Promise<Object>} AiChatDTO
 */
export function chatVoice({ sessionId, audioFilePath, context }) {
  return uploadFile({
    url: '/app/ai/chat/voice',
    filePath: audioFilePath,
    name: 'file',
    formData: { sessionId, context: JSON.stringify(context || {}) }
  })
}

/**
 * 历史记录分页
 * @param {Object} payload
 * @param {string} [payload.type] 类型(可选：analyze/chat/plan等)
 * @param {number} [payload.pageNum] 页码
 * @param {number} [payload.pageSize] 每页数量
 * @returns {Promise<Object>} PageResult<AiHistoryDTO>
 */
export function listHistory({ type, pageNum = 1, pageSize = 10 }) {
  return request({
    url: '/app/ai/history',
    method: 'GET',
    params: { type, pageNum, pageSize }
  })
}

/**
 * 删除历史记录
 * @param {Object} payload
 * @param {number} payload.id 记录ID
 * @returns {Promise<null>}
 */
export function deleteHistory({ id }) {
  return request({
    url: '/app/ai/history/delete',
    method: 'POST',
    data: { id }
  })
}

