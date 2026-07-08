<template>
	<view class="page-container">
		<!-- Custom Navigation Bar -->
		<view class="status-bar"></view>
		<view class="nav-bar">
			<view class="back-btn" @tap="onBackTap">
				<image class="svg-back" src="/static/back_green.svg" mode="aspectFit"></image>
			</view>
			<view class="nav-title-box">
				<text class="nav-title">智能菜谱推荐</text>
				<view class="carrot-badge">
					<text class="carrot-balance-text">🥕 {{ carrotBalance }}</text>
				</view>
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

		<!-- Scroll Content -->
		<scroll-view class="form-scroll-view" scroll-y>
			<view class="scroll-content">
				<!-- Prompt Form Card -->
				<view class="form-card" v-if="!showResult">
					<view class="card-header-row">
						<text class="card-main-title">想吃什么</text>
						<view class="btn-inspiration" @tap="rotateInspiration">
							<text>换个灵感</text>
						</view>
					</view>
					<text class="card-subtitle">像聊天一样描述想吃的菜</text>

					<!-- Custom Text Box Dotted/Styled Box -->
					<view class="prompt-input-container">
						<text class="prompt-input-label">自由描述</text>
						<textarea 
							class="prompt-textarea" 
							:placeholder="activePlaceholder" 
							placeholder-style="color: #C1C1C1"
							v-model="descText"
							maxlength="500"
						/>
						<view class="character-counter">
							<text>{{ descText.length }}/500</text>
						</view>
					</view>
				</view>

				<!-- AI Loading Animation state -->
				<view class="ai-loading-container" v-if="isLoading">
					<view class="chef-loader-icon">
						<image class="svg-chef-hat-anim" src="/static/chef_hat.svg" mode="aspectFit"></image>
						<view class="pulse-ring"></view>
					</view>
					<text class="loading-state-text">{{ loadingText }}</text>
				</view>

				<!-- AI Recommendation Result Card -->
				<view class="result-container-card" v-if="showResult && !isLoading">
					<view class="result-card-header">
						<image class="result-avatar" src="/static/kitchen_avatar.png" mode="aspectFill"></image>
						<view class="result-header-text">
							<text class="ai-badge">AI 智能推荐大厨</text>
							<text class="result-timestamp">刚刚生成为您定制</text>
						</view>
					</view>

					<view class="result-dish-image-wrapper">
						<image class="result-dish-img" :src="recommendedRecipe.image" mode="aspectFill"></image>
						<view class="result-dish-overlay">
							<text class="result-dish-name">{{ recommendedRecipe.name }}</text>
							<text class="result-dish-tag">{{ recommendedRecipe.category }}</text>
						</view>
					</view>

					<view class="result-details-section" v-if="recommendedRecipe.desc">
						<text class="result-section-title">菜品描述</text>
						<text class="result-desc-text">{{ recommendedRecipe.desc }}</text>
					</view>

					<view class="result-details-section border-top" v-if="recommendedRecipe.steps.length">
						<text class="result-section-title">做法步骤</text>
						<view class="result-steps-list">
							<view class="result-step-item" v-for="(step, stepIdx) in recommendedRecipe.steps" :key="stepIdx">
								<view class="step-num-bubble">
									<text>{{ stepIdx + 1 }}</text>
								</view>
								<view class="step-content-box">
									<text class="step-desc-text">{{ step.desc }}</text>
									<view class="step-timer-tag" v-if="step.timer > 0">
										<image class="svg-timer" src="/static/info.svg" mode="aspectFit"></image>
										<text>定时: {{ formatTimerText(step.timer) }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>

					<view class="result-details-section border-top">
						<text class="result-section-title">高级设置信息</text>
						<view class="advanced-info-grid">
							<view class="adv-info-item">
								<text class="adv-info-val">{{ recommendedRecipe.advanced.prepTime }}分钟</text>
								<text class="adv-info-lbl">准备时间</text>
							</view>
							<view class="adv-info-item">
								<text class="adv-info-val">{{ recommendedRecipe.advanced.cookTime }}分钟</text>
								<text class="adv-info-lbl">烹饪时间</text>
							</view>
							<view class="adv-info-item">
								<text class="adv-info-val">{{ recommendedRecipe.advanced.difficulty }}</text>
								<text class="adv-info-lbl">烹饪难度</text>
							</view>
							<view class="adv-info-item">
								<text class="adv-info-val">{{ recommendedRecipe.advanced.portions }}人份</text>
								<text class="adv-info-lbl">适合分量</text>
							</view>
						</view>
					</view>

					<view class="result-actions-row">
						<view class="btn-retry" @tap="retryRecommendation">
							<text>重新推荐</text>
						</view>
						<view class="btn-save-kitchen" @tap="viewRecommendedDish">
							<text>查看菜品</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- Bottom Action Trigger Button (Hidden when viewing result or loading) -->
		<view class="bottom-action-wrapper" v-if="!showResult && !isLoading">
			<view class="btn-start-recommend" @tap="startRecommendation">
				<text>开始推荐（消耗 30 🥕）</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { apiUserInfo } from '@/api/auth.js'
	import { apiRecommend } from '@/api/recommend.js'
	import { ensureLogin } from '@/utils/login.js'

	export default {
		data() {
			return {
				carrotBalance: 0,
				descText: '',
				activePlaceholder: '例如：冰箱里有鸡胸肉、土豆和青椒，想做一份少油微辣、20分钟内能完成的晚餐，不要香菜。',
				placeholders: [
					'例如：冰箱里有鸡胸肉、土豆和青椒，想做一份少油微辣、20分钟内能完成的晚餐，不要香菜。',
					'例如：天气太热了，想吃一道清爽开胃的凉拌菜，制作时间最好在10分钟以内。',
					'例如：今天过节，想做一道大菜给家人吃，比如红烧肉或者清蒸鱼，希望步骤详细一点。',
					'例如：减肥期间想吃高蛋白低脂肪的减脂餐，最好有鸡胸肉或者牛肉，做法简单。'
				],
				placeholderIndex: 0,

				// States
				isLoading: false,
				loadingText: '大厨正在为您从本店菜品中挑选…',
				showResult: false,

				// 推荐结果（来自后端真实菜品）
				recommendedRecipe: null,
				// 推荐命中的真实菜品 id（用于跳转菜品详情）
				recommendedDishId: null
			}
		},
		onLoad() {
			this.loadCarrots();
		},
		methods: {
			onBackTap() {
				uni.navigateBack();
			},
			async loadCarrots() {
				// 真实积分：登录后从后端用户信息读取
				try {
					await ensureLogin();
					const res = await apiUserInfo();
					this.carrotBalance = (res && res.data && Number(res.data.carrot)) || 0;
				} catch (e) {
					this.carrotBalance = 0;
				}
			},
			rotateInspiration() {
				this.placeholderIndex = (this.placeholderIndex + 1) % this.placeholders.length;
				this.activePlaceholder = this.placeholders[this.placeholderIndex];
				uni.showToast({ title: '已更新灵感提示', icon: 'none', duration: 800 });
			},
			async startRecommendation() {
				if (this.isLoading) return;
				this.isLoading = true;
				this.loadingText = '大厨正在为您从本店菜品中挑选…';
				try {
					await ensureLogin();
					const res = await apiRecommend({ desc: this.descText });
					const d = (res && res.data) || null;
					if (!d) {
						// 后端未返回菜品：不伪造结果
						uni.showToast({ title: '暂时没有匹配的菜品', icon: 'none' });
						return;
					}
					this.recommendedDishId = d.id != null ? d.id : null;
					this.recommendedRecipe = {
						name: d.dishName || '',
						image: d.cover || '',
						desc: d.story || '',
						category: d.categoryName || '',
						steps: (d.steps || []).map(s => ({
							image: s.image || '',
							desc: s.content || '',
							timer: s.timer || 0
						})),
						advanced: {
							prepTime: d.prepTime || 0,
							cookTime: d.cookTime || 0,
							difficulty: d.difficulty || '未设置',
							portions: d.portions || 0
						}
					};
					// 剩余积分由后端返回（消耗后的真实余额）
					if (res.carrot != null) {
						this.carrotBalance = Number(res.carrot);
					}
					this.showResult = true;
				} catch (e) {
					// 失败提示已由请求层统一弹出（如“胡萝卜不足”），不伪造成功
				} finally {
					this.isLoading = false;
				}
			},
			formatTimerText(seconds) {
				const min = Math.floor(seconds / 60);
				const sec = seconds % 60;
				if (sec === 0) return min + '分钟';
				return min + '分' + sec + '秒';
			},
			retryRecommendation() {
				this.showResult = false;
				this.recommendedRecipe = null;
				this.recommendedDishId = null;
			},
			viewRecommendedDish() {
				if (this.recommendedDishId == null) {
					uni.showToast({ title: '菜品信息缺失', icon: 'none' });
					return;
				}
				uni.navigateTo({ url: '/pages/dish-detail/dish-detail?id=' + this.recommendedDishId });
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

	.nav-title-box {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.nav-title {
		font-size: 34rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.carrot-badge {
		background-color: #FFF3EB;
		border: 1rpx solid #FFD8C2;
		border-radius: 20rpx;
		padding: 2rpx 14rpx;
		display: flex;
		align-items: center;
	}

	.carrot-balance-text {
		font-size: 22rpx;
		color: #FF7014;
		font-weight: bold;
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

	/* Scroll view wrapper */
	.form-scroll-view {
		flex: 1;
		width: 750rpx;
		overflow: hidden;
	}

	.scroll-content {
		padding: 24rpx;
		padding-bottom: 200rpx;
		box-sizing: border-box;
	}

	/* Cards definitions */
	.form-card {
		background-color: #FFFFFF;
		border-radius: 36rpx;
		padding: 40rpx 30rpx;
		box-sizing: border-box;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
		display: flex;
		flex-direction: column;
	}

	.card-header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12rpx;
	}

	.card-main-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.btn-inspiration {
		background-color: #EBFBF8;
		border: 1.5rpx solid #A4EAE0;
		border-radius: 28rpx;
		padding: 8rpx 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-inspiration text {
		font-size: 24rpx;
		color: #10B981;
		font-weight: bold;
	}

	.card-subtitle {
		font-size: 24rpx;
		color: #8C8C8C;
		margin-bottom: 30rpx;
	}

	/* Text Input Area */
	.prompt-input-container {
		border: 2rpx solid #EAEAEA;
		border-radius: 24rpx;
		padding: 24rpx;
		background-color: #FCFCFC;
		position: relative;
	}

	.prompt-input-label {
		font-size: 24rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 12rpx;
		display: block;
	}

	.prompt-textarea {
		width: 100%;
		height: 240rpx;
		font-size: 28rpx;
		color: #1A1A1A;
		line-height: 1.5;
	}

	.character-counter {
		position: absolute;
		bottom: 24rpx;
		right: 24rpx;
	}

	.character-counter text {
		font-size: 22rpx;
		color: #BFBFBF;
	}

	/* Loader Overlay styles */
	.ai-loading-container {
		background-color: #FFFFFF;
		border-radius: 36rpx;
		padding: 80rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
		margin-top: 20rpx;
	}

	.chef-loader-icon {
		position: relative;
		width: 140rpx;
		height: 140rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 40rpx;
	}

	.svg-chef-hat-anim {
		width: 80rpx;
		height: 80rpx;
		z-index: 2;
		animation: bounceHat 1.5s infinite ease-in-out;
	}

	@keyframes bounceHat {
		0%, 100% { transform: translateY(0) rotate(0); }
		50% { transform: translateY(-16rpx) rotate(8deg); }
	}

	.pulse-ring {
		position: absolute;
		width: 100%;
		height: 100%;
		border: 4rpx solid #10B981;
		border-radius: 50%;
		animation: pulseCircle 1.5s infinite ease-out;
		opacity: 0;
	}

	@keyframes pulseCircle {
		0% { transform: scale(0.6); opacity: 0.8; }
		100% { transform: scale(1.2); opacity: 0; }
	}

	.loading-state-text {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
		text-align: center;
		margin-bottom: 30rpx;
		height: 40rpx;
	}

	.progress-bar-bg {
		width: 80%;
		height: 8rpx;
		border-radius: 4rpx;
		background-color: #F0F0F0;
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		background-color: #10B981;
		border-radius: 4rpx;
		transition: width 0.3s ease;
	}

	/* Recommendation Results display */
	.result-container-card {
		background-color: #FFFFFF;
		border-radius: 36rpx;
		padding: 40rpx 30rpx;
		box-sizing: border-box;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
		display: flex;
		flex-direction: column;
	}

	.result-card-header {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 30rpx;
	}

	.result-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
	}

	.result-header-text {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.ai-badge {
		font-size: 26rpx;
		font-weight: bold;
		color: #10B981;
	}

	.result-timestamp {
		font-size: 20rpx;
		color: #8C8C8C;
	}

	.result-dish-image-wrapper {
		width: 100%;
		height: 380rpx;
		border-radius: 24rpx;
		position: relative;
		overflow: hidden;
		margin-bottom: 30rpx;
	}

	.result-dish-img {
		width: 100%;
		height: 100%;
	}

	.result-dish-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%);
		padding: 24rpx;
		box-sizing: border-box;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}

	.result-dish-name {
		font-size: 34rpx;
		font-weight: bold;
		color: #FFFFFF;
	}

	.result-dish-tag {
		background-color: rgba(255,255,255,0.25);
		color: #FFFFFF;
		font-size: 22rpx;
		font-weight: 500;
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
		backdrop-filter: blur(4px);
	}

	.result-details-section {
		padding: 24rpx 0;
		box-sizing: border-box;
	}

	.border-top {
		border-top: 1rpx solid #F2F2F2;
	}

	.result-section-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #1A1A1A;
		margin-bottom: 12rpx;
		display: block;
	}

	.result-desc-text {
		font-size: 26rpx;
		color: #555555;
		line-height: 1.5;
	}

	/* Ingredients formatting list */
	.ingredients-list {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.ingredient-item {
		display: flex;
		justify-content: space-between;
		font-size: 26rpx;
		color: #333333;
		padding: 8rpx 0;
	}

	.ing-name {
		font-weight: 500;
	}

	.ing-weight {
		color: #666666;
	}

	/* Specs tags in results card */
	.result-specs-container {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 12rpx;
	}

	.spec-label {
		font-size: 24rpx;
		color: #555555;
		font-weight: 500;
	}

	.spec-tags {
		display: flex;
		gap: 10rpx;
	}

	.result-specs-container .spec-tag {
		background-color: #E6FBF7;
		color: #10B981;
		font-size: 22rpx;
		font-weight: bold;
		padding: 4rpx 16rpx;
		border-radius: 12rpx;
	}

	/* Steps numbering */
	.result-steps-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		margin-top: 10rpx;
	}

	.result-step-item {
		display: flex;
		gap: 16rpx;
	}

	.step-num-bubble {
		width: 44rpx;
		height: 44rpx;
		background-color: #E6FBF7;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.step-num-bubble text {
		font-size: 24rpx;
		color: #10B981;
		font-weight: bold;
	}

	.step-content-box {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.step-timer-tag {
		display: inline-flex;
		align-view: center;
		gap: 6rpx;
		background-color: #F5F5F5;
		border-radius: 12rpx;
		padding: 4rpx 14rpx;
		align-self: flex-start;
	}

	.svg-timer {
		width: 24rpx;
		height: 24rpx;
	}

	.step-timer-tag text {
		font-size: 20rpx;
		color: #666666;
	}

	/* Quote box style for experience */
	.experience-box-quote {
		background-color: #FFF9F5;
		border-left: 6rpx solid #FF8E42;
		padding: 16rpx 20rpx;
		box-sizing: border-box;
		border-radius: 0 12rpx 12rpx 0;
	}

	.exp-quote-text {
		font-size: 26rpx;
		color: #B25A24;
		line-height: 1.4;
		font-style: italic;
	}

	/* Advanced Info Grid display */
	.advanced-info-grid {
		display: flex;
		justify-content: space-between;
		background-color: #FAFAFA;
		border-radius: 20rpx;
		padding: 20rpx;
		box-sizing: border-box;
		text-align: center;
	}

	.adv-info-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.adv-info-val {
		font-size: 26rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.adv-info-lbl {
		font-size: 20rpx;
		color: #8C8C8C;
	}

	/* Action buttons rows */
	.result-actions-row {
		display: flex;
		gap: 20rpx;
		margin-top: 40rpx;
	}

	.btn-retry {
		flex: 1;
		height: 84rpx;
		border: 2rpx solid #E2E2E2;
		border-radius: 42rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #FFFFFF;
	}

	.btn-retry text {
		font-size: 28rpx;
		color: #666666;
		font-weight: bold;
	}

	.btn-save-kitchen {
		flex: 2;
		height: 84rpx;
		background-color: #10B981;
		border-radius: 42rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6rpx 16rpx rgba(16, 185, 129, 0.2);
	}

	.btn-save-kitchen text {
		font-size: 28rpx;
		color: #FFFFFF;
		font-weight: bold;
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

	.btn-start-recommend {
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
</style>
