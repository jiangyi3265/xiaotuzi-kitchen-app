import { get, post } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 广场列表，分页，仅展示审核通过内容
export function apiShareList(params) {
	return get(P + '/share/list', params)
}

// 发布成品
// data: { title, content, images, tags }
export function apiSharePublish(data) {
	return post(P + '/share/publish', data)
}

// 点赞或取消点赞
export function apiShareLike(id) {
	return post(P + '/share/like/' + id, {})
}
