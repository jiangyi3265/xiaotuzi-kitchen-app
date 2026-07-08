import config from '@/config/index.js'
import { getToken, clearAuth } from '@/utils/auth.js'

const baseUrl = config.baseUrl

function buildUrl(url) {
	if (/^https?:\/\//.test(url)) {
		return url
	}
	return baseUrl + url
}

function redirectToLogin() {
	const pages = getCurrentPages()
	const current = pages.length ? pages[pages.length - 1].route : ''
	if (current !== 'pages/login/login') {
		uni.reLaunch({
			url: '/pages/login/login'
		})
	}
}

function getNetworkErrorMsg(err) {
	const detail = err && (err.errMsg || err.message || err.msg)
	return detail ? `网络异常：${detail}` : '网络异常，请检查网络和小程序域名配置'
}

export function request(options = {}) {
	const {
		url,
		method = 'GET',
		data = {},
		header = {},
		showLoading = false,
		loadingText = '加载中...',
		silent = false
	} = options

	if (showLoading) {
		uni.showLoading({ title: loadingText, mask: true })
	}

	const token = getToken()
	const finalHeader = {
		'Content-Type': 'application/json;charset=utf-8',
		...header
	}
	if (token) {
		finalHeader['wx-token'] = token
	}

	return new Promise((resolve, reject) => {
		uni.request({
			url: buildUrl(url),
			method,
			data,
			header: finalHeader,
			timeout: 15000,
			success: (res) => {
				const body = res.data || {}
				if (res.statusCode === 200 && body.code === 200) {
					resolve(body)
					return
				}
				if (body.code === 401 || res.statusCode === 401) {
					clearAuth()
					redirectToLogin()
					if (!silent) {
						uni.showToast({ title: body.msg || '登录已过期，请重新登录', icon: 'none' })
					}
					reject(body)
					return
				}
				const msg = body.msg || `请求失败(${res.statusCode})`
				if (!silent) {
					uni.showToast({ title: msg, icon: 'none' })
				}
				reject(body)
			},
			fail: (err) => {
				const failure = {
					code: -1,
					msg: getNetworkErrorMsg(err),
					detail: err
				}
				console.warn('request failed', buildUrl(url), err)
				if (!silent) {
					uni.showToast({ title: failure.msg, icon: 'none' })
				}
				reject(failure)
			},
			complete: () => {
				if (showLoading) {
					uni.hideLoading()
				}
			}
		})
	})
}

export function get(url, data, options = {}) {
	return request({ url, method: 'GET', data, ...options })
}

export function post(url, data, options = {}) {
	return request({ url, method: 'POST', data, ...options })
}

export function put(url, data, options = {}) {
	return request({ url, method: 'PUT', data, ...options })
}

export function del(url, data, options = {}) {
	return request({ url, method: 'DELETE', data, ...options })
}

export function uploadFile(filePath, options = {}) {
	const { name = 'file', formData = {}, showLoading = true } = options
	if (showLoading) {
		uni.showLoading({ title: '上传中...', mask: true })
	}
	const token = getToken()
	const header = {}
	if (token) {
		header['wx-token'] = token
	}
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: buildUrl(config.apiPrefix + '/common/upload'),
			filePath,
			name,
			formData,
			header,
			success: (res) => {
				let body = res.data
				try {
					body = typeof body === 'string' ? JSON.parse(body) : body
				} catch (e) {}
				if (body && body.code === 200) {
					resolve(body)
				} else {
					uni.showToast({ title: (body && body.msg) || '上传失败', icon: 'none' })
					reject(body)
				}
			},
			fail: (err) => {
				const failure = {
					code: -1,
					msg: '上传失败，请检查 uploadFile 合法域名',
					detail: err
				}
				uni.showToast({ title: failure.msg, icon: 'none' })
				reject(failure)
			},
			complete: () => {
				if (showLoading) {
					uni.hideLoading()
				}
			}
		})
	})
}

export default request
