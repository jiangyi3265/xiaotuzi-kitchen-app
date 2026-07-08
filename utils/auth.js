// 登录态工具：token / 用户信息的本地读写
import config from '@/config/index.js'

export function getToken() {
	return uni.getStorageSync(config.tokenKey) || ''
}

export function setToken(token) {
	uni.setStorageSync(config.tokenKey, token || '')
}

export function removeToken() {
	uni.removeStorageSync(config.tokenKey)
}

export function setUserInfo(user) {
	if (user) {
		uni.setStorageSync(config.userKey, user)
	}
}

export function removeUserInfo() {
	uni.removeStorageSync(config.userKey)
}

export function clearAuth() {
	removeToken()
	removeUserInfo()
}
