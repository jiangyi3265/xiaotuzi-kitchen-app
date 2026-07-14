<template>
	<view class="page-container">
		<!-- Top Banner Photo & Overlays -->
		<view class="cover-image-container">
			<image class="cover-img" :src="dish.cover" mode="aspectFill"></image>
			
			<!-- Overlay Controls -->
			<view class="cover-nav-bar">
				<view class="back-circle" @tap="onBackTap">
					<!-- Custom back arrow -->
					<image class="svg-back-white" src="/static/arrow_left.svg" mode="aspectFit"></image>
				</view>
				
				<!-- 举报无后端支撑，暂隐藏 -->
				<view class="nav-right-actions" v-if="false">
					<view class="report-badge">
						<text>举报</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 菜品不存在 -->
		<view class="dish-notfound" v-if="notFound">
			<text class="dish-notfound-text">菜品不存在</text>
		</view>

		<!-- Main Info Sheet (Sliding over image) -->
		<view class="info-sheet-card" v-if="!notFound">
			<!-- Author Profile Section -->
			<view class="author-row" @tap="onViewKitchenTap">
				<view class="author-left">
					<image class="author-avatar" src="/static/kitchen_avatar.png" mode="aspectFill"></image>
					<text class="author-name">{{ dish.kitchenName }}</text>
					<image class="chevron-right" src="/static/arrow_left.svg" mode="aspectFit"></image>
				</view>
				<view class="view-kitchen-btn">
					<text>查看厨房</text>
				</view>
			</view>

			<!-- Dish Main Metadata -->
			<view class="dish-title-row">
				<text class="dish-title">{{ dish.name }}</text>
			</view>

			<view class="rating-stars-row">
				<view class="stars-list">
					<span class="star-icon gray" v-for="i in 5" :key="i">★</span>
				</view>
				<view class="difficulty-details">
					<text>时长: {{ dish.durationText }}</text>
					<text class="divider">|</text>
					<text>难度: {{ dish.difficulty }}</text>
				</view>
			</view>

			<!-- Description -->
			<view class="dish-description">
				<text>{{ dish.desc }}</text>
			</view>

			<view class="ingredients-section">
				<view class="section-title-row">
					<text class="section-title">所用用料</text>
					<text class="section-subtitle">后台配置</text>
				</view>

				<view class="ingredients-list" v-if="backendIngredients.length">
					<view class="ingredient-item" v-for="(item, index) in backendIngredients" :key="index">
						<text class="ingredient-index">{{ index + 1 }}</text>
						<text class="ingredient-text">{{ item }}</text>
					</view>
				</view>
				<view class="media-empty-state compact" v-else>
					<image class="media-empty-icon" src="/static/empty_clipboard.svg" mode="aspectFit"></image>
					<text class="media-empty-text">未添加用料</text>
				</view>
			</view>

			<view class="dish-tip-section" v-if="dish.cookingExp">
				<text class="dish-tip-title">制作要点</text>
				<text class="dish-tip-text">{{ dish.cookingExp }}</text>
			</view>

			<view class="steps-section">
				<view class="section-title-row">
					<text class="section-title">制作步骤</text>
					<text class="section-subtitle">图文步骤</text>
				</view>

				<view class="backend-media-grid" v-if="backendSteps.length">
					<view class="backend-media-card step-card" v-for="item in backendSteps" :key="item.id">
						<image class="backend-media-img" v-if="item.image" :src="item.image" mode="aspectFill"></image>
						<view class="backend-media-copy">
							<text class="backend-media-title">{{ item.title }}</text>
							<text class="backend-media-text">{{ item.text }}</text>
						</view>
					</view>
				</view>
				<view class="media-empty-state" v-else>
					<image class="media-empty-icon" src="/static/empty_clipboard.svg" mode="aspectFit"></image>
					<text class="media-empty-text">未添加步骤</text>
				</view>
			</view>
		</view>

		<!-- Bottom Fixed Action Bar -->
		<view class="bottom-actions-bar" v-if="!notFound">
			<view class="btn-steal-full" :class="{ disabled: addingToCart }" @tap="addToCart">
				<image class="action-icon" src="/static/cart.svg" mode="aspectFit"></image>
				<text>{{ addingToCart ? '正在添加...' : '添加到购物车' }}</text>
			</view>
		</view>

		<!-- Backdrop Overlay for modals/drawers -->
		<view class="modal-backdrop" v-if="showStealModal || showCategoryDrawer" @tap="onBackdropTap"></view>

		<!-- Modal 1: 偷菜 Confirmation Dialog -->
		<view class="steal-dialog-container" v-if="showStealModal">
			<view class="steal-card">
				<text class="dialog-title">偷菜</text>
				
				<image class="dialog-img-preview" :src="stealSource.image" mode="aspectFill"></image>
				<text class="dialog-dish-name">{{ stealSource.name }}</text>
				
				<view class="category-selector-row" @tap="openCategoryDrawer">
					<text class="selector-label">选择分类</text>
					<view class="selector-value-box">
						<text class="selected-name">{{ selectedCategory }}</text>
						<image class="chevron-down" src="/static/arrow_left.svg" mode="aspectFit"></image>
					</view>
				</view>
				
				<view class="btn-confirm-steal" @tap="confirmStealDish">
					<text>{{ stealing ? '正在保存...' : '确认偷菜' }}</text>
				</view>
			</view>
		</view>

		<!-- Bottom Drawer: 选择分类 Selection Sheet -->
		<view class="category-drawer-panel" :class="{ open: showCategoryDrawer }">
			<view class="drawer-header">
				<text class="drawer-title">选择分类</text>
				<view class="drawer-close-bar"></view>
			</view>
			
			<scroll-view class="drawer-categories-scroll" scroll-y>
				<view class="categories-container-list">
					<view 
						class="category-option-item" 
						:class="{ active: selectedCategory === item }"
						v-for="(item, index) in categories" 
						:key="index"
						@tap="selectCategory(item)"
					>
						<text class="option-text">{{ item }}</text>
					</view>
				</view>
			</scroll-view>
			
			<view class="btn-create-category" @tap="createCategoryPrompt">
				<text>创建分类</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { apiDishDetail, apiDishAdd } from '@/api/dish.js'
	import { apiCategoryTree, apiCategoryAdd } from '@/api/category.js'
	import { ensureLogin } from '@/utils/login.js'

	export default {
		data() {
			return {
				showStealModal: false,
				showCategoryDrawer: false,
				selectedCategory: '默认分类',
				categoryMap: {},
				stealing: false,
				addingToCart: false,
				categories: ['默认分类'],
				// 菜品不存在（无 id 或加载失败）
				notFound: false,
				// 菜品主体信息（空占位，靠 loadDetail(id) 从后端填充）
				dish: {
					name: '',
					cover: '',
					desc: '',
					difficulty: '未设置',
					durationText: '未设置',
					cookingExp: '',
					kitchenName: '我的厨房'
				},
				// 偷菜时写入本地厨房的数据源（后端加载后覆盖）
				stealSource: {
					id: null,
					name: '',
					image: '',
					desc: ''
				},
				// 用料和制作步骤：由后端菜品详情下发，前端只读展示。
				backendIngredients: [],
				backendSteps: []
			}
		},
		onLoad(options) {
			this.loadCategories();
			if (options && options.id && /^\d+$/.test(String(options.id))) {
				this.loadDetail(options.id);
			} else {
				this.notFound = true;
			}
		},
		methods: {
			addToCart() {
				if (this.addingToCart) return;
				const dishId = Number(this.stealSource && this.stealSource.id);
				if (!Number.isFinite(dishId) || dishId <= 0) {
					uni.showToast({ title: '菜品信息缺失', icon: 'none' });
					return;
				}
				this.addingToCart = true;
				try {
					const cachedIds = uni.getStorageSync('selectedDishIds');
					const ids = Array.isArray(cachedIds) ? cachedIds.slice() : [];
					const quantities = uni.getStorageSync('selectedDishQuantities') || {};
					const existingIndex = ids.findIndex(id => String(id) === String(dishId));
					const key = String(dishId);
					if (existingIndex < 0) {
						ids.push(dishId);
						quantities[key] = 1;
					} else {
						quantities[key] = Math.min(99, Math.max(1, Number(quantities[key] || 1)) + 1);
					}
					uni.setStorageSync('selectedDishIds', ids);
					uni.setStorageSync('selectedDishQuantities', quantities);
					uni.showToast({ title: existingIndex < 0 ? '已添加到购物车' : '购物车数量已增加', icon: 'success', duration: 900 });
					setTimeout(() => uni.navigateBack(), 700);
				} finally {
					setTimeout(() => { this.addingToCart = false; }, 800);
				}
			},
			async loadDetail(id) {
				try {
					const res = await apiDishDetail(id);
					const d = res && res.data;
					if (!d) {
						this.notFound = true;
						return;
					}
					const total = (d.prepTime || 0) + (d.cookTime || 0);
					this.dish = {
						name: d.dishName || '',
						cover: d.cover || '',
						desc: d.story || '',
						difficulty: d.difficulty || '未设置',
						durationText: total ? total + '分钟' : '未设置',
						cookingExp: d.cookingExp || '',
						kitchenName: this.dish.kitchenName
					};
					this.stealSource = {
						id: d.id,
						name: d.dishName,
						image: d.cover || '',
						desc: d.story || ''
					};
					this.backendSteps = (d.steps || []).map(s => ({
						id: s.id,
						title: '步骤 ' + (s.stepNo || ''),
						image: s.image,
						text: s.content
					}));
					this.backendIngredients = this.normalizeIngredients(d.ingredients || '');
				} catch (e) {
					this.notFound = true;
				}
			},
			normalizeIngredients(text) {
				return String(text || '')
					.split(/[\n\r,，、;；]+/)
					.map(item => item.trim())
					.filter(Boolean);
			},
			onViewKitchenTap() {
				uni.navigateTo({
					url: '/pages/kitchen-detail/kitchen-detail'
				});
			},
			onBackTap() {
				uni.navigateBack();
			},
			async loadCategories() {
				// 偷菜分类选择：优先用后端真实分类名，失败回退本地
				try {
					const res = await apiCategoryTree();
					const roots = (res && res.data) || [];
					if (roots.length) {
						const map = {};
						this.categories = roots.map(c => {
							map[c.catName] = c.id;
							return c.catName;
						});
						this.categoryMap = map;
						if (!this.categories.includes(this.selectedCategory)) {
							this.selectedCategory = this.categories[0];
						}
						return;
					}
				} catch (e) {}
				const list = uni.getStorageSync('categories') || [];
				this.categories = ['默认分类', ...list.filter(c => c !== '默认分类')];
				this.categoryMap = {};
			},
			openStealModal() {
				this.showStealModal = true;
			},
			closeStealModal() {
				this.showStealModal = false;
			},
			openCategoryDrawer() {
				this.showStealModal = false; // Hide modal when drawer opens
				this.showCategoryDrawer = true;
			},
			closeCategoryDrawer() {
				this.showCategoryDrawer = false;
				this.showStealModal = true; // Show modal back when drawer closes
			},
			onBackdropTap() {
				if (this.showCategoryDrawer) {
					this.closeCategoryDrawer();
				} else if (this.showStealModal) {
					this.closeStealModal();
				}
			},
			selectCategory(category) {
				this.selectedCategory = category;
				this.showCategoryDrawer = false;
				this.showStealModal = true; // Return to confirmation modal
			},
			createCategoryPrompt() {
				uni.showModal({
					title: '创建分类',
					placeholderText: '请输入分类名称',
					editable: true,
					success: async (res) => {
						if (!res.confirm || !res.content.trim()) return;
						const name = res.content.trim();
						try {
							await ensureLogin();
							await apiCategoryAdd({ catName: name });
							await this.loadCategories();
							this.selectedCategory = name;
						} catch (e) {
							const list = uni.getStorageSync('categories') || [];
							if (!list.includes(name)) {
								list.push(name);
								uni.setStorageSync('categories', list);
								this.categories = ['默认分类', ...list.filter(c => c !== '默认分类')];
							}
							this.selectedCategory = name;
						}
						this.showCategoryDrawer = false;
						this.showStealModal = true;
					}
				});
			},
			async ensureSelectedCategoryId() {
				const exists = this.categoryMap[this.selectedCategory];
				if (exists != null) return exists;
				await ensureLogin();
				await apiCategoryAdd({ catName: this.selectedCategory || '默认分类' });
				await this.loadCategories();
				return this.categoryMap[this.selectedCategory] || null;
			},
			async confirmStealDish() {
				if (this.stealing) return;
				if (!this.stealSource || !this.stealSource.name) {
					uni.showToast({ title: '菜品信息缺失', icon: 'none' });
					return;
				}
				this.stealing = true;
				try {
					const categoryId = await this.ensureSelectedCategoryId();
					if (categoryId == null) {
						uni.showToast({ title: '请先选择或创建分类', icon: 'none' });
						return;
					}
					await apiDishAdd({
						dishName: this.stealSource.name,
						cover: this.stealSource.image || '/static/onion_chicken.png',
						categoryId,
						story: this.stealSource.desc || '',
						ingredients: this.backendIngredients.join('\n'),
						status: '1',
						recipeOpen: this.backendSteps.length ? '1' : '0',
						steps: this.backendSteps.map((step, index) => ({
							stepNo: index + 1,
							image: step.image || '',
							content: step.text || '',
							timer: 0
						}))
					});
					uni.showToast({
						title: '已加入我的厨房',
						icon: 'success',
						duration: 1200
					});
					this.closeStealModal();
					setTimeout(() => {
						uni.navigateBack({ delta: 2 });
					}, 1200);
				} catch (e) {
					// 请求层已经提示错误
				} finally {
					this.stealing = false;
				}
			}
		}
	}
