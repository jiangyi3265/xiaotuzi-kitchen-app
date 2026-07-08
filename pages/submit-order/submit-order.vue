<template>
	<view class="submit-page">
		<view class="submit-header">
			<view class="status-bar"></view>
			<view class="submit-nav">
				<view class="nav-back" @tap="goBack">
					<image class="back-icon" src="/static/back_green.svg" mode="aspectFit"></image>
				</view>
				<text class="submit-title">提交订单</text>
			</view>
		</view>

		<view class="submit-content">
			<view class="submit-card selected-card">
				<text class="card-title">已选</text>
				<view class="selected-list" v-if="selectedDishes.length > 0">
					<view class="selected-row" v-for="dish in selectedDishes" :key="dish.id">
						<image class="selected-img" :src="dish.image" mode="aspectFill"></image>
						<text class="selected-name">{{ dish.name }}</text>
						<text class="selected-count">x {{ dish.quantity }}</text>
					</view>
				</view>
				<view class="selected-row" v-else>
					<image class="selected-img" :src="selectedImage" mode="aspectFill"></image>
					<text class="selected-name">{{ selectedName }}</text>
					<text class="selected-count">x {{ selectedCount }}</text>
				</view>
			</view>

			<view class="submit-card service-card">
				<text class="card-title">用餐安排</text>
				<view class="service-row">
					<text class="service-label">用餐类型</text>
					<view class="service-options">
						<view
							class="service-chip"
							:class="{ active: selectedService === item }"
							v-for="item in serviceTypes"
							:key="item"
							@tap="selectService(item)"
						>
							<text>{{ item }}</text>
						</view>
					</view>
				</view>
				<view class="chef-section" v-if="selectedService === '同城配送' && deliveryStaff.length">
					<view class="chef-section-head">
						<text class="chef-section-title">选择配送员</text>
						<text class="chef-section-count">可不指定</text>
					</view>
					<view class="chef-list">
						<view
							class="chef-row"
							:class="{ active: selectedDeliveryId === '' }"
							@tap="selectDelivery('')"
						>
							<view class="chef-info">
								<view class="chef-name-line">
									<text class="chef-name">不指定配送员</text>
								</view>
								<text class="chef-desc">由商家统一安排配送</text>
							</view>
							<view class="chef-check">
								<text v-if="selectedDeliveryId === ''">✓</text>
							</view>
						</view>
						<view
							class="chef-row"
							:class="{ active: selectedDeliveryId === staff.id }"
							v-for="staff in deliveryStaff"
							:key="staff.id"
							@tap="selectDelivery(staff.id)"
						>
							<image class="chef-avatar" :src="staff.avatar" mode="aspectFill"></image>
							<view class="chef-info">
								<view class="chef-name-line">
									<text class="chef-name">{{ staff.name }}</text>
									<view class="chef-tag">
										<text>{{ staff.tag }}</text>
									</view>
								</view>
								<text class="chef-desc">{{ staff.desc }}</text>
							</view>
							<view class="chef-side">
								<text class="chef-price">{{ staff.fee }}</text>
								<text class="chef-time">{{ staff.time }}</text>
							</view>
							<view class="chef-check">
								<text v-if="selectedDeliveryId === staff.id">✓</text>
							</view>
						</view>
					</view>
				</view>
				<view class="chef-section" v-if="selectedService === '厨师代炒'">
					<view class="chef-section-head">
						<text class="chef-section-title">选择厨师</text>
						<text class="chef-section-count">共 {{ chefList.length }} 位</text>
					</view>
					<view class="chef-list">
						<view
							class="chef-row"
							:class="{ active: selectedChefId === chef.id }"
							v-for="chef in chefList"
							:key="chef.id"
							@tap="selectChef(chef)"
						>
							<image class="chef-avatar" :src="chef.avatar" mode="aspectFill"></image>
							<view class="chef-info">
								<view class="chef-name-line">
									<text class="chef-name">{{ chef.name }}</text>
									<view class="chef-tag">
										<text>{{ chef.tag }}</text>
									</view>
								</view>
								<text class="chef-desc">{{ chef.desc }}</text>
							</view>
							<view class="chef-side">
								<text class="chef-price">{{ chef.price }}</text>
								<text class="chef-time">{{ chef.time }}</text>
							</view>
							<view class="chef-check">
								<text v-if="selectedChefId === chef.id">✓</text>
							</view>
						</view>
					</view>
				</view>
				<view class="delivery-section" v-if="needDelivery">
					<text class="delivery-section-title">{{ selectedService === '厨师代炒' ? '送货地址' : '收货信息' }}</text>
					<view class="delivery-row">
						<text class="delivery-label">姓名</text>
						<input
							class="delivery-input"
							v-model="deliveryName"
							placeholder="收货人姓名"
							placeholder-class="delivery-placeholder"
							maxlength="20"
						/>
					</view>
					<view class="delivery-row">
						<text class="delivery-label">手机号</text>
						<input
							class="delivery-input"
							v-model="deliveryPhone"
							type="number"
							placeholder="收货人手机号"
							placeholder-class="delivery-placeholder"
							maxlength="11"
						/>
					</view>
					<view class="delivery-row">
						<text class="delivery-label">地址</text>
						<input
							class="delivery-input"
							v-model="deliveryAddress"
							placeholder="详细收货地址"
							placeholder-class="delivery-placeholder"
							maxlength="60"
						/>
					</view>
				</view>
				<view class="pickup-section" v-if="selectedService === '店内自提'">
					<view class="pickup-head">
						<text class="pickup-title">自提地址</text>
						<view class="pickup-copy" @tap="copyStoreAddress">
							<text>复制</text>
						</view>
					</view>
					<view class="pickup-box" v-if="storeInfo.name || storeInfo.address">
						<text class="pickup-store-name" v-if="storeInfo.name">{{ storeInfo.name }}</text>
						<text class="pickup-store-address" v-if="storeInfo.address">{{ storeInfo.address }}</text>
						<view class="pickup-meta">
							<text class="pickup-meta-item" v-if="storeInfo.hours">营业时间 {{ storeInfo.hours }}</text>
							<text class="pickup-meta-item" v-if="storeInfo.phone">电话 {{ storeInfo.phone }}</text>
						</view>
					</view>
					<text class="pickup-tip">门店地址由商家在后台设置</text>
				</view>
			</view>

			<view class="submit-card remark-card">
				<text class="card-title">备注信息</text>
				<textarea
					class="remark-input"
					v-model="remark"
					placeholder="有什么口味偏好或特殊要求吗？"
					placeholder-class="remark-placeholder"
					maxlength="120"
				/>
			</view>

			<view class="submit-card share-card">
				<view class="share-copy">
					<text class="card-title">分享到“分享广场”</text>
					<text class="share-desc">做完菜后公开成品，大家都能看到你的美食</text>
				</view>
				<switch :checked="shareEnabled" color="#35cda4" @change="shareEnabled = $event.detail.value" />
			</view>
		</view>

		<view class="submit-bottom-bar">
			<text class="total-text">共 {{ selectedCount }} 件</text>
			<view class="submit-btn" @tap="submitOrder">
				<text>提交订单</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { apiChefList } from '@/api/chef.js'
	import { apiRiderList } from '@/api/rider.js'
	import { apiSubmitOrder } from '@/api/order.js'
	import { apiShopInfo } from '@/api/shop.js'
	import { apiDishDetail } from '@/api/dish.js'
	import { ensureLogin } from '@/utils/login.js'

	export default {
		data() {
			return {
				selectedCount: 1,
				selectedName: '炖猪脚',
				selectedImage: '/static/onion_chicken.png',
				// 参与后端下单的菜品明细（来自首页传入的真实菜品 id）
				orderItems: [],
				selectedDishes: [],
				serviceTypes: ['同城配送', '厨师代炒', '店内自提'],
				selectedService: '同城配送',
				// 厨师：onLoad 由 loadChefs 从后端填充
				selectedChefId: '',
				chefList: [],
				// 配送员：onLoad 由 loadRiders 从后端填充，为空则不显示、下单不带 riderId
				selectedDeliveryId: '',
				deliveryStaff: [],
				deliveryName: '',
				deliveryPhone: '',
				deliveryAddress: '',
				// 门店信息：onLoad 由 loadStoreInfo 从后端填充
				storeInfo: {
					name: '',
					address: '',
					hours: '',
					phone: ''
				},
				remark: '',
				shareEnabled: false
			}
		},
		computed: {
			needDelivery() {
				return this.selectedService === '同城配送' || this.selectedService === '厨师代炒';
			},
			serviceTypeCode() {
				return { '同城配送': '0', '厨师代炒': '1', '店内自提': '2' }[this.selectedService] || '0';
			}
		},
		onLoad(options) {
			const count = Number(options.count || 1);
			this.selectedCount = Number.isFinite(count) && count > 0 ? count : 1;
			this.selectedName = options.name ? decodeURIComponent(options.name) : '炖猪脚';
			this.selectedImage = options.image ? decodeURIComponent(options.image) : '/static/onion_chicken.png';

			// 解析首页传入的菜品 id（仅真实后端数字 id 参与下单）
			if (options.ids) {
				this.orderItems = String(options.ids)
					.split(',')
					.filter(id => /^\d+$/.test(id))
					.map(id => ({ dishId: Number(id), quantity: 1 }));
			}

			this.loadChefs();
			this.loadRiders();
			this.loadStoreInfo();
			this.loadSelectedDishes();
		},
		methods: {
			async loadSelectedDishes() {
				if (!this.orderItems.length) {
					this.selectedDishes = [];
					return;
				}
				try {
					const result = await Promise.all(this.orderItems.map(item => {
						return apiDishDetail(item.dishId)
							.then(res => {
								const dish = res && res.data;
								return dish ? {
									id: item.dishId,
									name: dish.dishName || this.selectedName,
									image: dish.cover || this.selectedImage,
									quantity: item.quantity || 1
								} : null;
							})
							.catch(() => null);
					}));
					this.selectedDishes = result.filter(Boolean);
				} catch (e) {
					this.selectedDishes = [];
				}
			},
			async loadChefs() {
				try {
					const res = await apiChefList();
					const rows = (res && res.data) || [];
					this.chefList = rows.map(c => ({
						id: c.id,
						name: c.chefName,
						tag: c.skillTag || '',
						desc: c.intro || '',
						price: c.extraPrice ? '+' + c.extraPrice : '',
						time: c.estTime || '',
						avatar: c.avatar || '/static/kitchen_avatar.png'
					}));
					if (this.chefList.length) {
						this.selectedChefId = this.chefList[0].id;
					}
				} catch (e) {}
			},
			async loadRiders() {
				try {
					const res = await apiRiderList();
					const rows = (res && res.data) || [];
					this.deliveryStaff = rows.map(r => ({
						id: r.id,
						name: r.riderName,
						tag: r.tag || '',
						desc: r.intro || '',
						fee: r.deliveryFee != null ? '+' + r.deliveryFee : '',
						time: r.estTime || '',
						avatar: r.avatar || '/static/kitchen_avatar.png'
					}));
				} catch (e) {}
			},
			async loadStoreInfo() {
				try {
					const res = await apiShopInfo();
					const shop = res && res.data;
					if (shop) {
						this.storeInfo = {
							name: shop.storeName || '',
							address: shop.storeAddress || '',
							hours: shop.businessHours || '',
							phone: shop.storePhone || ''
						};
					}
				} catch (e) {}
			},
			goBack() {
				uni.navigateBack();
			},
			selectService(item) {
				this.selectedService = item;
				if (item === '厨师代炒' && !this.selectedChefId && this.chefList.length > 0) {
					this.selectedChefId = this.chefList[0].id;
				}
			},
			selectChef(chef) {
				if (!chef) return;
				this.selectedChefId = chef.id;
			},
			selectDelivery(id) {
				this.selectedDeliveryId = id;
			},
			copyStoreAddress() {
				uni.setClipboardData({
					data: `${this.storeInfo.name} ${this.storeInfo.address}`,
					success: () => {
						uni.showToast({ title: '地址已复制', icon: 'none' });
					}
				});
			},
			async submitOrder() {
				if (this.needDelivery) {
					if (!this.deliveryName.trim()) {
						uni.showToast({ title: '请填写收货人姓名', icon: 'none' });
						return;
					}
					if (!/^1\d{10}$/.test(this.deliveryPhone.trim())) {
						uni.showToast({ title: '请填写正确的手机号', icon: 'none' });
						return;
					}
					if (!this.deliveryAddress.trim()) {
						uni.showToast({ title: '请填写收货地址', icon: 'none' });
						return;
					}
				}

				// 无真实后端菜品，无法下单
				if (!this.orderItems.length) {
					uni.showToast({ title: '没有可下单的菜品', icon: 'none' });
					return;
				}

				try {
					await ensureLogin();
					const chefId = (this.selectedService === '厨师代炒' && /^\d+$/.test(String(this.selectedChefId)))
						? this.selectedChefId : null;
					const payload = {
						serviceType: this.serviceTypeCode,
						chefId,
						receiverName: this.needDelivery ? this.deliveryName.trim() : '',
						receiverPhone: this.needDelivery ? this.deliveryPhone.trim() : '',
						receiverAddress: this.needDelivery ? this.deliveryAddress.trim() : '',
						remark: this.remark,
						shareFlag: this.shareEnabled ? '1' : '0',
						items: this.orderItems
					};
					// 同城配送且指定了真实配送员时带上 riderId（数字）
					if (this.selectedService === '同城配送' && /^\d+$/.test(String(this.selectedDeliveryId))) {
						payload.riderId = Number(this.selectedDeliveryId);
					}
					await apiSubmitOrder(payload);
					uni.removeStorageSync('selectedDishIds');
					uni.setStorageSync('afterSubmitGoOrder', '1');
					uni.showToast({ title: '下单成功', icon: 'success' });
					setTimeout(() => uni.navigateBack(), 1200);
				} catch (e) {
					// 错误提示已由请求层统一弹出
				}
			}
		}
	}
