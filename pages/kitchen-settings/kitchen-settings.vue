<template>
	<view class="page-container">
		<!-- Top Header Area (Banner + Profile Card) -->
		<view class="header-banner-section">
			<image class="banner-bg" :src="assetUrl(bannerImg, '/static/kitchen_banner.png')" mode="aspectFill"></image>
			<view class="banner-mask"></view>
			
			<view class="status-bar"></view>
			<view class="nav-bar">
				<view class="back-circle" @tap="onBackTap">
					<image class="svg-back-white" src="/static/arrow_left.svg" mode="aspectFit"></image>
				</view>
			</view>
			
			<!-- Profile Card Overlay -->
			<view class="profile-card">
				<image class="kitchen-avatar" :src="assetUrl(avatarImg, '/static/kitchen_avatar.png')" mode="aspectFill"></image>
				<view class="kitchen-info">
					<text class="kitchen-title">{{ kitchenName || '我的厨房' }}</text>
					<text class="kitchen-subtitle">{{ subtitle || '世间万物，唯有美食不可辜负' }}</text>
				</view>
			</view>
		</view>

		<!-- Settings Navigation Tabs Row -->
		<view class="tabs-nav-row">
			<view 
				class="nav-tab-item" 
				:class="{ active: activeTab === index }" 
				v-for="(item, index) in tabs" 
				:key="index"
				@tap="switchTab(index)"
			>
				<text class="tab-label">{{ item }}</text>
				<view class="active-indicator" v-if="activeTab === index"></view>
			</view>
		</view>

		<!-- Sub Form Content Scroll Area -->
		<scroll-view class="settings-form-scroll" scroll-y>
			<!-- Tab 0: 基础信息 (Basic Info) -->
			<view class="form-section-container" v-if="activeTab === 0">
				<view class="form-group">
					<text class="form-group-title">背景图</text>
					<view class="banner-upload-box" @tap="onUploadBanner">
						<image class="upload-img-preview" :src="assetUrl(bannerImg, '/static/kitchen_banner.png')" mode="aspectFill"></image>
						<view class="upload-overlay-mask">
							<text class="overlay-text">点击更换</text>
						</view>
					</view>
				</view>
				
				<view class="form-group">
					<text class="form-group-title">头像</text>
					<view class="avatar-upload-box" @tap="onUploadAvatar">
						<image class="upload-avatar-preview" :src="assetUrl(avatarImg, '/static/kitchen_avatar.png')" mode="aspectFill"></image>
						<view class="upload-overlay-mask">
							<text class="overlay-text">点击更换</text>
						</view>
					</view>
				</view>
				
				<view class="form-group">
					<text class="form-group-title">厨房名称</text>
					<input 
						class="form-input" 
						type="text" 
						v-model="kitchenName"
						placeholder="请输入厨房名称"
					/>
				</view>
			</view>

			<!-- Tab 1: 邀请下单 (Invite Orders) -->
			<view class="form-section-container" v-if="activeTab === 1">
				<view class="form-group">
					<text class="form-group-title">邀请封面</text>
					<view class="banner-upload-box" @tap="onUploadCover">
						<image class="upload-img-preview" :src="assetUrl(inviteCoverImg, '/static/kitchen_banner.png')" mode="aspectFill"></image>
						<view class="upload-overlay-mask">
							<text class="overlay-text">点击更换</text>
						</view>
					</view>
				</view>
				
				<view class="form-group">
					<text class="form-group-title">邀请文案</text>
					<textarea 
						class="form-textarea" 
						v-model="inviteText"
						placeholder="请输入邀请文案"
						maxlength="150"
					/>
				</view>
			</view>

			<!-- Tab 2: 收款码 (Payment QR) -->
			<view class="form-section-container" v-if="activeTab === 2">
				<!-- Notice banner -->
				<view class="alert-notice-banner">
					<image class="svg-info" src="/static/info.svg" mode="aspectFit"></image>
					<text class="alert-text">小程序仅支持下单时展示收款码，不支持在线支付</text>
				</view>
				
				<!-- QR Code side-by-side uploads -->
				<view class="qr-uploads-row">
					<view class="qr-upload-card">
						<text class="qr-title">微信(小绿)</text>
						<text class="qr-subtitle">上传清晰的微信收款二维码</text>
						<view class="qr-dotted-box" @tap="onUploadWechatQR">
							<image class="qr-preview" v-if="wechatQr" :src="assetUrl(wechatQr)" mode="aspectFill"></image>
							<view class="qr-box-content" v-else>
								<text class="qr-box-text">点击上传</text>
							</view>
						</view>
					</view>
					
					<view class="qr-upload-card">
						<text class="qr-title">支付宝(小蓝)</text>
						<text class="qr-subtitle">上传清晰的支付宝收款二维码</text>
						<view class="qr-dotted-box" @tap="onUploadAlipayQR">
							<image class="qr-preview" v-if="alipayQr" :src="assetUrl(alipayQr)" mode="aspectFill"></image>
							<view class="qr-box-content" v-else>
								<text class="qr-box-text">点击上传</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- Toggle Row -->
				<view class="setting-toggle-row padding-top-large">
					<text class="toggle-label">下单后展示收款码</text>
					<switch
						:checked="showQRAfterOrder"
						color="#10B981"
						@change="toggleQRShow"
					/>
				</view>
			</view>

			<!-- Tab 3: 展示 (Display Settings) -->
			<view class="form-section-container no-padding" v-if="activeTab === 3">
				<view class="settings-list-group">
					<view class="setting-toggle-row border-bottom">
						<text class="toggle-label">显示销量</text>
						<switch :checked="showSales" color="#10B981" @change="toggleSales" />
					</view>
					
					<view class="setting-toggle-row border-bottom">
						<text class="toggle-label">显示美食日历</text>
						<switch :checked="showDiary" color="#10B981" @change="toggleDiary" />
					</view>
					
					<view class="setting-toggle-row">
						<text class="toggle-label">显示随机选</text>
						<switch :checked="showRandom" color="#10B981" @change="toggleRandom" />
					</view>
				</view>
			</view>

			<!-- Tab 4: 隐私 (Privacy Settings) -->
			<view class="form-section-container no-padding" v-if="activeTab === 4">
				<view class="settings-list-group">
					<!-- Private Mode -->
					<view class="setting-toggle-row border-bottom">
						<view class="label-with-icon">
							<text class="toggle-label">私密模式</text>
							<image class="svg-question" src="/static/question_circle.svg" mode="aspectFit" @tap="showPrivateHelp"></image>
						</view>
						<switch :checked="isPrivateMode" color="#10B981" @change="togglePrivateMode" />
					</view>
					
					<!-- Validity duration select -->
					<view class="setting-select-row border-bottom" @tap="selectValidityDuration">
						<text class="select-label">邀请下单有效期</text>
						<view class="select-value-box">
							<text class="select-val">{{ validityDuration }}</text>
							<image class="chevron-right" src="/static/arrow_left.svg" mode="aspectFit"></image>
						</view>
					</view>
					
					<!-- Allow order toggle -->
					<view class="setting-toggle-row">
						<view class="label-with-icon">
							<text class="toggle-label">允许下单</text>
							<image class="svg-question" src="/static/question_circle.svg" mode="aspectFit" @tap="showAllowOrderHelp"></image>
						</view>
						<switch :checked="allowOrders" color="#10B981" @change="toggleAllowOrders" />
					</view>
				</view>
			</view>

			<!-- Tab 5: 公告 (Announcement) -->
			<view class="form-section-container" v-if="activeTab === 5">
				<view class="setting-toggle-row padding-top-large">
					<text class="toggle-label">进入小程序时弹出公告</text>
					<switch :checked="announceEnabled" color="#10B981" @change="toggleAnnounce" />
				</view>

				<view class="form-group">
					<text class="form-group-title">公告标题</text>
					<input
						class="form-input"
						type="text"
						v-model="announceTitle"
						placeholder="如：欢迎来到小兔子厨房"
						maxlength="20"
					/>
				</view>

				<view class="form-group">
					<text class="form-group-title">公告内容（每行一条）</text>
					<textarea
						class="form-textarea tall"
						v-model="announceContent"
						placeholder="每行写一句，进入时会按行显示"
						maxlength="300"
					/>
				</view>

				<view class="alert-notice-banner">
					<image class="svg-info" src="/static/info.svg" mode="aspectFit"></image>
					<text class="alert-text">改了内容并保存后，所有人下次进入会重新看到公告</text>
				</view>
			</view>

		</scroll-view>

		<!-- Bottom Solid Action Button -->
		<view class="bottom-action-wrapper">
			<view class="btn-save-settings" :class="{ disabled: saving }" @tap="saveAllSettings">
				<text>{{ saving ? '正在保存...' : '保存修改' }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { apiShopInfo, apiShopSave } from '@/api/shop.js'
	import { apiUserInfo } from '@/api/auth.js'
	import { ensureLogin } from '@/utils/login.js'
	import { uploadFile } from '@/utils/request.js'
	import config from '@/config/index.js'

	export default {
		data() {
			return {
				tabs: ['基础信息', '邀请下单', '收款码', '展示', '隐私', '公告'],
				activeTab: 0,
				saving: false,

				// 厨房设置（对接后端 kitchen_shop）
				bannerImg: '',
				avatarImg: '',
				inviteCoverImg: '',
				subtitle: '',
				wechatQr: '',
				alipayQr: '',
				// 门店信息（自提，随保存一并回写，避免被覆盖）
				storeName: '',
				storeAddress: '',
				businessHours: '',
				storePhone: '',

				// State fields
				kitchenName: '我的厨房',
				inviteText: '美味已就位,快来点餐吧~',
				showQRAfterOrder: false,
				showSales: true,
				showDiary: true,
				showRandom: true,
				isPrivateMode: false,
				validityDuration: '2天',
				allowOrders: true,

				// 公告
				announceEnabled: true,
				announceTitle: '欢迎来到小兔子厨房',
				announceContent: [
					'这是一个家庭厨房点菜小程序：',
					'1. 在「厨房」里挑选想吃的菜，加入后提交订单；',
					'2. 下单可选择 同城配送 / 厨师代炒 / 店内自提；',
					'3. 做好的菜还能分享到「分享广场」。',
					'有任何问题可以联系商家，祝你用餐愉快～'
				].join('\n')
			}
		},
		async onLoad(options) {
			// Load settings from storage
			this.kitchenName = uni.getStorageSync('kitchenName') || '我的厨房';
			this.inviteText = uni.getStorageSync('inviteText') || '美味已就位,快来点餐吧~';
			this.showQRAfterOrder = uni.getStorageSync('showQRAfterOrder') || false;
			this.showSales = uni.getStorageSync('showSales') !== false;
			this.showDiary = uni.getStorageSync('showDiary') !== false;
			this.showRandom = uni.getStorageSync('showRandom') !== false;
			this.isPrivateMode = uni.getStorageSync('isPrivateMode') || false;
			this.validityDuration = uni.getStorageSync('validityDuration') || '2天';
			this.allowOrders = uni.getStorageSync('allowOrders') !== false;

			// 公告
			const ann = uni.getStorageSync('announcement');
			if (ann && ann.title) {
				this.announceTitle = ann.title;
				this.announceContent = (ann.lines || []).join('\n');
			}
			this.announceEnabled = uni.getStorageSync('announcementEnabled') !== false;

			// 厨房资料是全局配置，只允许店主进入和保存。
			try {
				await ensureLogin();
				const profileRes = await apiUserInfo();
				const user = profileRes && profileRes.data;
				if (!user || String(user.isOwner || '0') !== '1') {
					uni.showModal({
						title: '需要店主权限',
						content: '请在后台“小程序用户 → 修改”中，将当前账号的“是否店主”设为“是”。',
						showCancel: false,
						complete: () => uni.navigateBack()
					});
					return;
				}
				// 从后端加载厨房设置（覆盖本地）
				await this.loadShop();
			} catch (e) {
				uni.navigateBack();
			}
		},
		methods: {
			assetUrl(value, fallback = '') {
				const url = String(value || '').trim();
				if (!url) return fallback;
				if (/^(https?:|data:|blob:|wxfile:)/i.test(url) || url.startsWith('/static/')) return url;
				return config.baseUrl.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
			},
			applyShop(shop) {
				if (!shop) return;
				this.kitchenName = shop.shopName || '我的厨房';
				this.inviteText = shop.inviteText || '美味已就位,快来点餐吧~';
				this.subtitle = shop.subtitle || '';
				this.bannerImg = shop.banner || '';
				this.avatarImg = shop.avatar || '';
				this.inviteCoverImg = shop.inviteCover || '';
				this.wechatQr = shop.wechatQr || '';
				this.alipayQr = shop.alipayQr || '';
				this.storeName = shop.storeName || '';
				this.storeAddress = shop.storeAddress || '';
				this.businessHours = shop.businessHours || '';
				this.storePhone = shop.storePhone || '';
				this.announceEnabled = shop.announceEnabled !== '0';
				this.announceTitle = shop.announceTitle || this.announceTitle;
				this.announceContent = shop.announceContent || this.announceContent;
			},
			onBackTap() {
				uni.navigateBack();
			},
			async loadShop() {
				try {
					const res = await apiShopInfo();
					const shop = res && res.data;
					this.applyShop(shop);
					return shop;
				} catch (e) {
					throw e;
				}
			},
			// 通用图片选择+上传，回填到指定字段
			chooseAndUpload(field) {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						const path = res.tempFilePaths && res.tempFilePaths[0];
						if (!path) return;
						uploadFile(path).then((up) => {
							this[field] = up.url;
							uni.showToast({ title: '上传成功', icon: 'success' });
						}).catch(() => {});
					}
				});
			},
			switchTab(index) {
				this.activeTab = index;
			},
			onUploadBanner() {
				this.chooseAndUpload('bannerImg');
			},
			onUploadAvatar() {
				this.chooseAndUpload('avatarImg');
			},
			onUploadCover() {
				this.chooseAndUpload('inviteCoverImg');
			},
			onUploadWechatQR() {
				this.chooseAndUpload('wechatQr');
			},
			onUploadAlipayQR() {
				this.chooseAndUpload('alipayQr');
			},
			toggleQRShow(e) {
				this.showQRAfterOrder = e.detail.value;
			},
			toggleSales(e) {
				this.showSales = e.detail.value;
			},
			toggleDiary(e) {
				this.showDiary = e.detail.value;
			},
			toggleRandom(e) {
				this.showRandom = e.detail.value;
			},
			togglePrivateMode(e) {
				this.isPrivateMode = e.detail.value;
			},
			toggleAllowOrders(e) {
				this.allowOrders = e.detail.value;
			},
			showPrivateHelp() {
				uni.showModal({
					title: '私密模式说明',
					content: '开启后，未受邀的用户无法访问您的厨房。',
					showCancel: false
				});
			},
			showAllowOrderHelp() {
				uni.showModal({
					title: '允许下单说明',
					content: '关闭后，用户只能查看厨房菜品，无法提交下单。',
					showCancel: false
				});
			},
			toggleAnnounce(e) {
				this.announceEnabled = e.detail.value;
			},
			hashStr(str) {
				let h = 0;
				for (let i = 0; i < str.length; i++) {
					h = (h * 31 + str.charCodeAt(i)) | 0;
				}
				return Math.abs(h).toString(36);
			},
			selectValidityDuration() {
				const options = ['1天', '2天', '3天', '5天', '7天', '永久'];
				uni.showActionSheet({
					itemList: options,
					success: (res) => {
						this.validityDuration = options[res.tapIndex];
					}
				});
			},
			async saveAllSettings() {
				if (this.saving) return;
				if (!String(this.kitchenName || '').trim()) {
					uni.showToast({ title: '请填写厨房名称', icon: 'none' });
					return;
				}
				this.saving = true;
				uni.showLoading({ title: '正在保存', mask: true });

				// 保存到后端并立即回读，只有服务器确认成功才显示“保存成功”。
				try {
					await ensureLogin();
					const profileRes = await apiUserInfo();
					const user = profileRes && profileRes.data;
					if (!user || String(user.isOwner || '0') !== '1') {
						throw { code: 403, msg: '无权操作，仅店主可管理' };
					}
					await apiShopSave({
						shopName: this.kitchenName.trim(),
						inviteText: this.inviteText,
						subtitle: this.subtitle,
						banner: this.bannerImg,
						avatar: this.avatarImg,
						inviteCover: this.inviteCoverImg,
						wechatQr: this.wechatQr,
						alipayQr: this.alipayQr,
						storeName: this.storeName,
						storeAddress: this.storeAddress,
						businessHours: this.businessHours,
						storePhone: this.storePhone,
						announceEnabled: this.announceEnabled ? '1' : '0',
						announceTitle: this.announceTitle,
						announceContent: this.announceContent
					});
					await this.loadShop();
				} catch (e) {
					uni.hideLoading();
					this.saving = false;
					if (Number(e && e.code) === 403) {
						uni.showModal({
							title: '保存失败',
							content: '当前账号不是店主，请先在后台“小程序用户 → 修改”中把“是否店主”设为“是”。',
							showCancel: false
						});
					}
					return;
				}

				// Persist all settings（展示/隐私/公告为本地设置）
				uni.setStorageSync('kitchenName', this.kitchenName);
				uni.setStorageSync('inviteText', this.inviteText);
				uni.setStorageSync('showQRAfterOrder', this.showQRAfterOrder);
				uni.setStorageSync('showSales', this.showSales);
				uni.setStorageSync('showDiary', this.showDiary);
				uni.setStorageSync('showRandom', this.showRandom);
				uni.setStorageSync('isPrivateMode', this.isPrivateMode);
				uni.setStorageSync('validityDuration', this.validityDuration);
				uni.setStorageSync('allowOrders', this.allowOrders);

				// 公告：内容变化时 id 随之变化，进入时即可重新提示
				const lines = (this.announceContent || '').split('\n').map(s => s.trim()).filter(s => s.length);
				const title = (this.announceTitle || '').trim() || '公告';
				uni.setStorageSync('announcement', {
					id: 'ann_' + this.hashStr(title + '|' + lines.join('|')),
					title,
					lines
				});
				uni.setStorageSync('announcementEnabled', this.announceEnabled);

				uni.hideLoading();
				this.saving = false;
				uni.showToast({
					title: '已保存并同步',
					icon: 'success',
					duration: 1000
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1000);
			}
		}
	}
