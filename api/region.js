import { get, post } from '@/utils/request.js'
import config from '@/config/index.js'
const P=config.apiPrefix
export function apiRegionStatus(params){return get(P+'/region/status',params)}
export function apiRegionApply(data){return post(P+'/region/apply',data)}
