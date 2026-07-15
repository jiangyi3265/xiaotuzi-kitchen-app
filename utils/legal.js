export const LEGAL_VERSION = '2026-07-14'
export const LEGAL_ACCEPTED_KEY = 'legal_accepted_version'

export function hasAcceptedLegal() {
	return uni.getStorageSync(LEGAL_ACCEPTED_KEY) === LEGAL_VERSION
}

export function acceptLegal() {
	uni.setStorageSync(LEGAL_ACCEPTED_KEY, LEGAL_VERSION)
}

export function openLegalPage(type = 'service') {
	uni.navigateTo({
		url: '/pages/legal/legal?type=' + encodeURIComponent(type)
	})
}

export function openPrivacyPolicy() {
	// 微信小程序优先展示公众平台后台配置的官方《用户隐私保护指引》。
	// 其他端或后台未配置时，回退到小程序内的隐私政策说明页。
	// #ifdef MP-WEIXIN
	if (typeof wx !== 'undefined' && typeof wx.openPrivacyContract === 'function') {
		wx.openPrivacyContract({
			fail: () => openLegalPage('privacy')
		})
		return
	}
	// #endif
	openLegalPage('privacy')
}

