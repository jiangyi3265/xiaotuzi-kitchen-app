// 分享广场接口
import { get, post } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 广场列表（分页，仅展示审核通过的）
export function apiShareList(params) {
	return get(P + '/share/list', params)
}

// 发布成品（需登录）
// data: { title, content, images(逗号分隔), tags(逗号分隔) }
export function apiSharePublish(data) {
	return post(P + '/share/publish', data)
}

// 点赞（需登录）
export function apiShareLike(id) {
	return post(P + '/share/like/' + id, {})
}