</script>

<style>
	.submit-page {
		min-height: 100vh;
		width: 750rpx;
		background:
			radial-gradient(circle at 12% 4%, rgba(61, 213, 177, 0.18) 0 92rpx, transparent 93rpx),
			linear-gradient(180deg, #eafaf6 0, #f8fbfa 300rpx, #f8fbfa 100%);
		padding-bottom: calc(142rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
		color: #202725;
		font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
	}

	.submit-header {
		width: 750rpx;
		height: 210rpx;
		box-sizing: border-box;
	}

	.status-bar {
		height: var(--status-bar-height);
	}

	.submit-nav {
		height: 118rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.nav-back {
		position: absolute;
		left: 24rpx;
		top: 24rpx;
		width: 74rpx;
		height: 74rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(251, 254, 253, 0.82);
	}

	.back-icon {
		width: 42rpx;
		height: 42rpx;
	}

	.submit-title {
		font-size: 36rpx;
		line-height: 1;
		font-weight: 900;
		color: #1b2428;
	}

	.submit-content {
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	.submit-card {
		width: 702rpx;
		margin-bottom: 22rpx;
		padding: 28rpx 28rpx;
		border-radius: 28rpx;
		background: rgba(251, 254, 253, 0.98);
		box-shadow: 0 10rpx 34rpx rgba(31, 50, 45, 0.035);
		box-sizing: border-box;
	}

	.card-title {
		display: block;
		font-size: 34rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
	}

	.selected-list {
		margin-top: 24rpx;
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.selected-row {
		height: 148rpx;
		margin-top: 28rpx;
		display: flex;
		align-items: center;
	}

	.selected-list .selected-row {
		height: 118rpx;
		margin-top: 0;
		padding: 12rpx 14rpx;
		border-radius: 20rpx;
		background: #f7fbf9;
		box-sizing: border-box;
	}

	.selected-img {
		width: 128rpx;
		height: 128rpx;
		border-radius: 16rpx;
		background: #f0f3f2;
		flex-shrink: 0;
	}

	.selected-list .selected-img {
		width: 92rpx;
		height: 92rpx;
		border-radius: 14rpx;
	}

	.selected-name {
		margin-left: 30rpx;
		font-size: 32rpx;
		line-height: 1;
		font-weight: 800;
		color: #2b3331;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.selected-list .selected-name {
		font-size: 28rpx;
		margin-left: 22rpx;
	}

	.selected-count {
		font-size: 30rpx;
		line-height: 1;
		font-weight: 700;
		color: #4e5653;
	}

	.service-row {
		margin-top: 28rpx;
		display: flex;
		align-items: center;
	}

	.service-label {
		font-size: 30rpx;
		line-height: 1;
		font-weight: 700;
		color: #2d3633;
		flex-shrink: 0;
	}

	.service-options {
		margin-left: 22rpx;
		display: flex;
		align-items: center;
		gap: 14rpx;
		flex: 1;
		overflow-x: auto;
		white-space: nowrap;
	}

	.service-chip {
		height: 58rpx;
		padding: 0 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 30rpx;
		background: #f3f6f5;
		font-size: 26rpx;
		line-height: 1;
		font-weight: 800;
		color: #59625f;
		flex-shrink: 0;
		box-sizing: border-box;
	}

	.service-chip.active {
		background: #35cda4;
		color: #fbfefd;
		box-shadow: 0 8rpx 18rpx rgba(53, 205, 164, 0.18);
	}

	.delivery-section {
		margin-top: 26rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid #eef2f1;
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.delivery-section-title {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
		margin-bottom: 6rpx;
	}

	.delivery-row {
		display: flex;
		align-items: center;
	}

	.delivery-label {
		width: 124rpx;
		font-size: 28rpx;
		line-height: 1;
		font-weight: 700;
		color: #2d3633;
		flex-shrink: 0;
	}

	.delivery-input {
		flex: 1;
		height: 76rpx;
		padding: 0 24rpx;
		border-radius: 14rpx;
		background: #f6f7f8;
		font-size: 28rpx;
		color: #2b3331;
		box-sizing: border-box;
	}

	.delivery-placeholder {
		color: #b7bdba;
	}

	.chef-section {
		margin-top: 26rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid #eef2f1;
	}

	.chef-section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16rpx;
	}

	.chef-section-title {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
	}

	.chef-section-count {
		font-size: 23rpx;
		line-height: 1;
		font-weight: 700;
		color: #9aa2a0;
	}

	.chef-list {
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}

	.chef-row {
		min-height: 116rpx;
		padding: 16rpx;
		display: flex;
		align-items: center;
		border-radius: 18rpx;
		background: #f6f8f7;
		border: 2rpx solid transparent;
		box-sizing: border-box;
	}

	.chef-row.active {
		background: #f1fffb;
		border-color: rgba(53, 205, 164, 0.68);
	}

	.chef-avatar {
		width: 74rpx;
		height: 74rpx;
		border-radius: 50%;
		background: #eef5f2;
		flex-shrink: 0;
	}

	.chef-info {
		flex: 1;
		min-width: 0;
		margin-left: 18rpx;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.chef-name-line {
		display: flex;
		align-items: center;
		gap: 12rpx;
		min-width: 0;
	}

	.chef-name {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: #24302d;
		white-space: nowrap;
	}

	.chef-tag {
		max-width: 128rpx;
		height: 34rpx;
		padding: 0 12rpx;
		display: flex;
		align-items: center;
		border-radius: 17rpx;
		background: #e7f8f2;
		font-size: 20rpx;
		line-height: 34rpx;
		font-weight: 800;
		color: #28b990;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		box-sizing: border-box;
	}

	.chef-desc {
		font-size: 22rpx;
		line-height: 1;
		font-weight: 700;
		color: #8f9794;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chef-side {
		width: 96rpx;
		margin-left: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 12rpx;
		flex-shrink: 0;
	}

	.chef-price {
		font-size: 26rpx;
		line-height: 1;
		font-weight: 900;
		color: #35cda4;
	}

	.chef-time {
		font-size: 20rpx;
		line-height: 1;
		font-weight: 700;
		color: #9aa2a0;
		white-space: nowrap;
	}

	.chef-check {
		width: 42rpx;
		height: 42rpx;
		margin-left: 14rpx;
		border-radius: 50%;
		border: 2rpx solid #d7ddda;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fbfefd;
		font-size: 24rpx;
		line-height: 1;
		font-weight: 900;
		box-sizing: border-box;
		flex-shrink: 0;
	}

	.chef-row.active .chef-check {
		border-color: #35cda4;
		background: #35cda4;
	}

	.pickup-section {
		margin-top: 26rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid #eef2f1;
	}

	.pickup-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16rpx;
	}

	.pickup-title {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
	}

	.pickup-copy {
		height: 46rpx;
		padding: 0 22rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 23rpx;
		background: #e7f8f2;
		font-size: 23rpx;
		line-height: 1;
		font-weight: 800;
		color: #28b990;
		box-sizing: border-box;
	}

	.pickup-box {
		padding: 22rpx 24rpx;
		border-radius: 18rpx;
		background: #f6f8f7;
		display: flex;
		flex-direction: column;
		gap: 14rpx;
		box-sizing: border-box;
	}

	.pickup-store-name {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: #24302d;
	}

	.pickup-store-address {
		font-size: 26rpx;
		line-height: 1.45;
		font-weight: 700;
		color: #4e5653;
	}

	.pickup-meta {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}

	.pickup-meta-item {
		font-size: 22rpx;
		line-height: 1;
		font-weight: 700;
		color: #8f9794;
	}

	.pickup-tip {
		display: block;
		margin-top: 14rpx;
		font-size: 22rpx;
		line-height: 1;
		font-weight: 700;
		color: #9aa2a0;
	}

	.remark-card {
		padding-bottom: 24rpx;
	}

	.remark-input {
		width: 100%;
		height: 110rpx;
		margin-top: 24rpx;
		padding: 24rpx;
		border-radius: 10rpx;
		background: #f6f7f8;
		font-size: 28rpx;
		line-height: 1.4;
		color: #2b3331;
		box-sizing: border-box;
	}

	.remark-placeholder {
		color: #b7bdba;
	}

	.share-card {
		min-height: 124rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.share-copy {
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}

	.share-desc {
		font-size: 24rpx;
		line-height: 1;
		font-weight: 700;
		color: #8f9794;
	}

	.submit-bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		width: 750rpx;
		height: calc(132rpx + env(safe-area-inset-bottom));
		padding: 0 24rpx env(safe-area-inset-bottom);
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(251, 254, 253, 0.98);
		box-shadow: 0 -12rpx 30rpx rgba(28, 45, 40, 0.04);
		box-sizing: border-box;
	}

	.total-text {
		font-size: 30rpx;
		line-height: 1;
		font-weight: 800;
		color: #2b3331;
	}

	.submit-btn {
		width: 238rpx;
		height: 72rpx;
		border-radius: 38rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #35cda4;
		color: #fbfefd;
		font-size: 30rpx;
		line-height: 1;
		font-weight: 900;
	}
</style>
