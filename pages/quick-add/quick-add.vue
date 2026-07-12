<template>
	<view class="page-container">
		<!-- Custom Navigation Bar -->
		<view class="status-bar"></view>
		<view class="nav-bar">
			<view class="back-btn" @tap="onBackTap">
				<image class="svg-back" src="/static/back_green.svg" mode="aspectFit"></image>
			</view>
			<view class="nav-title">
				<text>快速添加菜品</text>
			</view>
			<!-- Capsule spacer -->
			<view class="capsule-spacer"></view>
		</view>

		<!-- Main Form Content Area -->
		<view class="form-content-area">
			<view class="form-card">
				<!-- Cover Image Upload Box -->
				<view class="cover-upload-box" @tap="onUploadCoverTap">
					<image class="cover-preview" :src="coverImage" mode="aspectFill" v-if="coverImage"></image>
					<view class="upload-placeholder" v-else>
						<!-- Green Camera SVG Icon -->
						<svg class="svg-camera" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#10B981" stroke-width="2" stroke-linejoin="round"/>
							<circle cx="12" cy="13" r="4" stroke="#10B981" stroke-width="2"/>
						</svg>
						<text class="upload-title">点击上传封面图</text>
						<text class="upload-subtitle">清晰美观的图片让菜品更有吸引力</text>
					</view>
				</view>

				<!-- Search Cover Bar -->
				<view class="search-cover-bar" @tap="onSearchCoverTap">
					<view class="search-left">
						<!-- Green search icon -->
						<svg class="svg-search-green" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="11" cy="11" r="7" stroke="#10B981" stroke-width="2"/>
							<path d="M20 20L16 16" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
						</svg>
						<view class="search-text-info">
							<text class="search-title">搜索封面图</text>
							<text class="search-subtitle">从已有分享的菜品库中快速选择</text>
						</view>
					</view>
					
					<view class="has-cover-pill">
						<text>已有封面</text>
						<image class="chevron-right" src="/static/arrow_left.svg" mode="aspectFit"></image>
					</view>
				</view>

				<!-- Dish Name Input Row -->
				<view class="input-group">
					<input 
						class="dish-name-input" 
						type="text" 
						placeholder="输入菜品名称（必填）" 
						placeholder-style="color: #BFBFBF"
						v-model="dishName"
					/>
				</view>

				<!-- Category Selector Row -->
				<view class="form-row border-top" @tap="openCategoryDrawer">
					<text class="row-label">所属分类</text>
					<view class="row-value-box">
						<text class="selected-category-text">{{ selectedCategory }}</text>
						<image class="chevron-right-gray" src="/static/arrow_left.svg" mode="aspectFit"></image>
					</view>
				</view>

				<!-- Share Switcher Row -->
				<view class="form-row border-top">
					<view class="label-with-icon">
						<text class="row-label">分享到烟火食记</text>
						<image class="svg-info-circle" src="/static/question_circle.svg" mode="aspectFit" @tap="showShareHelp"></image>
					</view>
					<switch :checked="shareToExplore" color="#10B981" @change="toggleShare" />
				</view>
			</view>
		</view>

		<!-- Bottom Solid Action Button -->
		<view class="bottom-action-wrapper">
			<view class="btn-publish-dish" @tap="publishDish">
				<text>发布菜品</text>
			</view>
		</view>

		<!-- Bottom Drawer Sheet for Category Selection -->
		<view class="drawer-backdrop" v-if="showCategoryDrawer" @tap="closeCategoryDrawer"></view>
		<view class="category-drawer-panel" :class="{ open: showCategoryDrawer }">
			<view class="drawer-header">
				<text class="drawer-title">选择分类</text>
				<view class="drawer-close-bar"></view>
			</view>
			
			<scroll-view class="drawer-categories-scroll" scroll-y>
				<view class="categories-container-list">
					<view
						class="category-option-item"
						:class="{ active: selectedCategoryId === item.id }"
						v-for="(item, index) in categories"
						:key="index"
						@tap="selectCategory(item)"
					>
						<text class="option-text">{{ item.catName }}</text>
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
	import { apiCategoryTree, apiCategoryAdd } from '@/api/category.js'
	import { apiDishAdd, apiDishList } from '@/api/dish.js'
	import { apiSharePublish } from '@/api/share.js'
	import { ensureLogin } from '@/utils/login.js'
	import { uploadFile } from '@/utils/request.js'

	export default {
		data() {
			return {
				dishName: '',
				coverImage: '', // 后端图片 URL 或 /static 路径
				selectedCategory: '',
				selectedCategoryId: null,
				categories: [], // [{ id, catName }]
				shareToExplore: true,
				showCategoryDrawer: false
			}
		},
		onLoad() {
			this.loadCategories();
		},
		methods: {
			onBackTap() {
				uni.navigateBack();
			},
			async loadCategories() {
				try {
					const res = await apiCategoryTree();
					const roots = (res && res.data) || [];
					this.categories = roots.map(c => ({ id: c.id, catName: c.catName }));
				} catch (e) {
					this.categories = [];
				}
				if (this.categories.length && this.selectedCategoryId == null) {
					this.selectedCategory = this.categories[0].catName;
					this.selectedCategoryId = this.categories[0].id;
				}
			},
			onUploadCoverTap() {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						const path = res.tempFilePaths && res.tempFilePaths[0];
						if (!path) return;
						uploadFile(path).then((up) => {
							this.coverImage = up.url;
							uni.showToast({ title: '封面图已上传', icon: 'success' });
						}).catch(() => {});
					}
				});
			},
			async onSearchCoverTap() {
				try {
					const res = await apiDishList({ pageNum: 1, pageSize: 50 });
					const rows = ((res && res.rows) || []).filter(item => item.cover);
					if (!rows.length) {
						uni.showToast({ title: '暂无可复用封面，请上传图片', icon: 'none' });
						return;
					}
					uni.showActionSheet({
						itemList: rows.slice(0, 6).map(item => item.dishName || '菜品封面'),
						success: (sheet) => {
							const picked = rows[sheet.tapIndex];
							if (picked && picked.cover) {
								this.coverImage = picked.cover;
							}
						}
					});
				} catch (e) {}
			},
			openCategoryDrawer() {
				this.showCategoryDrawer = true;
			},
			closeCategoryDrawer() {
				this.showCategoryDrawer = false;
			},
			selectCategory(category) {
				this.selectedCategory = category.catName;
				this.selectedCategoryId = category.id;
				this.closeCategoryDrawer();
			},
			toggleShare(e) {
				this.shareToExplore = e.detail.value;
			},
			showShareHelp() {
				uni.showModal({
					title: '分享说明',
					content: '开启后，您的菜品会被推荐至“烟火食记”公共菜谱中，供广大厨神交流学习。',
					showCancel: false
				});
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
							const created = this.categories.find(c => c.catName === name);
							if (created) {
								this.selectedCategory = created.catName;
								this.selectedCategoryId = created.id;
							}
							this.closeCategoryDrawer();
						} catch (e) {}
					}
				});
			},
			async publishDish() {
				const trimmedName = this.dishName.trim();
				if (!trimmedName) {
					uni.showToast({ title: '请输入菜品名称', icon: 'none' });
					return;
				}
				if (this.selectedCategoryId == null) {
					uni.showToast({ title: '请先选择或创建分类', icon: 'none' });
					return;
				}
				try {
					await ensureLogin();
					await apiDishAdd({
						dishName: trimmedName,
						cover: this.coverImage || '/static/onion_chicken.png',
						categoryId: this.selectedCategoryId,
						status: '1',
						recipeOpen: '1',
						remark: this.shareToExplore ? '' : '不分享到烟火食记'
					});
					if (this.shareToExplore) {
						try {
							await apiSharePublish({
								title: trimmedName,
								content: `新添加菜品：${trimmedName}`,
								images: this.coverImage || '/static/onion_chicken.png',
								tags: this.selectedCategory || ''
							});
						} catch (e) {}
					}
					uni.showToast({ title: '发布成功！', icon: 'success', duration: 1000 });
					setTimeout(() => uni.navigateBack(), 1000);
				} catch (e) {}
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
		position: relative;
	}

	/* Navigation Header styling */
	.status-bar {
		height: var(--status-bar-height);
		width: 750rpx;
		flex-shrink: 0;
	}

	.nav-bar {
		height: 44px;
		width: 750rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24rpx;
		box-sizing: border-box;
		flex-shrink: 0;
	}

	.back-btn {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background-color: #FFFFFF;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.03);
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

	.capsule-spacer {
		width: 64rpx; /* balanced space */
	}

	/* Form content area styles */
	.form-content-area {
		padding: 24rpx;
		box-sizing: border-box;
		flex: 1;
		width: 750rpx;
	}

	.form-card {
		background-color: #FFFFFF;
		border-radius: 36rpx;
		padding: 40rpx 30rpx;
		box-sizing: border-box;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
		display: flex;
		flex-direction: column;
	}

	/* Cover upload dotted box */
	.cover-upload-box {
		width: 100%;
		height: 380rpx;
		border: 2rpx dashed #10B981;
		border-radius: 28rpx;
		background-color: #FBFBFB;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		box-sizing: border-box;
		margin-bottom: 24rpx;
	}

	.cover-preview {
		width: 100%;
		height: 100%;
	}

	.upload-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
		text-align: center;
		padding: 0 40rpx;
	}

	.svg-camera {
		width: 60rpx;
		height: 60rpx;
	}

	.upload-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #10B981;
	}

	.upload-subtitle {
		font-size: 22rpx;
		color: #8C8C8C;
		line-height: 1.3;
	}

	/* Search cover bar */
	.search-cover-bar {
		background-color: #FFFFFF;
		border: 1rpx solid #EAEAEA;
		border-radius: 20rpx;
		height: 110rpx;
		padding: 0 24rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		margin-bottom: 40rpx;
	}

	.search-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.svg-search-green {
		width: 38rpx;
		height: 38rpx;
		opacity: 0.85;
	}

	.search-text-info {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.search-title {
		font-size: 26rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.search-subtitle {
		font-size: 20rpx;
		color: #8C8C8C;
	}

	.has-cover-pill {
		background-color: #E6FBF7;
		color: #10B981;
		font-size: 22rpx;
		font-weight: bold;
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		gap: 6rpx;
	}

	.chevron-right {
		width: 20rpx;
		height: 20rpx;
		transform: rotate(180deg); /* points right */
		filter: invert(53%) sepia(87%) saturate(382%) hue-rotate(113deg) brightness(91%) contrast(85%); /* matches green */
	}

	/* Name Input Box */
	.input-group {
		margin-bottom: 24rpx;
	}

	.dish-name-input {
		width: 100%;
		height: 84rpx;
		background-color: #FFFFFF;
		font-size: 30rpx;
		color: #333333;
		border: none;
		border-bottom: 1rpx solid #EEEEEE;
		padding: 0 10rpx;
		box-sizing: border-box;
	}

	/* Form rows details */
	.form-row {
		height: 110rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
	}

	.form-row.border-top {
		border-top: 1rpx solid #F5F5F5;
	}

	.row-label {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
	}

	.label-with-icon {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.svg-info-circle {
		width: 32rpx;
		height: 32rpx;
		opacity: 0.45;
	}

	.row-value-box {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.selected-category-text {
		font-size: 28rpx;
		color: #1A1A1A;
		font-weight: bold;
	}

	.chevron-right-gray {
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
		padding: 30rpx 24rpx 50rpx 24rpx;
		box-sizing: border-box;
		background: linear-gradient(180deg, rgba(250,250,250,0) 0%, rgba(250,250,250,1) 30%);
		z-index: 10;
	}

	.btn-publish-dish {
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

	/* Bottom Category Drawer Sheet */
	.drawer-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1200;
		animation: fadeIn 0.25s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

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
