// 厨房/店铺信息接口
import { get, post } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 厨房信息（单店铺，公开）
export function apiShopInfo() {
	return get(P + '/shop/info')
}

// 保存厨房设置（店主）
export function apiShopSave(data) {
	return post(P + '/shop/save', data)
}
