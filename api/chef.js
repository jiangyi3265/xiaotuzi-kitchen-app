import { get } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 厨师列表，仅启用
export function apiChefList() {
	return get(P + '/chef/list')
}
