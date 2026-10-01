import request from '@/common/request'
import { uploadFile } from '@/utils/request'

/**
 * 圈子接口（按定位地区）
 * - 用途：展示本地圈子、帖子流、点赞评论、跳转查看对方作物阶段
 * - 设计原则：
 *   - 列表高频字段可在后端做冗余计数（likeCount/commentCount）
 *   - 点赞用唯一约束(postId+userId)防重复
 */

/**
 * 查询圈子列表（按地区）
 * @param {Object} payload
 * @param {string} [payload.adcode] 行政区划代码(可选)
 * @returns {Promise<Array>} 圈子列表
 */
export function listCircles({ adcode }) {
  return request({
    url: '/app/circle/list',
    method: 'GET',
    params: { adcode }
  })
}

/**
 * 查询帖子列表（分页）
 * @param {Object} payload
 * @param {number|string} payload.circleId 圈子ID
 * @param {number} [payload.pageNum] 页码
 * @param {number} [payload.pageSize] 每页数量
 * @returns {Promise<Object>} PageResult<PostDTO>
 */
export function listPosts({ circleId, pageNum = 1, pageSize = 10 }) {
  return request({
    url: '/app/circle/post/list',
    method: 'GET',
    params: { circleId, pageNum, pageSize }
  })
}

/**
 * 发布帖子（图文）
 * @param {Object} payload
 * @param {number|string} payload.circleId 圈子ID
 * @param {string} payload.content 文本内容
 * @param {Array<string>} [payload.images] 图片URL数组（建议先上传得到URL）
 * @param {number} [payload.cropStageId] 关联作物阶段ID（可选，用于跳转“我的作物”）
 * @returns {Promise<Object>} 创建结果（建议返回 postId）
 */
export function createPost({ circleId, content, images = [], cropStageId }) {
  return request({
    url: '/app/circle/post/create',
    method: 'POST',
    data: { circleId, content, images, cropStageId }
  })
}

/**
 * 上传帖子图片（multipart）
 * @param {Object} payload
 * @param {string} payload.filePath 本地临时文件路径
 * @returns {Promise<Object>} 上传结果（建议 { url }）
 */
export function uploadPostImage({ filePath }) {
  return uploadFile({
    url: '/app/circle/post/upload',
    filePath,
    name: 'file',
    formData: {}
  })
}

/**
 * 点赞帖子
 * @param {Object} payload
 * @param {number} payload.postId 帖子ID
 * @returns {Promise<null>}
 */
export function likePost({ postId }) {
  return request({
    url: '/app/circle/post/like',
    method: 'POST',
    data: { postId }
  })
}

/**
 * 查询评论列表（分页）
 * @param {Object} payload
 * @param {number} payload.postId 帖子ID
 * @param {number} [payload.pageNum]
 * @param {number} [payload.pageSize]
 * @returns {Promise<Object>} PageResult<CommentDTO>
 */
export function listComments({ postId, pageNum = 1, pageSize = 20 }) {
  return request({
    url: '/app/circle/post/comments',
    method: 'GET',
    params: { postId, pageNum, pageSize }
  })
}

/**
 * 发表评论
 * @param {Object} payload
 * @param {number} payload.postId 帖子ID
 * @param {string} payload.content 评论内容
 * @returns {Promise<null>}
 */
export function addComment({ postId, content }) {
  return request({
    url: '/app/circle/post/comment',
    method: 'POST',
    data: { postId, content }
  })
}

