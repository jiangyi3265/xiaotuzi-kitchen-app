import { post, get } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 小程序登录：code 换 token
export function apiLogin(data) {
	return post(P + '/auth/login', data, { silent: true })
}

// 获取当前登录用户信息
export function apiUserInfo() {
	return get(P + '/auth/info', {}, { silent: true })
}

// 退出登录
export function apiLogout() {
	return post(P + '/auth/logout', {}, { silent: true })
}
