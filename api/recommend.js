import { post } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 生成推荐：body { desc }
export function apiRecommend(data) {
	return post(P + '/recommend', data)
}
