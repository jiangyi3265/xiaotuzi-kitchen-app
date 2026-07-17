import { apiFeatureFlags } from '@/api/feature.js'

const STORAGE_KEY = 'featureEnabled'

// 同步读取缓存的功能开关（默认关闭=隐藏，确保无资质/网络异常时不误显示需资质的功能）
export function isFeatureEnabledCached() {
	return uni.getStorageSync(STORAGE_KEY) === true
}

// 从后端拉取并缓存功能开关，返回布尔值；失败时回退到缓存值
export async function refreshFeatureEnabled() {
	try {
		const res = await apiFeatureFlags()
		const enabled = !!(res && res.enabled)
		uni.setStorageSync(STORAGE_KEY, enabled)
		return enabled
	} catch (e) {
		return isFeatureEnabledCached()
	}
}

// 页面守卫：功能关闭时回到首页。返回 true 表示已拦截跳走。
// 供点餐/社交相关独立页面在 onLoad 调用，防止通过分享路径等直达被隐藏的页面。
export async function guardFeatureOrRedirect() {
	const enabled = await refreshFeatureEnabled()
	if (!enabled) {
		uni.reLaunch({ url: '/pages/index/index' })
		return true
	}
	return false
}
