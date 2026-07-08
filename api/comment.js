// 成品评论接口
import { get, post } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 某成品的评论列表（分页，仅展示审核通过）
export function apiCommentList(params) {
	return get(P + '/comment/list', params)
}

// 发表评论（需登录）
export function apiCommentAdd(data) {
	return post(P + '/comment/add', data)
}
