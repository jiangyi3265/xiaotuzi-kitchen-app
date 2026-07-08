// 智能菜谱推荐接口（基于本店真实菜品，消耗胡萝卜积分）
import { post } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 生成推荐：body { desc }，返回菜品详情 + 剩余积分
export function apiRecommend(data) {
	return post(P + '/recommend', data)
}
