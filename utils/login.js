import { apiLogin, apiLogout } from '@/api/auth.js'
import { setToken, setUserInfo, getToken, clearAuth } from '@/utils/auth.js'

export function doLogin(profile = {}) {
	return new Promise((resolve, reject) => {
		uni.login({
			provider: 'weixin',
			success: (res) => {
				if (!res.code) {
					reject(new Error('获取登录凭证失败'))
					return
				}
				apiLogin({
					code: res.code,
					nickname: profile.nickname,
					avatar: profile.avatar
				}).then((data) => {
					setToken(data.token)
					setUserInfo(data.user)
					resolve(data)
				}).catch(reject)
			},
			fail: reject
		})
	})
}

export function goLogin() {
	const pages = getCurrentPages()
	const current = pages.length ? pages[pages.length - 1].route : ''
	if (current === 'pages/login/login') return
	uni.navigateTo({
		url: '/pages/login/login'
	})
}

export function ensureLogin() {
	if (getToken()) {
		return Promise.resolve()
	}
	goLogin()
	return Promise.reject(new Error('请先登录'))
}

export function logout() {
	return apiLogout().finally(() => {
		clearAuth()
		uni.reLaunch({ url: '/pages/index/index' })
	})
}
