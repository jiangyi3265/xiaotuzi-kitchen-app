<template>
	<view class="page-container">
		<!-- Top Banner & Profile Overlays -->
		<view class="banner-section">
			<image class="banner-bg" src="/static/kitchen_banner.png" mode="aspectFill"></image>
			<view class="banner-mask"></view>
			
			<!-- Nav controls -->
			<view class="status-bar"></view>
			<view class="nav-bar">
				<view class="back-circle" @tap="onBackTap">
					<image class="svg-back-white" src="/static/arrow_left.svg" mode="aspectFit"></image>
				</view>
				<!-- Capsule Spacer -->
				<view class="capsule-spacer"></view>
			</view>
			
			<!-- Floating Profile Card -->
			<view class="profile-card">
				<view class="profile-left">
					<image class="kitchen-avatar" src="/static/kitchen_avatar.png" mode="aspectFill"></image>
					<view class="kitchen-info">
						<text class="kitchen-title">{{ kitchenTitle }}</text>
						<!-- 收藏数无后端支撑，暂隐藏 -->
					</view>
				</view>

				<!-- Floating Green Share Button -->
				<view class="share-circle-btn" @tap="onShareTap">
					<image class="svg-share-green" src="/static/share.svg" mode="aspectFit"></image>
				</view>
			</view>

			<!-- 收藏按钮无后端支撑，暂隐藏 -->
		</view>

		<!-- Horizontal Categories Tabs Scroll -->
		<scroll-view class="categories-scroll-row" scroll-x show-scrollbar="false">
			<view class="tabs-container">
				<view 
					class="tab-pill" 
					:class="{ active: selectedCategory === item }" 
					v-for="(item, index) in categories" 
					:key="index"
					@tap="selectCategory(item)"
				>
					<text>{{ item }}</text>
				</view>
			</view>
		</scroll-view>

		<!-- Double Column Dishes Grid -->
		<scroll-view class="grid-scroll-area" scroll-y>
			<view class="kitchen-empty-state" v-if="!filteredItems.length">
				<text class="kitchen-empty-text">该厨房暂无菜品</text>
			</view>
			<view class="dishes-grid" v-else>
				<view
					class="dish-explore-card"
					v-for="(item, index) in filteredItems"
					:key="index"
					@tap="onDishTap(item.id)"
				>
					<view class="card-img-wrapper">
						<image class="dish-img" :src="item.image" mode="aspectFill"></image>
						<view class="step-tag" v-if="item.hasSteps">
							<text>有步骤</text>
						</view>
					</view>
					
					<view class="card-info">
						<text class="dish-title">{{ item.name }}</text>
						<view class="card-bottom">
							<view class="cart-action" v-if="orderEnabled" :class="{ selected: item.cartCount > 0 }" @tap.stop="onCartIconTap(item)">
								<view v-if="item.cartCount > 0" class="select-checkmark"></view>
								<text v-else>+</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import { apiDishList } from '@/api/dish.js'
	import { apiShopInfo } from '@/api/shop.js'
	import { refreshFeatureEnabled, isFeatureEnabledCached } from '@/utils/feature.js'

	export default {
		data() {
			return {
				kitchenTitle: '我的厨房',
				selectedCategory: '全部',
				// 分类与菜品由 loadKitchen 从后端填充；为空显示空状态
				categories: ['全部'],
				dishes: [],
				// 点餐功能总开关：控制菜品卡"加入购物车"按钮显隐（缓存值即时可用，onLoad 从后端刷新）
				orderEnabled: isFeatureEnabledCached()
			}
		},
		computed: {
			filteredItems() {
				if (this.selectedCategory === '全部') {
					return this.dishes;
				}
				return this.dishes.filter(item => item.category === this.selectedCategory);
			}
		},
		onLoad() {
			this.loadKitchen();
			refreshFeatureEnabled().then(enabled => { this.orderEnabled = enabled; });
		},
		onShow() {
			this.syncCartState();
		},
		methods: {
			async loadKitchen() {
				try {
					const [shopRes, dishRes] = await Promise.all([
						apiShopInfo(),
						apiDishList({ pageNum: 1, pageSize: 200 })
					]);
					const shop = shopRes && shopRes.data;
					if (shop && shop.shopName) {
						this.kitchenTitle = shop.shopName;
					}
					const rows = (dishRes && dishRes.rows) || [];
					this.dishes = rows.map(d => ({
						id: d.id,
						name: d.dishName,
						image: d.cover || '/static/onion_chicken.png',
						hasSteps: d.recipeOpen === '1',
						category: d.categoryName || '默认分类',
						cartCount: this.isDishSelected(d.id) ? 1 : 0
					}));
					// 分类 pill 用菜品实际分类，保证筛选匹配
					this.categories = ['全部', ...Array.from(new Set(rows.map(d => d.categoryName).filter(Boolean)))];
				} catch (e) {}
			},
			onBackTap() {
				uni.navigateBack();
			},
			selectCategory(category) {
				this.selectedCategory = category;
			},
			getSelectedDishIds() {
				const ids = uni.getStorageSync('selectedDishIds');
				return Array.isArray(ids) ? ids : [];
			},
			getSelectedDishQuantities() {
				const quantities = uni.getStorageSync('selectedDishQuantities');
				return quantities && typeof quantities === 'object' ? quantities : {};
			},
			isDishSelected(id) {
				return this.getSelectedDishIds().some(item => String(item) === String(id));
			},
			syncCartState() {
				this.dishes = this.dishes.map(item => ({
					...item,
					cartCount: this.isDishSelected(item.id) ? 1 : 0
				}));
			},
			toggleStoredDish(id) {
				const ids = this.getSelectedDishIds();
				const quantities = this.getSelectedDishQuantities();
				const key = String(id);
				const idx = ids.findIndex(item => String(item) === String(id));
				if (idx > -1) {
					ids.splice(idx, 1);
					delete quantities[key];
				} else {
					ids.push(id);
					quantities[key] = quantities[key] || 1;
				}
				uni.setStorageSync('selectedDishIds', ids);
				uni.setStorageSync('selectedDishQuantities', quantities);
				return idx === -1;
			},
			onShareTap() {
				uni.setClipboardData({
					data: '来「' + (this.kitchenTitle || '小兔子厨房') + '」看看今天吃点什么～',
					success: () => {
						uni.showToast({ title: '分享文案已复制', icon: 'none' });
					}
				});
			},
			onDishTap(id) {
				uni.navigateTo({
					url: `/pages/dish-detail/dish-detail?id=${id}`
				});
			},
			onCartIconTap(item) {
				const selected = this.toggleStoredDish(item.id);
				item.cartCount = selected ? 1 : 0;
				uni.showToast({
					title: selected ? '已加入购物车' : '已取消选择',
					icon: 'none'
				});
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
	}

	/* Top Banner Header */
	.banner-section {
		position: relative;
		width: 750rpx;
		height: 480rpx;
		overflow: hidden;
		flex-shrink: 0;
	}

	.banner-bg {
		width: 750rpx;
		height: 480rpx;
		position: absolute;
		top: 0;
		left: 0;
	}

	.banner-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 480rpx;
		background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 65%, rgba(250,250,250,1) 100%);
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
		justify-content: space-between;
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

	.capsule-spacer {
		width: 174rpx;
	}

	/* Floating profile info card */
	.profile-card {
		position: absolute;
		bottom: 120rpx;
		left: 24rpx;
		right: 24rpx;
		height: 140rpx;
		background-color: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(10px);
		border-radius: 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 28rpx;
		box-sizing: border-box;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
		z-index: 5;
	}

	.profile-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.kitchen-avatar {
		width: 90rpx;
		height: 90rpx;
		border-radius: 18rpx;
		background-color: #EEEEEE;
	}

	.kitchen-info {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.kitchen-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.collect-count-row {
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.svg-heart {
		width: 24rpx;
		height: 24rpx;
	}

	.collect-count {
		font-size: 22rpx;
		color: #8C8C8C;
	}

	.share-circle-btn {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background-color: #EBFBF8;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 10rpx rgba(16, 185, 129, 0.15);
	}

	.svg-share-green {
		width: 32rpx;
		height: 32rpx;
	}

	/* Star Action Button */
	.collect-action-btn {
		position: absolute;
		bottom: 30rpx;
		left: 36rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
		z-index: 5;
		cursor: pointer;
	}

	.svg-star {
		width: 36rpx;
		height: 36rpx;
	}

	.collect-text {
		font-size: 26rpx;
		color: #FFFFFF;
		font-weight: bold;
		text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.6);
	}

	/* Categories row tabs scroll */
	.categories-scroll-row {
		width: 750rpx;
		padding: 20rpx 0;
		box-sizing: border-box;
		background-color: #FAFAFA;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.tabs-container {
		display: inline-flex;
		padding: 0 24rpx;
		gap: 16rpx;
	}

	.tab-pill {
		height: 58rpx;
		padding: 0 32rpx;
		border-radius: 29rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		background-color: #FFFFFF;
		color: #666666;
		border: 1rpx solid #EAEAEA;
		box-sizing: border-box;
	}

	.tab-pill.active {
		background-color: #10B981;
		color: #FFFFFF;
		border-color: #10B981;
		font-weight: 500;
	}

	/* Grid Scroll View */
	.grid-scroll-area {
		flex: 1;
		width: 750rpx;
		box-sizing: border-box;
		overflow: hidden;
	}

	.dishes-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24rpx;
		padding: 10rpx 24rpx 40rpx 24rpx;
		box-sizing: border-box;
	}

	.kitchen-empty-state {
		padding: 120rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.kitchen-empty-text {
		font-size: 26rpx;
		color: #8C8C8C;
		font-weight: 500;
	}

	.dish-explore-card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.card-img-wrapper {
		position: relative;
		width: 100%;
		height: 280rpx;
	}

	.dish-img {
		width: 100%;
		height: 100%;
		background-color: #F0F0F0;
	}

	.step-tag {
		position: absolute;
		top: 0;
		right: 0;
		background: linear-gradient(135deg, #10B981 0%, #059669 100%);
		color: #FFFFFF;
		font-size: 18rpx;
		padding: 6rpx 14rpx;
		border-bottom-left-radius: 16rpx;
		font-weight: bold;
	}

	.card-info {
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.dish-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #1A1A1A;
		line-height: 1.3;
	}

	.card-bottom {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.cart-action {
		width: 52rpx;
		height: 52rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 3rpx solid #18c256;
		background: #FFFFFF;
		color: #18c256;
		font-size: 34rpx;
		line-height: 1;
		font-weight: 900;
		box-sizing: border-box;
		box-shadow: 0 8rpx 18rpx rgba(24, 194, 86, 0.13);
	}

	.cart-action.selected {
		background: #18c256;
		color: #FFFFFF;
	}

	.select-checkmark {
		width: 18rpx;
		height: 10rpx;
		border-left: 4rpx solid currentColor;
		border-bottom: 4rpx solid currentColor;
		transform: rotate(-45deg);
		margin-top: -4rpx;
		box-sizing: border-box;
	}
</style>