</script>

<style>
	.page-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #FAFAFA;
		box-sizing: border-box;
		position: relative;
	}

	/* Top Header Section with Banner */
	.header-banner-section {
		position: relative;
		width: 750rpx;
		height: 400rpx;
		overflow: hidden;
		flex-shrink: 0;
	}

	.banner-bg {
		width: 750rpx;
		height: 400rpx;
		position: absolute;
		top: 0;
		left: 0;
	}

	.banner-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 400rpx;
		background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 65%, rgba(250,250,250,1) 100%);
		z-index: 1;
	}

	.status-bar {
		height: var(--status-bar-height);
		width: 750rpx;
		position: relative;
		z-index: 10;
	}

	.nav-bar {
		height: 44px;
		width: 750rpx;
		position: relative;
		z-index: 10;
		display: flex;
		align-items: center;
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	.back-circle {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.svg-back-white {
		width: 32rpx;
		height: 32rpx;
		filter: brightness(0) invert(1);
	}

	/* Profile Card overlay */
	.profile-card {
		position: absolute;
		bottom: 30rpx;
		left: 30rpx;
		display: flex;
		align-items: center;
		z-index: 5;
	}

	.kitchen-avatar {
		width: 90rpx;
		height: 90rpx;
		border-radius: 20rpx;
		border: 3rpx solid #FFFFFF;
		background-color: #EEEEEE;
		flex-shrink: 0;
	}

	.kitchen-info {
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 6rpx;
	}

	.kitchen-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.kitchen-subtitle {
		font-size: 22rpx;
		color: #8C8C8C;
	}

	/* Settings Tabs navigation row */
	.tabs-nav-row {
		height: 90rpx;
		background-color: #FFFFFF;
		display: flex;
		align-items: center;
		border-bottom: 1rpx solid #EEEEEE;
		flex-shrink: 0;
	}

	.nav-tab-item {
		flex: 1;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.tab-label {
		font-size: 28rpx;
		color: #666666;
		transition: all 0.2s;
	}

	.nav-tab-item.active .tab-label {
		color: #1A1A1A;
		font-weight: bold;
	}

	.active-indicator {
		position: absolute;
		bottom: 0;
		width: 50rpx;
		height: 6rpx;
		border-radius: 3rpx;
		background-color: #10B981;
	}

	/* Form scroll view */
	.settings-form-scroll {
		flex: 1;
		width: 750rpx;
		box-sizing: border-box;
		overflow: hidden;
	}

	.form-section-container {
		padding: 30rpx;
		display: flex;
		flex-direction: column;
		gap: 36rpx;
		box-sizing: border-box;
		padding-bottom: 200rpx; /* safe bottom save button overlay */
	}

	.form-section-container.no-padding {
		padding: 30rpx 0;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.form-group-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
		padding-left: 6rpx;
	}

	/* Image uploads styles */
	.banner-upload-box {
		width: 100%;
		height: 300rpx;
		border-radius: 20rpx;
		overflow: hidden;
		position: relative;
		border: 1rpx solid #EAEAEA;
	}

	.upload-img-preview {
		width: 100%;
		height: 100%;
		background-color: #EEEEEE;
	}

	.avatar-upload-box {
		width: 140rpx;
		height: 140rpx;
		border-radius: 24rpx;
		overflow: hidden;
		position: relative;
		border: 1rpx solid #EAEAEA;
	}

	.upload-avatar-preview {
		width: 100%;
		height: 100%;
		background-color: #EEEEEE;
	}

	.upload-overlay-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.overlay-text {
		color: #FFFFFF;
		font-size: 24rpx;
		font-weight: 500;
	}

	/* Form Inputs */
	.form-input {
		width: 100%;
		height: 84rpx;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		border: 1rpx solid #E2E2E2;
		padding: 0 24rpx;
		box-sizing: border-box;
		font-size: 28rpx;
		color: #333333;
	}

	.form-textarea {
		width: 100%;
		height: 200rpx;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		border: 1rpx solid #E2E2E2;
		padding: 20rpx 24rpx;
		box-sizing: border-box;
		font-size: 28rpx;
		color: #333333;
		line-height: 1.5;
	}

	.form-textarea.tall {
		height: 280rpx;
	}

	/* Notice bar for Payment qr tab */
	.alert-notice-banner {
		background-color: #EBFBF8;
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
		display: flex;
		align-items: center;
		box-sizing: border-box;
		margin-bottom: 12rpx;
	}

	.svg-info {
		width: 32rpx;
		height: 32rpx;
		flex-shrink: 0;
	}

	.alert-text {
		font-size: 24rpx;
		color: #059669;
		margin-left: 12rpx;
		font-weight: 500;
	}

	/* QR Code card uploads styles */
	.qr-uploads-row {
		display: flex;
		gap: 24rpx;
	}

	.qr-upload-card {
		flex: 1;
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 30rpx 24rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.02);
		border: 1rpx solid #EAEAEA;
		box-sizing: border-box;
	}

	.qr-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #1A1A1A;
		text-align: center;
	}

	.qr-subtitle {
		font-size: 20rpx;
		color: #8C8C8C;
		margin-top: 10rpx;
		margin-bottom: 24rpx;
		text-align: center;
		line-height: 1.3;
	}

	.qr-dotted-box {
		width: 220rpx;
		height: 220rpx;
		border: 2rpx dashed #C2C2C2;
		border-radius: 20rpx;
		background-color: #FBFBFB;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		overflow: hidden;
	}

	.qr-preview {
		width: 100%;
		height: 100%;
		border-radius: 18rpx;
	}

	.qr-box-text {
		font-size: 24rpx;
		color: #8C8C8C;
	}

	/* Toggle and setting lists rows */
	.settings-list-group {
		background-color: #FFFFFF;
		border-top: 1rpx solid #EEEEEE;
		border-bottom: 1rpx solid #EEEEEE;
		padding: 0 30rpx;
		box-sizing: border-box;
	}

	.setting-toggle-row {
		height: 110rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
	}

	.setting-toggle-row.padding-top-large {
		margin-top: 20rpx;
		background-color: #FFFFFF;
		padding: 0 30rpx;
		border-radius: 20rpx;
		border: 1rpx solid #EAEAEA;
		height: 110rpx;
	}

	.setting-toggle-row.border-bottom {
		border-bottom: 1rpx solid #F2F2F2;
	}

	.label-with-icon {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.svg-question {
		width: 32rpx;
		height: 32rpx;
		opacity: 0.5;
	}

	.toggle-label {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
	}

	/* Selector row settings */
	.setting-select-row {
		height: 110rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
	}

	.setting-select-row.border-bottom {
		border-bottom: 1rpx solid #F2F2F2;
	}

	.select-label {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
	}

	.select-value-box {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.select-val {
		font-size: 28rpx;
		color: #8C8C8C;
	}

	.chevron-right {
		width: 24rpx;
		height: 24rpx;
		transform: rotate(180deg);
		opacity: 0.3;
	}

	/* Bottom floating Save Changes Button */
	.bottom-action-wrapper {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 750rpx;
		padding: 30rpx 30rpx 50rpx 30rpx;
		box-sizing: border-box;
		background: linear-gradient(180deg, rgba(250,250,250,0) 0%, rgba(250,250,250,1) 30%);
		z-index: 10;
	}

	.btn-save-settings {
		background-color: #10B981;
		color: #FFFFFF;
		height: 90rpx;
		border-radius: 45rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		font-weight: bold;
		box-shadow: 0 8rpx 20rpx rgba(16, 185, 129, 0.25);
	}

	.btn-save-settings.disabled {
		opacity: 0.58;
	}
</style>
