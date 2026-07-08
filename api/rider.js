// 配送员接口（同城配送）
import { get } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 配送员列表（仅启用）
export function apiRiderList() {
	return get(P + '/rider/list')
}