</script>

<style>
	.page-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #FAFAFA;
		padding-bottom: 160rpx; /* safe bottom actions bar overlap */
		box-sizing: border-box;
	}

	/* Top Cover Photo Banner */
	.cover-image-container {
		position: relative;
		width: 750rpx;
		height: 520rpx;
	}

	.cover-img {
		width: 750rpx;
		height: 520rpx;
		background-color: #F0F0F0;
	}

	.cover-nav-bar {
		position: absolute;
		top: var(--status-bar-height);
		left: 0;
		width: 750rpx;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24rpx;
		box-sizing: border-box;
		z-index: 10;
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
		filter: brightness(0) invert(1); /* makes arrow white */
	}

	.nav-right-actions {
		display: flex;
		align-items: center;
	}

	.report-badge {
		background-color: rgba(0, 0, 0, 0.4);
		border-radius: 20rpx;
		padding: 4rpx 16rpx;
		font-size: 20rpx;
		color: #FFFFFF;
		font-weight: 500;
	}

	/* Main Info Sheet (sliding over photo) */
	.info-sheet-card {
		position: relative;
		z-index: 5;
		margin-top: -40rpx;
		background-color: #FFFFFF;
		border-radius: 36rpx 36rpx 0 0;
		padding: 40rpx 28rpx;
		box-sizing: border-box;
	}

	/* Author profile row */
	.author-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1rpx solid #F5F5F5;
		padding-bottom: 30rpx;
		margin-bottom: 30rpx;
	}

	.author-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.author-avatar {
		width: 56rpx;
		height: 56rpx;
		border-radius: 50%;
		background-color: #F0F0F0;
	}

	.author-name {
		font-size: 28rpx;
		color: #333333;
		font-weight: bold;
	}

	.chevron-right {
		width: 24rpx;
		height: 24rpx;
		transform: rotate(180deg);
		opacity: 0.3;
	}

	.view-kitchen-btn {
		background-color: #F5F5F5;
		color: #666666;
		font-size: 22rpx;
		padding: 6rpx 20rpx;
		border-radius: 20rpx;
		font-weight: 500;
	}

	/* Dish Info */
	.dish-title-row {
		margin-bottom: 20rpx;
	}

	.dish-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.rating-stars-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 30rpx;
	}

	.stars-list {
		display: flex;
		gap: 4rpx;
	}

	.star-icon {
		font-size: 36rpx;
	}

	.star-icon.gray {
		color: #E2E2E2;
	}

	.difficulty-details {
		display: flex;
		align-items: center;
		gap: 12rpx;
		font-size: 24rpx;
		color: #8C8C8C;
	}

	.difficulty-details .divider {
		color: #E2E2E2;
	}

	/* Description */
	.dish-description {
		font-size: 28rpx;
		color: #666666;
		line-height: 1.6;
		margin-bottom: 48rpx;
	}

	/* Ingredients card */
	.ingredients-section {
		display: flex;
		flex-direction: column;
		gap: 18rpx;
		margin-bottom: 44rpx;
	}

	.ingredients-list {
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}

	.ingredient-item {
		min-height: 64rpx;
		padding: 16rpx 18rpx;
		display: flex;
		align-items: flex-start;
		border-radius: 18rpx;
		background: #f7fbf9;
		box-sizing: border-box;
	}

	.ingredient-index {
		width: 34rpx;
		height: 34rpx;
		margin-right: 14rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #35cda4;
		color: #fbfefd;
		font-size: 20rpx;
		line-height: 34rpx;
		font-weight: 900;
		flex-shrink: 0;
	}

	.ingredient-text {
		font-size: 27rpx;
		line-height: 1.45;
		font-weight: 700;
		color: #39423f;
	}

	.dish-tip-section {
		margin-bottom: 44rpx;
		padding: 22rpx 24rpx;
		border-radius: 20rpx;
		background: #f7fbf9;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		box-sizing: border-box;
	}

	.dish-tip-title {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: #1f2926;
	}

	.dish-tip-text {
		font-size: 26rpx;
		line-height: 1.55;
		color: #66716d;
		font-weight: 650;
	}

	.steps-section {
		display: flex;
		flex-direction: column;
		gap: 18rpx;
		margin-bottom: 24rpx;
	}

	.section-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.section-subtitle {
		font-size: 22rpx;
		line-height: 1;
		font-weight: 700;
		color: #35cda4;
	}

	.backend-media-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 18rpx;
	}

	.backend-media-card {
		min-height: 250rpx;
		border-radius: 22rpx;
		background: #FAFAFA;
		box-shadow: 0 8rpx 22rpx rgba(28, 45, 40, 0.025);
		overflow: hidden;
		box-sizing: border-box;
	}

	.backend-media-img {
		width: 100%;
		height: 156rpx;
		background: #F0F0F0;
		display: block;
	}

	.backend-media-copy {
		padding: 18rpx 18rpx 20rpx;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		box-sizing: border-box;
	}

	.backend-media-title {
		font-size: 27rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.backend-media-text {
		font-size: 22rpx;
		line-height: 1.35;
		font-weight: 700;
		color: #8C8C8C;
	}

	.step-card {
		min-height: 286rpx;
	}

	/* Read-only empty states for backend-sourced sections (用料/步骤) */
	.media-empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 220rpx;
		padding: 40rpx 0;
		gap: 18rpx;
		background: #FAFAFA;
		border-radius: 22rpx;
		box-sizing: border-box;
	}

	.media-empty-state.compact {
		min-height: 156rpx;
	}

	.media-empty-icon {
		width: 72rpx;
		height: 72rpx;
		opacity: 0.18;
	}

	.media-empty-text {
		font-size: 26rpx;
		color: #C0C4CC;
		font-weight: 500;
	}

	/* Fixed Bottom Action Bar */
	.bottom-actions-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 750rpx;
		height: 120rpx;
		background-color: #FFFFFF;
		border-top: 1rpx solid #EEEEEE;
		display: flex;
		align-items: center;
		padding: 0 24rpx;
		padding-bottom: env(safe-area-inset-bottom);
		box-sizing: border-box;
		z-index: 100;
	}

	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 140rpx;
		color: #333333;
	}

	.action-icon {
		width: 44rpx;
		height: 44rpx;
	}

	.action-label {
		font-size: 20rpx;
		margin-top: 6rpx;
		font-weight: 500;
	}

	.btn-share-friends {
		flex: 1;
		background-color: #FFFFFF;
		border: 2rpx solid #10B981;
		color: #10B981;
		height: 80rpx;
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: bold;
		gap: 12rpx;
		margin-left: 20rpx;
	}

	.svg-share {
		width: 32rpx;
		height: 32rpx;
	}

	.btn-steal-full {
		flex: 1;
		background-color: #35cda4;
		color: #f8fffc;
		height: 80rpx;
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: bold;
		gap: 12rpx;
	}

	.btn-steal-full.disabled {
		opacity: .58;
		pointer-events: none;
	}

	.btn-steal-full .action-icon {
		width: 36rpx;
		height: 36rpx;
	}

	/* 菜品不存在占位 */
	.dish-notfound {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 160rpx 0;
	}

	.dish-notfound-text {
		font-size: 30rpx;
		color: #8C8C8C;
		font-weight: 500;
	}

	/* Overlay dialog & drawer styles */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.55);
		z-index: 1100;
		animation: fadeIn 0.25s ease;
	}

	.steal-dialog-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1105;
	}

	.steal-card {
		width: 600rpx;
		background-color: #FFFFFF;
		border-radius: 36rpx;
		padding: 44rpx 40rpx;
		box-sizing: border-box;
		box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.15);
		animation: dialogPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.dialog-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #1A1A1A;
		margin-bottom: 30rpx;
	}

	.dialog-img-preview {
		width: 480rpx;
		height: 320rpx;
		border-radius: 20rpx;
		background-color: #F0F0F0;
		margin-bottom: 24rpx;
	}

	.dialog-dish-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #1A1A1A;
		margin-bottom: 36rpx;
	}

	.category-selector-row {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 48rpx;
	}

	.selector-label {
		font-size: 26rpx;
		color: #8C8C8C;
		font-weight: 500;
	}

	.selector-value-box {
		display: flex;
		align-items: center;
		gap: 12rpx;
		background-color: #F7F7F7;
		padding: 12rpx 28rpx;
		border-radius: 16rpx;
		border: 1rpx solid #EAEAEA;
		min-width: 220rpx;
		justify-content: space-between;
	}

	.selected-name {
		font-size: 26rpx;
		color: #333333;
		font-weight: bold;
	}

	.chevron-down {
		width: 24rpx;
		height: 24rpx;
		transform: rotate(270deg); /* points right/down-ish */
		opacity: 0.4;
	}

	.btn-confirm-steal {
		width: 100%;
		height: 84rpx;
		background-color: #10B981;
		color: #FFFFFF;
		border-radius: 42rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: bold;
		box-shadow: 0 6rpx 16rpx rgba(16, 185, 129, 0.2);
	}

	/* Category drawer panel */
	.category-drawer-panel {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 750rpx;
		background-color: #FFFFFF;
		border-radius: 40rpx 40rpx 0 0;
		padding: 30rpx 40rpx 50rpx 40rpx;
		box-sizing: border-box;
		z-index: 1205;
		transform: translateY(100%);
		transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
		box-shadow: 0 -8rpx 36rpx rgba(0,0,0,0.08);
	}

	.category-drawer-panel.open {
		transform: translateY(0);
	}

	.drawer-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		margin-bottom: 30rpx;
	}

	.drawer-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.drawer-close-bar {
		width: 70rpx;
		height: 8rpx;
		border-radius: 4rpx;
		background-color: #E2E2E2;
		position: absolute;
		top: -10rpx;
	}

	.drawer-categories-scroll {
		max-height: 400rpx;
		width: 100%;
	}

	.categories-container-list {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		padding: 10rpx 0;
	}

	.category-option-item {
		background-color: #F5F5F5;
		border: 1rpx solid #EAEAEA;
		border-radius: 16rpx;
		padding: 14rpx 36rpx;
		box-sizing: border-box;
	}

	.category-option-item.active {
		border-color: #10B981;
		background-color: #E6FBF7;
	}

	.category-option-item.active .option-text {
		color: #10B981;
		font-weight: bold;
	}

	.option-text {
		font-size: 26rpx;
		color: #666666;
	}

	.btn-create-category {
		width: 100%;
		height: 84rpx;
		border: 2rpx solid #10B981;
		color: #10B981;
		border-radius: 42rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 36rpx;
		font-size: 28rpx;
		font-weight: bold;
		background-color: #FFFFFF;
	}
</style>
