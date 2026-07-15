<template>
	<view class="login-page">
		<image class="hero-image" src="/static/kitchen_banner.png" mode="aspectFill"></image>
		<view class="shade"></view>

		<view class="content">
			<view class="brand">
				<image class="logo" src="/static/kitchen_avatar.png" mode="aspectFill"></image>
				<text class="title">{{ copy.title }}</text>
				<text class="subtitle">{{ copy.subtitle }}</text>
			</view>

			<view class="login-panel">
				<view class="agreement-row" @tap="toggleAgreement">
					<view class="agreement-check" :class="{ checked: agreementAccepted }"><text v-if="agreementAccepted">✓</text></view>
					<text class="agreement-copy">我已阅读并同意</text>
					<text class="agreement-link" @tap.stop="openServiceAgreement">《用户服务协议》</text>
					<text class="agreement-link" @tap.stop="openPrivacyAgreement">《隐私政策》</text>
				</view>
				<button
					id="privacy-login-button"
					class="login-button"
					:loading="loading"
					:disabled="loading || !agreementAccepted"
					:open-type="privacyAuthorizationRequired ? 'agreePrivacyAuthorization' : ''"
					@tap="handleLoginTap"
					@agreeprivacyauthorization="handlePrivacyAuthorization"
				>
					{{ loading ? copy.loading : copy.button }}
				</button>
				<text class="hint">{{ copy.hint }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { doLogin } from '@/utils/login.js'
	import { getToken } from '@/utils/auth.js'
	import { acceptLegal, hasAcceptedLegal, openLegalPage, openPrivacyPolicy } from '@/utils/legal.js'

	export default {
		data() {
			return {
				loading: false,
				agreementAccepted: false,
				privacyAuthorizationRequired: false,
				copy: {
					title: '\u9986\u5bb6\u79c1\u53a8',
					subtitle: '\u767b\u5f55\u540e\u67e5\u770b\u83dc\u5355\u3001\u4e0b\u5355\u548c\u7ba1\u7406\u53a8\u623f',
					button: '\u5fae\u4fe1\u767b\u5f55',
					loading: '\u767b\u5f55\u4e2d',
					hint: '\u7528\u4e8e\u8bc6\u522b\u4f60\u7684\u8ba2\u5355\u3001\u6536\u85cf\u548c\u53a8\u623f\u6743\u9650',
					success: '\u767b\u5f55\u6210\u529f',
					failed: '\u767b\u5f55\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5'
				}
			}
		},
		onShow() {
			this.checkEntryState()
		},
		methods: {
			checkPrivacySetting() {
				return new Promise(resolve => {
					// #ifdef MP-WEIXIN
					if (typeof wx !== 'undefined' && typeof wx.getPrivacySetting === 'function') {
						wx.getPrivacySetting({
							success: res => resolve(!!res.needAuthorization),
							fail: () => resolve(false)
						})
						return
					}
					// #endif
					resolve(false)
				})
			},
			async checkEntryState() {
				this.agreementAccepted = this.agreementAccepted || hasAcceptedLegal()
				this.privacyAuthorizationRequired = await this.checkPrivacySetting()
				if (getToken() && this.agreementAccepted && !this.privacyAuthorizationRequired) this.enterHome()
			},
			toggleAgreement() {
				this.agreementAccepted = !this.agreementAccepted
			},
			openServiceAgreement() {
				openLegalPage('service')
			},
			openPrivacyAgreement() {
				openPrivacyPolicy()
			},
			handleLoginTap() {
				if (!this.agreementAccepted) {
					uni.showToast({ title: '请先阅读并同意协议', icon: 'none' })
					return
				}
				if (this.privacyAuthorizationRequired) return
				this.handleLogin()
			},
			handlePrivacyAuthorization() {
				if (!this.agreementAccepted) return
				this.privacyAuthorizationRequired = false
				this.handleLogin()
			},
			enterHome() {
				uni.reLaunch({
					url: '/pages/index/index'
				})
			},
			async handleLogin() {
				if (this.loading) return
				if (!this.agreementAccepted) return
				this.loading = true
				try {
					await doLogin()
					acceptLegal()
					uni.showToast({
						title: this.copy.success,
						icon: 'success',
						duration: 700
					})
					setTimeout(() => {
						this.enterHome()
					}, 500)
				} catch (e) {
					console.warn('login failed', e)
					const msg = (e && (e.msg || e.message || e.errMsg)) || this.copy.failed
					uni.showModal({
						title: this.copy.failed,
						content: msg,
						showCancel: false
					})
				} finally {
					this.loading = false
				}
			}
		}
	}
</script>

<style scoped>
	.login-page {
		position: relative;
		min-height: 100vh;
		overflow: hidden;
		background: #f7f4ec;
		color: #26362d;
	}

	.hero-image {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 56vh;
	}

	.shade {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: 68vh;
		background: linear-gradient(180deg, rgba(20, 43, 31, 0.12), rgba(247, 244, 236, 0.96) 78%);
	}

	.content {
		position: relative;
		z-index: 1;
		min-height: 100vh;
		padding: 132rpx 44rpx 56rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.brand {
		padding-top: 36rpx;
	}

	.logo {
		width: 112rpx;
		height: 112rpx;
		border-radius: 50%;
		border: 4rpx solid rgba(255, 255, 255, 0.88);
		box-shadow: 0 14rpx 40rpx rgba(32, 58, 43, 0.18);
		background: #fff8e9;
	}

	.title {
		display: block;
		margin-top: 34rpx;
		font-size: 56rpx;
		font-weight: 700;
		line-height: 1.16;
		letter-spacing: 0;
		color: #20382a;
	}

	.subtitle {
		display: block;
		margin-top: 18rpx;
		font-size: 29rpx;
		line-height: 1.55;
		color: #637268;
	}

	.login-panel {
		padding-bottom: env(safe-area-inset-bottom);
	}

	.agreement-row {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		min-height: 64rpx;
		margin-bottom: 14rpx;
		font-size: 23rpx;
		line-height: 1.6;
		color: #6f7c73;
	}

	.agreement-check {
		width: 30rpx;
		height: 30rpx;
		margin-right: 10rpx;
		box-sizing: border-box;
		border: 2rpx solid #8b9990;
		border-radius: 50%;
		text-align: center;
		line-height: 26rpx;
		font-size: 20rpx;
		color: #fbfaf5;
	}

	.agreement-check.checked { border-color: #28784d; background: #28784d; }
	.agreement-copy { margin-right: 2rpx; }
	.agreement-link { color: #1e7048; }

	.login-button {
		height: 96rpx;
		line-height: 96rpx;
		border-radius: 16rpx;
		background: #28784d;
		color: #fbfaf5;
		font-size: 31rpx;
		font-weight: 650;
		box-shadow: 0 16rpx 36rpx rgba(40, 120, 77, 0.24);
	}

	.login-button[disabled] {
		background: #8ca799;
		color: #fbfaf5;
	}

	.login-button::after {
		border: 0;
	}

	.hint {
		display: block;
		margin-top: 22rpx;
		text-align: center;
		font-size: 24rpx;
		line-height: 1.4;
		color: #7a867d;
	}
</style>
