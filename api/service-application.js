import { get, post } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

export function apiServiceApplicationMy(applicationType) {
	return get(P + '/service-application/my', { applicationType })
}

export function apiServiceApplicationApply(data) {
	return post(P + '/service-application/apply', data)
}
