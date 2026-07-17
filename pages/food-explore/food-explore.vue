<template>
	<view class="page-container">
		<!-- Custom Navigation Bar with Search Input -->
		<view class="status-bar"></view>
		<view class="nav-bar-search">
			<view class="back-btn" @tap="onBackTap">
				<image class="svg-back" src="/static/back_green.svg" mode="aspectFit"></image>
			</view>
			
			<!-- 装饰性搜索框（无逻辑）已隐藏 -->
			<view class="search-input-wrapper" v-if="false">
				<image class="svg-search" src="/static/search.svg" mode="aspectFit"></image>
				<input
					class="search-input"
					type="text"
					placeholder="搜菜名、食材或口味"
					placeholder-style="color: #A3A3A3"
				/>
			</view>

			<!-- Capsule spacer -->
			<view class="capsule-spacer"></view>
		</view>

		<!-- Sub Header Details -->
		<view class="title-subheader-section">
			<view class="title-row">
				<text class="title-text">烟火食记 · 看看想吃什么</text>
				<view class="all-dishes-badge">
					<text>全部菜品</text>
				</view>
			</view>
			<text class="subtitle-text">从菜名里挑灵感</text>
		</view>

		<!-- Filter Tabs Row -->
		<view class="filters-row">
			<view 
				class="filter-pill" 
				:class="{ active: selectedFilter === 'all' }" 
				@tap="selectFilter('all')"
			>
				<text>全部</text>
			</view>
			<view 
				class="filter-pill outline" 
				:class="{ active: selectedFilter === 'steps' }" 
				@tap="selectFilter('steps')"
			>
				<text>有步骤</text>
			</view>
			<view 
				class="filter-pill outline" 
				:class="{ active: selectedFilter === 'no-steps' }" 
				@tap="selectFilter('no-steps')"
			>
				<text>无步骤</text>
			</view>
		</view>

		<!-- Double Column Grid Scroll Area -->
		<scroll-view class="grid-scroll-area" scroll-y>
			<view class="explore-empty-state" v-if="!filteredItems.length">
				<text class="explore-empty-text">还没有菜品哦</text>
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
							<view class="author-wrapper">
								<image class="author-avatar" :src="item.authorAvatar" mode="aspectFill"></image>
								<text class="author-name">{{ item.author }}</text>
							</view>
							
							<view class="cart-action" :class="{ selected: item.cartCount > 0 }" @tap.stop="onCartIconTap(item)">
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
	import { guardFeatureOrRedirect } from '@/utils/feature.js'

	export default {
		data() {
			return {
				selectedFilter: 'all',
				// 菜品由 loadExplore 从后端填充；为空显示空状态
				exploreItems: []
			}
		},
		async onLoad() {
			if (await guardFeatureOrRedirect()) return;
			this.loadExplore();
		},
		onShow() {
			this.syncCartState();
		},
		computed: {
			filteredItems() {
				if (this.selectedFilter === 'steps') {
					return this.exploreItems.filter(item => item.hasSteps);
				} else if (this.selectedFilter === 'no-steps') {
					return this.exploreItems.filter(item => !item.hasSteps);
				}
				return this.exploreItems;
			}
		},
		methods: {
			async loadExplore() {
				try {
					const res = await apiDishList({ pageNum: 1, pageSize: 100 });
					const rows = (res && res.rows) || [];
					this.exploreItems = rows.map(d => ({
						id: d.id,
						name: d.dishName,
						image: d.cover || '/static/onion_chicken.png',
						hasSteps: d.recipeOpen === '1',
						author: d.categoryName || '我的厨房',
						authorAvatar: '/static/kitchen_avatar.png',
						cartCount: this.isDishSelected(d.id) ? 1 : 0
					}));
				} catch (e) {}
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
				this.exploreItems = this.exploreItems.map(item => ({
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
			onBackTap() {
				uni.navigateBack();
			},
			selectFilter(filter) {
				this.selectedFilter = filter;
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
		background: linear-gradient(180deg, #EBFBF8 0%, #FAFAFA 30%, #FAFAFA 100%);
		box-sizing: border-box;
	}

	/* Status Bar & Custom Search Header */
	.status-bar {
		height: var(--status-bar-height);
		width: 750rpx;
		flex-shrink: 0;
	}

	.nav-bar-search {
		height: 44px;
		width: 750rpx;
		display: flex;
		align-items: center;
		padding: 0 24rpx;
		box-sizing: border-box;
		gap: 16rpx;
		flex-shrink: 0;
	}

	.back-btn {
		width: 50rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.svg-back {
		width: 44rpx;
		height: 44rpx;
	}

	.search-input-wrapper {
		flex: 1;
		height: 68rpx;
		background-color: #FFFFFF;
		border-radius: 34rpx;
		display: flex;
		align-items: center;
		padding: 0 24rpx;
		box-sizing: border-box;
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.02);
		border: 1rpx solid #EAEAEA;
	}

	.svg-search {
		width: 28rpx;
		height: 28rpx;
		margin-right: 12rpx;
		opacity: 0.5;
	}

	.search-input {
		flex: 1;
		height: 100%;
		font-size: 26rpx;
		color: #333333;
	}

	.capsule-spacer {
		width: 174rpx; /* Matches capsule menu spacing to maintain layout centering */
	}

	/* Title Subheader Section */
	.title-subheader-section {
		padding: 30rpx 28rpx 10rpx 28rpx;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		flex-shrink: 0;
	}

	.title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.title-text {
		font-size: 34rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.all-dishes-badge {
		font-size: 20rpx;
		color: #10B981;
		background-color: #E6FBF7;
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
		font-weight: bold;
	}

	.subtitle-text {
		font-size: 24rpx;
		color: #8C8C8C;
	}

	/* Filters Row */
	.filters-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 20rpx 28rpx;
		flex-shrink: 0;
	}

	.filter-pill {
		height: 56rpx;
		padding: 0 28rpx;
		border-radius: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		background-color: #10B981;
		color: #FFFFFF;
		font-weight: 500;
		box-sizing: border-box;
	}

	.filter-pill.outline {
		background-color: #FFFFFF;
		color: #10B981;
		border: 1rpx solid #10B981;
	}

	/* Scroll Grid area */
	.grid-scroll-area {
		flex: 1;
		overflow: hidden;
		width: 750rpx;
		box-sizing: border-box;
	}

	.dishes-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24rpx;
		padding: 10rpx 28rpx 40rpx 28rpx;
		box-sizing: border-box;
	}

	.explore-empty-state {
		padding: 120rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.explore-empty-text {
		font-size: 26rpx;
		color: #A3A3A3;
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
		animation: popIn 0.3s cubic-bezier(0.25, 1, 0.5, 1);
	}

	@keyframes popIn {
		from { transform: scale(0.95); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
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
		justify-content: space-between;
	}

	.author-wrapper {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.author-avatar {
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		background-color: #E0E0E0;
	}

	.author-name {
		font-size: 20rpx;
		color: #8C8C8C;
		width: 110rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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
