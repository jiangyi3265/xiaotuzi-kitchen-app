import { get } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 小程序功能总开关（点餐外卖 + 分享社交），值由后台 sys_config: wx.feature.enabled 控制
// 返回 { code, msg, enabled }；无需登录，失败静默（默认隐藏，避免无资质时误显示）
export function apiFeatureFlags() {
	return get(P + '/common/features', {}, { authRequired: false, silent: true })
}
