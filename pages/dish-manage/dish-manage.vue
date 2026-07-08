<template>
	<view class="page-container">
		<!-- Custom Navigation Bar -->
		<view class="status-bar"></view>
		<view class="nav-bar">
			<view class="back-btn" @tap="onBackTap">
				<image class="svg-back" src="/static/back_green.svg" mode="aspectFit"></image>
			</view>
			<view class="nav-title">
				<text>菜品管理</text>
			</view>
			<!-- Simulated Capsule Menu for layout alignment -->
			<view class="capsule-menu">
				<view class="capsule-dots">
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot"></span>
				</view>
				<view class="capsule-divider"></view>
				<view class="capsule-circle">
					<view class="circle-inner"></view>
				</view>
			</view>
		</view>

		<!-- Sub Header Actions Bar -->
		<view class="subheader-bar">
			<view class="category-btn" @tap="onCategoryManageTap">
				<image class="svg-gear" src="/static/gear.svg" mode="aspectFit"></image>
				<text>分类管理</text>
			</view>
			<!-- 批量操作/美食排序暂无后端支撑，待实现后再开放 -->
		</view>

		<!-- Main Columns Area -->
		<view class="main-split-area">
			<!-- Left Side Categories Sidebar -->
			<scroll-view class="sidebar-left" scroll-y>
				<view
					class="sidebar-item"
					:class="{ active: selectedCategoryIndex === index }"
					v-for="(item, index) in categories"
					:key="index"
					@tap="selectCategory(index)"
				>
					<text class="sidebar-text">{{ item.catName }}</text>
					<view class="active-bar" v-if="selectedCategoryIndex === index"></view>
				</view>
				<!-- Fallback placeholder if no categories -->
				<view class="sidebar-empty" v-if="categories.length === 0">
					<text class="sidebar-empty-text">无分类</text>
				</view>
			</scroll-view>

			<!-- Right Side Dishes Area -->
			<scroll-view class="dishes-area-right" scroll-y>
				<view class="dish-manage-list" v-if="filteredDishes.length">
					<view class="dish-manage-card" v-for="dish in filteredDishes" :key="dish.id">
						<image class="dm-cover" :src="dish.cover || '/static/onion_chicken.png'" mode="aspectFill"></image>
						<view class="dm-info">
							<text class="dm-name">{{ dish.dishName }}</text>
							<text class="dm-meta">{{ dish.status === '1' ? '已上架' : '已下架' }}<text v-if="dish.virtualPrice"> · ￥{{ dish.virtualPrice }}</text></text>
						</view>
						<view class="dm-actions">
							<view class="dm-btn" @tap="toggleStatus(dish)">
								<text>{{ dish.status === '1' ? '下架' : '上架' }}</text>
							</view>
							<view class="dm-btn dm-btn-del" @tap="deleteDish(dish)">
								<text>删除</text>
							</view>
						</view>
					</view>
				</view>
				<view class="empty-state" v-else>
					<text class="empty-text">该分类下还没有菜品，去首页「添加菜品」吧~</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import { apiCategoryTree } from '@/api/category.js'
	import { apiDishManageList, apiDishDelete, apiDishChangeStatus } from '@/api/dish.js'
	import { ensureLogin } from '@/utils/login.js'

	export default {
		data() {
			return {
				categories: [], // [{ id, catName }]
				dishes: [],     // 全部菜品（含下架）
				selectedCategoryIndex: 0
			}
		},
		onShow() {
			this.loadData();
		},
		computed: {
			filteredDishes() {
				const cat = this.categories[this.selectedCategoryIndex];
				if (!cat) return this.dishes;
				return this.dishes.filter(d => d.categoryId === cat.id);
			}
		},
		methods: {
			onBackTap() {
				uni.navigateBack();
			},
			onCategoryManageTap() {
				uni.navigateTo({
					url: '/pages/category-manage/category-manage'
				});
			},
			async loadData() {
				try {
					await ensureLogin();
					const [catRes, dishRes] = await Promise.all([
						apiCategoryTree(),
						apiDishManageList({ pageNum: 1, pageSize: 300 })
					]);
					const roots = (catRes && catRes.data) || [];
					this.categories = roots.map(c => ({ id: c.id, catName: c.catName }));
					this.dishes = (dishRes && dishRes.rows) || [];
					if (this.selectedCategoryIndex >= this.categories.length) {
						this.selectedCategoryIndex = 0;
					}
				} catch (e) {}
			},
			selectCategory(index) {
				this.selectedCategoryIndex = index;
			},
			toggleStatus(dish) {
				const next = dish.status === '1' ? '0' : '1';
				ensureLogin()
					.then(() => apiDishChangeStatus(dish.id, next))
					.then(() => {
						dish.status = next;
						uni.showToast({ title: next === '1' ? '已上架' : '已下架', icon: 'none' });
					})
					.catch(() => {});
			},
			deleteDish(dish) {
				uni.showModal({
					title: '提示',
					content: `确定删除「${dish.dishName}」吗？`,
					success: async (res) => {
						if (!res.confirm) return;
						try {
							await ensureLogin();
							await apiDishDelete(dish.id);
							uni.showToast({ title: '删除成功', icon: 'none' });
							this.loadData();
						} catch (e) {}
					}
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
		background-color: #FFFFFF;
		box-sizing: border-box;
	}

	/* Navigation Bar styling */
	.status-bar {
		height: var(--status-bar-height);
		width: 750rpx;
		background-color: #FFFFFF;
		flex-shrink: 0;
	}

	.nav-bar {
		height: 44px;
		width: 750rpx;
		background-color: #FFFFFF;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24rpx;
		box-sizing: border-box;
		border-bottom: 1rpx solid #F5F5F5;
		flex-shrink: 0;
	}

	.back-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.svg-back {
		width: 44rpx;
		height: 44rpx;
	}

	.nav-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	/* Invisible/placeholder capsule matching the home page to keep layout centered */
	.capsule-menu {
		width: 174rpx;
		height: 64rpx;
		opacity: 0; /* hidden in subpages, but occupies space for flex centering */
	}

	/* Sub Header Actions Bar */
	.subheader-bar {
		height: 110rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24rpx;
		box-sizing: border-box;
		border-bottom: 1rpx solid #F5F5F5;
		flex-shrink: 0;
	}

	.category-btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		background-color: #F5F5F5;
		height: 64rpx;
		padding: 0 24rpx;
		border-radius: 32rpx;
		font-size: 26rpx;
		color: #333333;
		font-weight: 500;
	}

	.svg-gear {
		width: 32rpx;
		height: 32rpx;
	}

	.right-actions {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.action-btn {
		height: 64rpx;
		border-radius: 32rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26rpx;
		font-weight: 500;
		box-sizing: border-box;
		padding: 0 28rpx;
	}

	.outline-btn {
		border: 1.5px solid #10B981;
		color: #10B981;
		background-color: #FFFFFF;
	}

	.sort-btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 0 24rpx;
	}

	.svg-sort {
		width: 30rpx;
		height: 30rpx;
	}

	/* Main Split columns area */
	.main-split-area {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	/* Sidebar (Left) */
	.sidebar-left {
		width: 200rpx;
		height: 100%;
		background-color: #F8F9FA;
		border-right: 1rpx solid #EEEEEE;
	}

	.sidebar-item {
		position: relative;
		height: 110rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 20rpx;
		box-sizing: border-box;
		text-align: center;
	}

	.sidebar-text {
		font-size: 28rpx;
		color: #666666;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sidebar-item.active {
		background-color: #FFFFFF;
	}

	.sidebar-item.active .sidebar-text {
		color: #10B981;
		font-weight: bold;
	}

	.active-bar {
		position: absolute;
		left: 0;
		top: 35rpx;
		width: 8rpx;
		height: 40rpx;
		border-radius: 0 4rpx 4rpx 0;
		background-color: #10B981;
	}

	.sidebar-empty {
		padding-top: 40rpx;
		display: flex;
		justify-content: center;
	}

	.sidebar-empty-text {
		font-size: 26rpx;
		color: #BFBFBF;
	}

	/* Dishes list (Right) */
	.dishes-area-right {
		flex: 1;
		height: 100%;
		background-color: #FFFFFF;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 60%;
		padding: 40rpx;
		box-sizing: border-box;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999999;
		text-align: center;
		line-height: 1.6;
	}

	/* 菜品管理列表 */
	.dish-manage-list {
		padding: 16rpx;
	}
	.dish-manage-card {
		display: flex;
		align-items: center;
		background: #FFFFFF;
		border-radius: 20rpx;
		padding: 16rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
	}
	.dm-cover {
		width: 112rpx;
		height: 112rpx;
		border-radius: 16rpx;
		flex-shrink: 0;
		background: #F2F2F2;
	}
	.dm-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0 16rpx;
		min-width: 0;
	}
	.dm-name {
		font-size: 28rpx;
		color: #1A1A1A;
		font-weight: 600;
		margin-bottom: 8rpx;
	}
	.dm-meta {
		font-size: 22rpx;
		color: #9CA3AF;
	}
	.dm-actions {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		flex-shrink: 0;
	}
	.dm-btn {
		padding: 8rpx 20rpx;
		border-radius: 999rpx;
		border: 1rpx solid #10B981;
		font-size: 22rpx;
		color: #10B981;
		text-align: center;
	}
	.dm-btn-del {
		border-color: #F87171;
		color: #F87171;
	}
</style>
