<template>
	<view class="page-container">
		<!-- Custom Navigation Bar -->
		<view class="status-bar"></view>
		<view class="nav-bar">
			<view class="back-btn" @tap="onBackTap">
				<image class="svg-back" src="/static/back_green.svg" mode="aspectFit"></image>
			</view>
			<view class="nav-title">
				<text>分类管理</text>
			</view>
			<!-- Invisible Capsule menu spacer -->
			<view class="capsule-menu"></view>
		</view>

		<!-- Categories List Area -->
		<scroll-view class="categories-list-scroll" scroll-y>
			<!-- If categories list is empty -->
			<view class="empty-state" v-if="categories.length === 0">
				<image class="empty-rabbit" src="/static/empty_box_rabbit.png" mode="aspectFit"></image>
				<text class="empty-text">分类整理菜品，管理条理分明，用着更省心</text>
			</view>

			<!-- Categories List -->
			<view class="categories-list-container" v-else>
				<view class="category-card" v-for="(item, index) in categories" :key="index">
					<view class="card-left">
						<text class="category-name">{{ item.catName }}</text>
					</view>
					<view class="card-right">
						<view class="sort-pill" @tap="onSortItemTap(index)">
							<text>排序</text>
						</view>
						<view class="action-icon-btn btn-edit" @tap="openEditDialog(index)">
							<image class="svg-action" src="/static/edit_blue.svg" mode="aspectFit"></image>
						</view>
						<view class="action-icon-btn btn-delete" @tap="deleteCategory(index)">
							<image class="svg-action" src="/static/delete_red.svg" mode="aspectFit"></image>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- Bottom Solid Action Button -->
		<view class="bottom-action-wrapper">
			<view class="btn-add-category" @tap="openAddDialog">
				<text>添加分类</text>
			</view>
		</view>

		<!-- Add/Edit Category Modal Dialogue -->
		<view class="modal-backdrop" v-if="showModal" @tap="closeModal"></view>
		<view class="modal-dialog-container" v-if="showModal">
			<view class="modal-card">
				<view class="modal-title">
					<text>{{ isEditing ? '编辑分类' : '添加分类' }}</text>
				</view>
				<view class="modal-input-wrapper">
					<input 
						class="modal-input" 
						type="text" 
						placeholder="请输入分类名称" 
						placeholder-style="color: #BFBFBF"
						v-model="categoryInput" 
						focus
					/>
				</view>
				<view class="modal-buttons-row">
					<view class="modal-btn btn-cancel" @tap="closeModal">
						<text>取消</text>
					</view>
					<view class="modal-btn btn-confirm" @tap="confirmSaveCategory">
						<text>确定</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { apiCategoryManageList, apiCategoryAdd, apiCategoryUpdate, apiCategoryDelete } from '@/api/category.js'
	import { ensureLogin } from '@/utils/login.js'

	export default {
		data() {
			return {
				categories: [], // [{ id, catName, orderNum }]
				showModal: false,
				isEditing: false,
				editIndex: -1,
				editId: null,
				categoryInput: ''
			}
		},
		onShow() {
			this.loadCategories();
		},
		methods: {
			onBackTap() {
				uni.navigateBack();
			},
			async loadCategories() {
				try {
					await ensureLogin();
					const res = await apiCategoryManageList();
					this.categories = (res && res.data) || [];
				} catch (e) {
					// 后端不可达时回退本地（字符串数组转为对象结构，保证展示）
					const local = uni.getStorageSync('categories') || [];
					this.categories = local.map(name => (typeof name === 'string' ? { id: null, catName: name } : name));
				}
			},
			openAddDialog() {
				this.isEditing = false;
				this.editId = null;
				this.categoryInput = '';
				this.showModal = true;
			},
			openEditDialog(index) {
				this.isEditing = true;
				this.editIndex = index;
				this.editId = this.categories[index].id;
				this.categoryInput = this.categories[index].catName;
				this.showModal = true;
			},
			closeModal() {
				this.showModal = false;
			},
			async confirmSaveCategory() {
				const trimmed = this.categoryInput.trim();
				if (!trimmed) {
					uni.showToast({ title: '分类名称不能为空', icon: 'none' });
					return;
				}
				// 重名校验
				const duplicate = this.categories.some((item, idx) =>
					item.catName === trimmed && (!this.isEditing || item.id !== this.editId));
				if (duplicate) {
					uni.showToast({ title: '分类已存在', icon: 'none' });
					return;
				}
				try {
					await ensureLogin();
					if (this.isEditing) {
						await apiCategoryUpdate({ id: this.editId, catName: trimmed });
						uni.showToast({ title: '修改成功', icon: 'none' });
					} else {
						await apiCategoryAdd({ catName: trimmed });
						uni.showToast({ title: '添加成功', icon: 'none' });
					}
					this.closeModal();
					this.loadCategories();
				} catch (e) {
					// 错误提示已由请求层弹出
				}
			},
			deleteCategory(index) {
				const cat = this.categories[index];
				uni.showModal({
					title: '提示',
					content: '确定要删除此分类吗？',
					success: async (res) => {
						if (!res.confirm) return;
						try {
							await ensureLogin();
							await apiCategoryDelete(cat.id);
							uni.showToast({ title: '删除成功', icon: 'none' });
							this.loadCategories();
						} catch (e) {}
					}
				});
			},
			async onSortItemTap(index) {
				if (index === 0) {
					uni.showToast({ title: '已经是第一个分类了', icon: 'none' });
					return;
				}
				// 本地交换位置
				const arr = this.categories.slice();
				const temp = arr[index];
				arr[index] = arr[index - 1];
				arr[index - 1] = temp;
				this.categories = arr;
				// 持久化：重排 orderNum（仅对有后端 id 的分类）
				try {
					await ensureLogin();
					await Promise.all(arr.map((c, i) => {
						c.orderNum = i;
						return c.id != null ? apiCategoryUpdate({ id: c.id, catName: c.catName, orderNum: i }) : Promise.resolve();
					}));
					uni.showToast({ title: '已向上移动', icon: 'success' });
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
		background: linear-gradient(180deg, #EBFBF8 0%, #FAFAFA 40%, #FAFAFA 100%);
		box-sizing: border-box;
		position: relative;
	}

	/* Navigation Bar styling */
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

	.capsule-menu {
		width: 60rpx; /* balance out back button for centered title */
	}

	/* Category scroll list list styling */
	.categories-list-scroll {
		flex: 1;
		width: 750rpx;
		box-sizing: border-box;
		overflow: hidden;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;
		padding-bottom: 200rpx;
	}

	.empty-rabbit {
		width: 260rpx;
		height: 260rpx;
	}

	.empty-text {
		font-size: 26rpx;
		color: #999999;
		text-align: center;
		width: 520rpx;
		line-height: 1.6;
		margin-top: 40rpx;
	}

	/* Category Cards List */
	.categories-list-container {
		padding: 24rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		box-sizing: border-box;
		padding-bottom: 200rpx; /* safe bottom action button overlap */
	}

	.category-card {
		background-color: #FFFFFF;
		border-radius: 24rpx;
		padding: 30rpx 28rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);
		box-sizing: border-box;
		animation: itemPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes itemPopIn {
		from { transform: scale(0.95); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	.card-left {
		flex: 1;
		margin-right: 20rpx;
	}

	.category-name {
		font-size: 32rpx;
		color: #333333;
		font-weight: 500;
	}

	.card-right {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.sort-pill {
		border: 1.5px solid #10B981;
		color: #10B981;
		font-size: 24rpx;
		font-weight: bold;
		padding: 6rpx 24rpx;
		border-radius: 20rpx;
		background-color: #FFFFFF;
		cursor: pointer;
	}

	.action-icon-btn {
		width: 50rpx;
		height: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s;
	}

	.svg-action {
		width: 38rpx;
		height: 38rpx;
	}

	/* Bottom solid Green Action Button */
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

	.btn-add-category {
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
		transition: all 0.2s;
	}

	/* Modal dialog overlay overlay */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 100;
		animation: fadeIn 0.25s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal-dialog-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 101;
		pointer-events: none;
	}

	.modal-card {
		pointer-events: auto;
		width: 600rpx;
		background-color: #FFFFFF;
		border-radius: 36rpx;
		padding: 48rpx 40rpx;
		box-sizing: border-box;
		box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.15);
		animation: dialogPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	@keyframes dialogPopIn {
		from { transform: scale(0.9); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	.modal-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #1A1A1A;
		margin-bottom: 36rpx;
	}

	.modal-input-wrapper {
		width: 100%;
		margin-bottom: 40rpx;
	}

	.modal-input {
		width: 100%;
		height: 84rpx;
		background-color: #F8F8F8;
		border-radius: 20rpx;
		padding: 0 28rpx;
		box-sizing: border-box;
		font-size: 28rpx;
		color: #333333;
		border: 1rpx solid #EFEFEF;
	}

	.modal-buttons-row {
		width: 100%;
		display: flex;
		justify-content: space-between;
		gap: 24rpx;
	}

	.modal-btn {
		flex: 1;
		height: 80rpx;
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: bold;
		box-sizing: border-box;
	}

	.btn-cancel {
		background-color: #F0F0F0;
		color: #333333;
	}

	.btn-confirm {
		background-color: #10B981;
		color: #FFFFFF;
		box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.2);
	}
</style>
