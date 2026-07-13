import { get, post } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix
export function apiFeedbackMy(){ return get(P + '/feedback/my') }
export function apiFeedbackSubmit(data){ return post(P + '/feedback', data) }
