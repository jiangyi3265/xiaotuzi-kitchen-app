<template>
	<view class="page-container">
		<!-- Custom Navigation Bar -->
		<view class="status-bar"></view>
		<view class="nav-bar">
			<view class="back-btn" @tap="onBackTap">
				<image class="svg-back" src="/static/back_green.svg" mode="aspectFit"></image>
			</view>
			<view class="nav-title">
				<text>添加菜品</text>
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

		<!-- Main Scrollable Form Area -->
		<scroll-view class="form-scroll-view" scroll-y>
			<view class="scroll-content">
				<!-- Card 1: Basic Information -->
				<view class="form-card">
					<!-- Cover Image Upload Box -->
					<view class="cover-upload-box" @tap="onUploadCoverTap">
						<image class="cover-preview" :src="coverImage" mode="aspectFill" v-if="coverImage"></image>
						<view class="upload-placeholder" v-else>
							<image class="svg-camera" src="/static/camera.svg" mode="aspectFit"></image>
							<text class="upload-title">点击上传封面图</text>
							<text class="upload-subtitle">清晰美观的图片让菜品更有吸引力</text>
						</view>
					</view>

					<!-- Dish Name Input Row -->
					<view class="input-group border-bottom">
						<input 
							class="dish-name-input" 
							type="text" 
							placeholder="输入菜品名称（必填）" 
							placeholder-style="color: #BFBFBF"
							v-model="dishName"
						/>
					</view>

					<!-- Story/Description Input Row -->
					<view class="textarea-group border-bottom">
						<textarea 
							class="dish-desc-input" 
							placeholder="期待留下这道菜品背后，浸润着生活滋味的温情过往" 
							placeholder-style="color: #C1C1C1"
							v-model="dishDesc"
							auto-height
						/>
					</view>

					<view class="textarea-group border-bottom">
						<textarea
							class="dish-desc-input"
							placeholder="写下所用用料，例如：鸡腿 2只、洋葱 1个、生抽 2勺"
							placeholder-style="color: #C1C1C1"
							v-model="ingredientText"
							auto-height
						/>
					</view>

					<!-- Category Selector Row -->
					<view class="form-row border-bottom" @tap="openCategoryDrawer">
						<text class="row-label">所属分类</text>
						<view class="row-value-box">
							<text class="selected-category-text">{{ selectedCategory }}</text>
							<image class="chevron-right-gray" src="/static/arrow_left.svg" mode="aspectFit"></image>
						</view>
					</view>

					<!-- Is Active Switcher Row -->
					<view class="form-row border-bottom">
						<text class="row-label">是否上架</text>
						<switch :checked="isOnShelf" color="#10B981" @change="toggleOnShelf" />
					</view>

					<!-- Virtual Amount Row -->
					<view class="form-row">
						<view class="label-with-icon">
							<text class="row-label">虚拟金额</text>
							<image class="svg-info-circle" src="/static/question_circle.svg" mode="aspectFit" @tap="showPriceHelp"></image>
							<text class="row-hint-text">不填则不显示金额</text>
						</view>
						<input 
							class="price-input" 
							type="digit" 
							placeholder="请输入金额" 
							placeholder-style="color: #BFBFBF; text-align: right"
							v-model="virtualPrice"
						/>
					</view>
				</view>

				<!-- Card 2: Multiple Specifications -->
				<view class="form-card spec-card">
					<view class="form-row no-border">
						<view class="label-with-icon">
							<text class="row-label">多种规格</text>
							<image class="svg-info-circle" src="/static/question_circle.svg" mode="aspectFit" @tap="showSpecsHelp"></image>
						</view>
						<switch :checked="hasSpecs" color="#10B981" @change="toggleSpecs" />
					</view>

					<!-- Specifications List Area -->
					<view class="specs-editor-area" v-if="hasSpecs">
						<view class="spec-block" v-for="(spec, specIndex) in specs" :key="specIndex">
							<view class="spec-block-header">
								<input 
									class="spec-name-input" 
									type="text" 
									placeholder="选择项 如：辣度" 
									placeholder-style="color: #BFBFBF"
									v-model="spec.name"
								/>
								<view class="spec-delete-btn" @tap="removeSpec(specIndex)">
									<image class="svg-close" src="/static/delete_red.svg" mode="aspectFit"></image>
								</view>
							</view>

							<view class="spec-type-row">
								<view class="radio-group">
									<view class="radio-item" @tap="setSpecType(specIndex, false)">
										<view class="radio-circle" :class="{ checked: !spec.isMultiple }">
											<view class="radio-inner" v-if="!spec.isMultiple"></view>
										</view>
										<text class="radio-text">单选</text>
									</view>
									<view class="radio-item" @tap="setSpecType(specIndex, true)">
										<view class="radio-circle" :class="{ checked: spec.isMultiple }">
											<view class="radio-inner" v-if="spec.isMultiple"></view>
										</view>
										<text class="radio-text">多选</text>
									</view>
								</view>

								<view class="add-value-btn" @tap="openAddValuePrompt(specIndex)">
									<text>+ 添加选择值</text>
								</view>
							</view>

							<!-- Choice tags display -->
							<view class="spec-tags-container" v-if="spec.values.length > 0">
								<view class="spec-tag" v-for="(val, valIndex) in spec.values" :key="valIndex">
									<text class="tag-text">{{ val }}</text>
									<view class="tag-delete-x" @tap="removeSpecValue(specIndex, valIndex)">×</view>
								</view>
							</view>
						</view>

						<view class="btn-add-spec-block" @tap="addSpecBlock">
							<text>+ 添加规格分类</text>
						</view>
					</view>
				</view>

				<!-- Card 3: Recipe Steps (做法) -->
				<view class="form-card steps-card">
					<view class="form-row no-border">
						<text class="row-label section-title-bold">做法</text>
						<view class="step-share-row">
							<text class="row-label-small">公开</text>
							<switch :checked="isOpen" color="#10B981" @change="toggleOpen" />
						</view>
					</view>

					<!-- Step Cards List -->
					<view class="steps-editor-list">
						<view class="step-edit-item" v-for="(step, stepIndex) in steps" :key="step.id">
							<view class="step-item-header">
								<view class="step-header-left">
									<text class="step-title-text">步骤 {{ stepIndex + 1 }}</text>
									<view class="step-delete-btn" @tap="removeStep(stepIndex)" v-if="steps.length > 1">
										<image class="svg-close-gray" src="/static/delete_red.svg" mode="aspectFit"></image>
									</view>
								</view>
								
								<view class="step-timer-action" @tap="openTimerDialog(stepIndex)">
									<text class="timer-action-text" v-if="step.timer > 0">
										定时: {{ formatTimerText(step.timer) }}
									</text>
									<text class="timer-action-text" v-else>添加定时器 +</text>
								</view>
							</view>

							<!-- Step image upload dotted box -->
							<view class="step-image-upload" @tap="onUploadStepImageTap(stepIndex)">
								<image class="step-image-preview" :src="step.image" mode="aspectFill" v-if="step.image"></image>
								<view class="step-upload-placeholder" v-else>
									<image class="svg-plus-green" src="/static/plus_green.svg" mode="aspectFit"></image>
									<text class="step-upload-title">步骤图</text>
									<text class="step-upload-subtitle">清晰的步骤会让菜品更容易理解</text>
								</view>
							</view>

							<!-- Step text area -->
							<view class="step-desc-input-wrapper">
								<textarea 
									class="step-desc-textarea" 
									placeholder="点击此处，添加步骤说明" 
									placeholder-style="color: #BFBFBF"
									v-model="step.desc"
									auto-height
								/>
							</view>
						</view>

						<view class="add-step-btn-wrapper">
							<view class="btn-add-step" @tap="addStepBlock">
								<text>再增加一步</text>
							</view>
						</view>
					</view>
				</view>

				<!-- Card 4: Cooking Experience (烹饪经验) -->
				<view class="form-card experience-card">
					<view class="form-row no-border">
						<view class="label-with-icon">
							<text class="row-label section-title-bold">烹饪经验</text>
							<image class="svg-info-circle" src="/static/question_circle.svg" mode="aspectFit" @tap="showExpHelp"></image>
						</view>
					</view>
					
					<view class="exp-textarea-wrapper">
						<textarea 
							class="exp-textarea" 
							placeholder="示例：这道煎牛排想有爆汁口感，雪花纹理清晰的眼肉牛排是首选！" 
							placeholder-style="color: #C5C5C5"
							v-model="cookingExperience"
							auto-height
						/>
					</view>
				</view>

				<!-- Card 5: Advanced Settings (高级设置) -->
				<view class="form-card advanced-card">
					<view class="advanced-header" @tap="toggleAdvanced">
						<view class="advanced-header-left">
							<image class="svg-gear" src="/static/gear.svg" mode="aspectFit"></image>
							<text class="row-label section-title-bold">高级设置</text>
						</view>
						<image 
							class="chevron-arrow" 
							:class="{ expanded: showAdvanced }" 
							src="/static/arrow_left.svg" 
							mode="aspectFit"
						></image>
					</view>

					<!-- Advanced Form Fields -->
					<view class="advanced-fields-panel" v-if="showAdvanced">
						<!-- Preparation Time -->
						<view class="advanced-form-row">
							<text class="adv-label">准备时间 (分钟)</text>
							<view class="counter-control">
								<view class="counter-btn" @tap="adjustAdvanced('prepTime', -5)">-</view>
								<input class="counter-value" type="number" v-model="advancedSettings.prepTime" />
								<view class="counter-btn" @tap="adjustAdvanced('prepTime', 5)">+</view>
							</view>
						</view>

						<!-- Cooking Time -->
						<view class="advanced-form-row">
							<text class="adv-label">烹饪时间 (分钟)</text>
							<view class="counter-control">
								<view class="counter-btn" @tap="adjustAdvanced('cookTime', -5)">-</view>
								<input class="counter-value" type="number" v-model="advancedSettings.cookTime" />
								<view class="counter-btn" @tap="adjustAdvanced('cookTime', 5)">+</view>
							</view>
						</view>

						<!-- Difficulty -->
						<view class="advanced-form-row">
							<text class="adv-label">难度</text>
							<view class="difficulty-picker">
								<view 
									class="diff-tag" 
									:class="{ active: advancedSettings.difficulty === '简单' }"
									@tap="advancedSettings.difficulty = '简单'"
								>简单</view>
								<view 
									class="diff-tag" 
									:class="{ active: advancedSettings.difficulty === '中等' }"
									@tap="advancedSettings.difficulty = '中等'"
								>中等</view>
								<view 
									class="diff-tag" 
									:class="{ active: advancedSettings.difficulty === '困难' }"
									@tap="advancedSettings.difficulty = '困难'"
								>困难</view>
							</view>
						</view>

						<!-- Portions -->
						<view class="advanced-form-row">
							<text class="adv-label">适合人数 (人份)</text>
							<view class="counter-control">
								<view class="counter-btn" @tap="adjustAdvanced('portions', -1)">-</view>
								<input class="counter-value" type="number" v-model="advancedSettings.portions" />
								<view class="counter-btn" @tap="adjustAdvanced('portions', 1)">+</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- Bottom Fixed Action Button -->
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

		<!-- Step Timer Dialog Popup -->
		<view class="dialog-backdrop" v-if="showTimerDialog" @tap="closeTimerDialog"></view>
		<view class="timer-dialog-card" v-if="showTimerDialog">
			<view class="dialog-header">
				<text class="dialog-title">设置步骤定时器</text>
			</view>

			<view class="timer-adjuster-body">
				<view class="adjuster-column">
					<text class="column-title">分</text>
					<view class="adjuster-counter">
						<view class="adj-btn" @tap="adjustTimerUnit('min', -1)">-</view>
						<text class="adj-value">{{ timerMin }}</text>
						<view class="adj-btn" @tap="adjustTimerUnit('min', 1)">+</view>
					</view>
				</view>

				<view class="adjuster-column">
					<text class="column-title">秒</text>
					<view class="adjuster-counter">
						<view class="adj-btn" @tap="adjustTimerUnit('sec', -5)">-</view>
						<text class="adj-value">{{ timerSec }}</text>
						<view class="adj-btn" @tap="adjustTimerUnit('sec', 5)">+</view>
					</view>
				</view>
			</view>

			<view class="dialog-actions">
				<view class="dialog-btn cancel" @tap="closeTimerDialog">取消</view>
				<view class="dialog-btn confirm" @tap="saveTimerValue">确定</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { apiCategoryTree, apiCategoryAdd } from '@/api/category.js'
	import { apiDishAdd } from '@/api/dish.js'
	import { ensureLogin } from '@/utils/login.js'
	import { uploadFile } from '@/utils/request.js'

	export default {
		data() {
			return {
				coverImage: '',
				dishName: '',
				dishDesc: '',
				ingredientText: '',
				selectedCategory: '',
				selectedCategoryId: null,
				isOnShelf: true,
				virtualPrice: '',
				hasSpecs: false,
				specs: [],
				isOpen: true,
				steps: [
					{ id: 1, image: '', desc: '', timer: 0 }
				],
				cookingExperience: '',
				showAdvanced: false,
				advancedSettings: {
					prepTime: 15,
					cookTime: 20,
					difficulty: '中等',
					portions: 2
				},
				
				// Category selector states
				showCategoryDrawer: false,
				categories: [], // [{ id, catName }]

				// Timer dialog states
				showTimerDialog: false,
				activeStepIndex: -1,
				timerMin: 5,
				timerSec: 0
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
							uni.showToast({ title: '封面图片已上传', icon: 'success' });
						}).catch(() => {});
					}
				});
			},
			toggleOnShelf(e) {
				this.isOnShelf = e.detail.value;
			},
			showPriceHelp() {
				uni.showModal({
					title: '虚拟金额说明',
					content: '在此处填写的金额为展示作用，若不填写，前台页面将隐去价格信息。',
					showCancel: false
				});
			},
			showSpecsHelp() {
				uni.showModal({
					title: '多规格说明',
					content: '开启后，您可以对菜品增加个性化选择项，例如“糖度（无糖/微糖/全糖）”或“辣度（不辣/微辣/重辣）”。',
					showCancel: false
				});
			},
			showExpHelp() {
				uni.showModal({
					title: '烹饪经验说明',
					content: '记录您在制作此菜品时的独特经验、避坑指南、火候心得或选材秘诀等。',
					showCancel: false
				});
			},
			toggleSpecs(e) {
				this.hasSpecs = e.detail.value;
				if (this.hasSpecs && this.specs.length === 0) {
					this.addSpecBlock();
				}
			},
			addSpecBlock() {
				this.specs.push({
					name: '',
					isMultiple: false,
					values: []
				});
			},
			removeSpec(index) {
				this.specs.splice(index, 1);
				if (this.specs.length === 0) {
					this.hasSpecs = false;
				}
			},
			setSpecType(specIndex, isMultiple) {
				this.specs[specIndex].isMultiple = isMultiple;
			},
			openAddValuePrompt(specIndex) {
				uni.showModal({
					title: '添加规格选项值',
					placeholderText: '请输入选择值（如：微辣）',
					editable: true,
					success: (res) => {
						if (res.confirm && res.content.trim()) {
							const val = res.content.trim();
							if (!this.specs[specIndex].values.includes(val)) {
								this.specs[specIndex].values.push(val);
							}
						}
					}
				});
			},
			removeSpecValue(specIndex, valIndex) {
				this.specs[specIndex].values.splice(valIndex, 1);
			},
			toggleOpen(e) {
				this.isOpen = e.detail.value;
			},
			addStepBlock() {
				const nextId = this.steps.length > 0 ? Math.max(...this.steps.map(s => s.id)) + 1 : 1;
				this.steps.push({
					id: nextId,
					image: '',
					desc: '',
					timer: 0
				});
			},
			removeStep(index) {
				if (this.steps.length > 1) {
					this.steps.splice(index, 1);
				}
			},
			onUploadStepImageTap(index) {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						const path = res.tempFilePaths && res.tempFilePaths[0];
						if (!path) return;
						uploadFile(path).then((up) => {
							this.steps[index].image = up.url;
							uni.showToast({ title: '步骤图已上传', icon: 'success' });
						}).catch(() => {});
					}
				});
			},
			formatTimerText(seconds) {
				const min = Math.floor(seconds / 60);
				const sec = seconds % 60;
				if (sec === 0) return `${min}分钟`;
				return `${min}分${sec}秒`;
			},
			openTimerDialog(index) {
				this.activeStepIndex = index;
				const currentSeconds = this.steps[index].timer || 300;
				this.timerMin = Math.floor(currentSeconds / 60);
				this.timerSec = currentSeconds % 60;
				this.showTimerDialog = true;
			},
			closeTimerDialog() {
				this.showTimerDialog = false;
				this.activeStepIndex = -1;
			},
			adjustTimerUnit(unit, amount) {
				if (unit === 'min') {
					this.timerMin = Math.max(0, this.timerMin + amount);
				} else if (unit === 'sec') {
					let newSec = this.timerSec + amount;
					if (newSec < 0) {
						if (this.timerMin > 0) {
							this.timerMin--;
							this.timerSec = 55;
						} else {
							this.timerSec = 0;
						}
					} else if (newSec >= 60) {
						this.timerMin++;
						this.timerSec = newSec - 60;
					} else {
						this.timerSec = newSec;
					}
				}
			},
			saveTimerValue() {
				if (this.activeStepIndex > -1) {
					const totalSeconds = (this.timerMin * 60) + this.timerSec;
					this.steps[this.activeStepIndex].timer = totalSeconds;
				}
				this.closeTimerDialog();
			},
			toggleAdvanced() {
				this.showAdvanced = !this.showAdvanced;
			},
			adjustAdvanced(key, amount) {
				let newVal = Number(this.advancedSettings[key]) + amount;
				if (newVal < 1) newVal = 1;
				this.advancedSettings[key] = newVal;
			},
			
			// Category Selector Methods
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

			// Publish Method
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

				// 组装后端结构（规格/步骤级联）
				const specs = this.hasSpecs
					? this.specs
						.filter(s => s.name && s.name.trim() !== '')
						.map((s) => ({
							specName: s.name.trim(),
							multiple: s.isMultiple ? '1' : '0',
							values: (s.values || []).map(v => ({ specValue: v }))
						}))
					: [];
				const steps = this.isOpen
					? this.steps
						.filter(s => (s.desc && s.desc.trim() !== '') || s.image)
						.map((s, i) => ({
							stepNo: i + 1,
							image: s.image || '',
							content: s.desc || '',
							timer: s.timer || 0
						}))
					: [];

				const payload = {
					dishName: trimmedName,
					cover: this.coverImage || '/static/onion_chicken.png',
					categoryId: this.selectedCategoryId,
					story: this.dishDesc.trim(),
					ingredients: this.ingredientText.trim(),
					virtualPrice: this.virtualPrice ? Number(this.virtualPrice) : null,
					status: this.isOnShelf ? '1' : '0',
					hasSpecs: this.hasSpecs ? '1' : '0',
					recipeOpen: this.isOpen ? '1' : '0',
					cookingExp: this.cookingExperience || '',
					prepTime: Number(this.advancedSettings.prepTime) || 0,
					cookTime: Number(this.advancedSettings.cookTime) || 0,
					difficulty: this.advancedSettings.difficulty || '中等',
					portions: Number(this.advancedSettings.portions) || 2,
					specs,
					steps
				};

				try {
					await ensureLogin();
					await apiDishAdd(payload);
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
		background: #FAFAFA;
		box-sizing: border-box;
		position: relative;
	}

	/* Navigation Header styling */
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
		border-bottom: 1rpx solid #F2F2F2;
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
		width: 174rpx;
		height: 64rpx;
		border-radius: 32rpx;
		border: 1rpx solid #EAEAEA;
		background-color: rgba(255, 255, 255, 0.6);
		display: flex;
		align-items: center;
		padding: 0 16rpx;
		box-sizing: border-box;
		justify-content: space-between;
	}

	.capsule-dots {
		display: flex;
		gap: 6rpx;
	}

	.capsule-dots .dot {
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		background-color: #000000;
	}

	.capsule-divider {
		width: 1rpx;
		height: 36rpx;
		background-color: #E2E2E2;
	}

	.capsule-circle {
		width: 32rpx;
		height: 32rpx;
		border: 4rpx solid #000000;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.circle-inner {
		width: 12rpx;
		height: 12rpx;
		background-color: #000000;
		border-radius: 50%;
	}

	/* Main Scrollable View */
	.form-scroll-view {
		flex: 1;
		width: 750rpx;
		overflow: hidden;
	}

	.scroll-content {
		padding: 24rpx;
		padding-bottom: 200rpx; /* Extra spacing for bottom button */
		box-sizing: border-box;
	}

	.form-card {
		background-color: #FFFFFF;
		border-radius: 32rpx;
		padding: 30rpx;
		box-sizing: border-box;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.01);
		display: flex;
		flex-direction: column;
	}

	/* Cover upload box */
	.cover-upload-box {
		width: 100%;
		height: 360rpx;
		border: 2rpx dashed #10B981;
		border-radius: 28rpx;
		background-color: #FAFAFA;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		box-sizing: border-box;
		margin-bottom: 30rpx;
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
	}

	.svg-camera {
		width: 64rpx;
		height: 64rpx;
	}

	.upload-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #10B981;
	}

	.upload-subtitle {
		font-size: 22rpx;
		color: #8C8C8C;
	}

	/* Inputs rows */
	.input-group {
		margin-bottom: 20rpx;
		padding-bottom: 10rpx;
	}

	.border-bottom {
		border-bottom: 1rpx solid #F5F5F5;
	}

	.dish-name-input {
		width: 100%;
		height: 80rpx;
		font-size: 32rpx;
		color: #1A1A1A;
		font-weight: bold;
	}

	.textarea-group {
		margin-bottom: 20rpx;
		padding-bottom: 20rpx;
	}

	.dish-desc-input {
		width: 100%;
		min-height: 120rpx;
		font-size: 28rpx;
		color: #333333;
		line-height: 1.5;
	}

	.form-row {
		height: 110rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
	}

	.row-label {
		font-size: 28rpx;
		color: #333333;
		font-weight: bold;
	}

	.section-title-bold {
		font-size: 30rpx;
		color: #1A1A1A;
		font-weight: bold;
	}

	.row-label-small {
		font-size: 26rpx;
		color: #555555;
	}

	.label-with-icon {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.svg-info-circle {
		width: 28rpx;
		height: 28rpx;
		opacity: 0.5;
	}

	.row-hint-text {
		font-size: 22rpx;
		color: #8C8C8C;
		margin-left: 6rpx;
	}

	.row-value-box {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.selected-category-text {
		font-size: 28rpx;
		color: #10B981;
		font-weight: bold;
	}

	.chevron-right-gray {
		width: 20rpx;
		height: 20rpx;
		transform: rotate(180deg);
		opacity: 0.25;
	}

	.price-input {
		width: 240rpx;
		text-align: right;
		font-size: 28rpx;
		color: #333333;
	}

	/* Specs Card */
	.spec-card {
		padding-top: 15rpx;
	}

	.no-border {
		border: none !important;
	}

	.specs-editor-area {
		margin-top: 10rpx;
	}

	.spec-block {
		background-color: #FAFAFA;
		border: 1.5rpx dashed #E2E2E2;
		border-radius: 20rpx;
		padding: 24rpx;
		box-sizing: border-box;
		margin-bottom: 20rpx;
	}

	.spec-block-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1rpx solid #EEEEEE;
		padding-bottom: 16rpx;
		margin-bottom: 16rpx;
	}

	.spec-name-input {
		flex: 1;
		font-size: 26rpx;
		color: #333333;
		font-weight: bold;
	}

	.spec-delete-btn {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.svg-close {
		width: 32rpx;
		height: 32rpx;
	}

	.svg-close-gray {
		width: 28rpx;
		height: 28rpx;
		opacity: 0.45;
	}

	.spec-type-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.radio-group {
		display: flex;
		gap: 24rpx;
	}

	.radio-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.radio-circle {
		width: 28rpx;
		height: 28rpx;
		border-radius: 50%;
		border: 2rpx solid #BFBFBF;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.radio-circle.checked {
		border-color: #10B981;
	}

	.radio-inner {
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		background-color: #10B981;
	}

	.radio-text {
		font-size: 24rpx;
		color: #555555;
	}

	.add-value-btn {
		border: 1rpx solid #10B981;
		color: #10B981;
		background-color: #FFFFFF;
		font-size: 22rpx;
		font-weight: bold;
		padding: 8rpx 18rpx;
		border-radius: 20rpx;
	}

	.spec-tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-top: 10rpx;
	}

	.spec-tag {
		background-color: #E6FBF7;
		border: 1rpx solid #BFEFE4;
		border-radius: 12rpx;
		padding: 6rpx 16rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.tag-text {
		font-size: 22rpx;
		color: #059669;
		font-weight: 500;
	}

	.tag-delete-x {
		font-size: 26rpx;
		color: #059669;
		font-weight: bold;
		line-height: 1;
	}

	.btn-add-spec-block {
		border: 1.5rpx dashed #10B981;
		color: #10B981;
		height: 74rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26rpx;
		font-weight: bold;
		background-color: #FFFFFF;
		margin-top: 10rpx;
	}

	/* Steps (做法) styles */
	.steps-card {
		padding-top: 15rpx;
	}

	.step-share-row {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.step-edit-item {
		margin-bottom: 30rpx;
		border-bottom: 1rpx solid #F5F5F5;
		padding-bottom: 30rpx;
	}

	.step-edit-item:last-child {
		border-bottom: none;
		padding-bottom: 10rpx;
	}

	.step-item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.step-header-left {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.step-title-text {
		font-size: 28rpx;
		color: #333333;
		font-weight: bold;
	}

	.step-timer-action {
		background-color: #F2F2F2;
		border-radius: 20rpx;
		padding: 6rpx 18rpx;
	}

	.timer-action-text {
		font-size: 22rpx;
		color: #555555;
	}

	.step-image-upload {
		width: 100%;
		height: 300rpx;
		border: 2rpx dashed #10B981;
		border-radius: 20rpx;
		background-color: #FAFAFA;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		box-sizing: border-box;
		margin-bottom: 16rpx;
	}

	.step-image-preview {
		width: 100%;
		height: 100%;
	}

	.step-upload-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		text-align: center;
	}

	.svg-plus-green {
		width: 44rpx;
		height: 44rpx;
	}

	.step-upload-title {
		font-size: 26rpx;
		color: #10B981;
		font-weight: bold;
	}

	.step-upload-subtitle {
		font-size: 20rpx;
		color: #8C8C8C;
	}

	.step-desc-input-wrapper {
		width: 100%;
		background-color: #FAFAFA;
		border-radius: 12rpx;
		padding: 16rpx 20rpx;
		box-sizing: border-box;
	}

	.step-desc-textarea {
		width: 100%;
		min-height: 80rpx;
		font-size: 26rpx;
		color: #333333;
		line-height: 1.4;
	}

	.add-step-btn-wrapper {
		display: flex;
		justify-content: flex-end;
		margin-top: 10rpx;
	}

	.btn-add-step {
		background-color: #10B981;
		color: #FFFFFF;
		font-size: 24rpx;
		font-weight: bold;
		padding: 14rpx 36rpx;
		border-radius: 28rpx;
	}

	/* Cooking experience card */
	.experience-card {
		padding-top: 15rpx;
	}

	.exp-textarea-wrapper {
		margin-top: 10rpx;
		background-color: #FAFAFA;
		border-radius: 16rpx;
		padding: 20rpx;
		box-sizing: border-box;
	}

	.exp-textarea {
		width: 100%;
		min-height: 100rpx;
		font-size: 26rpx;
		color: #333333;
		line-height: 1.4;
	}

	/* Advanced settings card */
	.advanced-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 80rpx;
	}

	.advanced-header-left {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.svg-gear {
		width: 32rpx;
		height: 32rpx;
	}

	.chevron-arrow {
		width: 24rpx;
		height: 24rpx;
		transform: rotate(270deg); /* point down */
		transition: transform 0.25s ease;
		opacity: 0.35;
	}

	.chevron-arrow.expanded {
		transform: rotate(90deg); /* point up */
	}

	.advanced-fields-panel {
		border-top: 1rpx solid #F5F5F5;
		margin-top: 16rpx;
		padding-top: 10rpx;
	}

	.advanced-form-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 96rpx;
		border-bottom: 1rpx solid #F9F9F9;
	}

	.advanced-form-row:last-child {
		border-bottom: none;
	}

	.adv-label {
		font-size: 26rpx;
		color: #555555;
	}

	.counter-control {
		display: flex;
		align-items: center;
		background-color: #F5F5F5;
		border-radius: 28rpx;
		height: 56rpx;
		padding: 0 4rpx;
	}

	.counter-btn {
		width: 50rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #333333;
		font-weight: bold;
	}

	.counter-value {
		width: 80rpx;
		text-align: center;
		font-size: 26rpx;
		color: #333333;
		font-weight: bold;
	}

	.difficulty-picker {
		display: flex;
		gap: 12rpx;
	}

	.diff-tag {
		background-color: #F5F5F5;
		color: #666666;
		font-size: 24rpx;
		padding: 8rpx 24rpx;
		border-radius: 20rpx;
	}

	.diff-tag.active {
		background-color: #E6FBF7;
		color: #10B981;
		font-weight: bold;
		border: 1rpx solid #10B981;
	}

	/* Bottom actions floating wrapper */
	.bottom-action-wrapper {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 750rpx;
		padding: 30rpx 24rpx 50rpx 24rpx;
		box-sizing: border-box;
		background: linear-gradient(180deg, rgba(250,250,250,0) 0%, rgba(250,250,250,1) 30%);
		z-index: 100;
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
		box-shadow: 0 8rpx 20rpx rgba(16, 185, 129, 0.2);
	}

	/* Drawer list selection */
	.drawer-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
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
		z-index: 1005;
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

	/* Dialog alert overlay */
	.dialog-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.6);
		z-index: 2000;
	}

	.timer-dialog-card {
		position: fixed;
		top: 40%;
		left: 75rpx;
		width: 600rpx;
		background-color: #FFFFFF;
		border-radius: 36rpx;
		padding: 40rpx;
		box-sizing: border-box;
		z-index: 2005;
		box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		align-items: center;
		animation: dialogScale 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes dialogScale {
		from { transform: scale(0.85); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	.dialog-header {
		margin-bottom: 30rpx;
	}

	.dialog-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.timer-adjuster-body {
		display: flex;
		gap: 60rpx;
		margin-bottom: 40rpx;
		width: 100%;
		justify-content: center;
	}

	.adjuster-column {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}

	.column-title {
		font-size: 24rpx;
		color: #8C8C8C;
	}

	.adjuster-counter {
		display: flex;
		align-items: center;
		background-color: #F5F5F5;
		border-radius: 28rpx;
		height: 64rpx;
		padding: 0 8rpx;
	}

	.adj-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		color: #333333;
		font-weight: bold;
	}

	.adj-value {
		width: 64rpx;
		text-align: center;
		font-size: 30rpx;
		color: #1A1A1A;
		font-weight: bold;
	}

	.dialog-actions {
		display: flex;
		gap: 24rpx;
		width: 100%;
	}

	.dialog-btn {
		flex: 1;
		height: 80rpx;
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: bold;
	}

	.dialog-btn.cancel {
		background-color: #F5F5F5;
		color: #666666;
	}

	.dialog-btn.confirm {
		background-color: #10B981;
		color: #FFFFFF;
	}
</style>
