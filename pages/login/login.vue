<template>
	<view class="login-page">
		<image class="hero-image" src="/static/kitchen_banner.png" mode="aspectFill"></image>
		<view class="shade"></view>

		<view class="content">
			<view class="brand">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
				<text class="title">{{ copy.title }}</text>
				<text class="subtitle">{{ copy.subtitle }}</text>
			</view>

			<view class="login-panel">
				<button class="login-button" :loading="loading" :disabled="loading" @tap="handleLogin">
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

	export default {
		data() {
			return {
				loading: false,
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
			if (getToken()) {
				this.enterHome()
			}
		},
		methods: {
			enterHome() {
				uni.reLaunch({
					url: '/pages/index/index'
				})
			},
			async handleLogin() {
				if (this.loading) return
				this.loading = true
				try {
					await doLogin()
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
		border-radius: 28rpx;
		box-shadow: 0 14rpx 40rpx rgba(32, 58, 43, 0.18);
		background: rgba(255, 255, 255, 0.76);
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
