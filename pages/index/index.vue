<template>
	<view class="page-container" :class="['tab-' + currentTabbar, { 'tutorial-active': tutorialStep > 0 }]">
		<!-- Header Banner for Kitchen Tab -->
		<view class="header-banner" v-if="currentTabbar === 'kitchen'">
			<image class="banner-bg" src="/static/kitchen_banner.png" mode="aspectFill"></image>
			<view class="banner-mask"></view>
			
			<!-- Custom Status Bar and Nav Bar -->
			<view class="status-bar"></view>
			<view class="nav-bar">
				<view class="capsule-menu">
					<view class="capsule-dots">
						<view class="dot"></view>
						<view class="dot"></view>
						<view class="dot"></view>
					</view>
					<view class="capsule-divider"></view>
					<view class="capsule-minus"></view>
					<view class="capsule-divider"></view>
					<view class="capsule-circle">
						<view class="circle-inner"></view>
					</view>
				</view>
			</view>
		</view>

		<!-- Header Banner for Order Tab -->
		<view class="header-banner order-header" v-else-if="currentTabbar === 'order'">
			<view class="order-header-bg"></view>
			<view class="order-dash-line"></view>
			<view class="order-spark order-spark-top"></view>
			<view class="order-leaf order-leaf-left"></view>
			<view class="order-leaf order-leaf-right"></view>
			<view class="order-heart order-heart-top"></view>
			<view class="status-bar"></view>
			<view class="nav-bar order-nav">
				<view class="order-nav-left">
					<!-- 订单筛选/日期选择：无后端支撑，暂隐藏 -->
					<view class="filter-dropdown" v-if="false">
						<text class="filter-text">{{ orderWho }}</text>
						<text class="filter-arrow"></text>
					</view>
					<view class="filter-dropdown" v-if="false">
						<text class="filter-text">{{ orderType }}</text>
						<text class="filter-arrow"></text>
					</view>
					<view class="date-picker-btn" v-if="false">
						<text class="date-text">请选择日期</text>
					</view>
				</view>
				<view class="capsule-menu light-capsule">
					<view class="capsule-dots">
						<view class="dot"></view>
						<view class="dot"></view>
						<view class="dot"></view>
					</view>
					<view class="capsule-divider"></view>
					<view class="capsule-minus"></view>
					<view class="capsule-divider"></view>
					<view class="capsule-circle">
						<view class="circle-inner"></view>
					</view>
				</view>
			</view>
		</view>

		<!-- Header Banner for Discover Tab -->
		<view class="header-banner discover-header" v-else-if="currentTabbar === 'discover'">
			<view class="discover-header-bg"></view>
			<view class="status-bar"></view>
			<view class="nav-bar discover-nav">
				<view class="discover-nav-left">
					<!-- Green location pin icon -->
					<image class="location-icon-img" src="/static/location.svg" mode="aspectFit"></image>
				</view>
				<text class="discover-title-text">分享广场</text>
				<view class="capsule-menu light-capsule">
					<view class="capsule-dots">
						<view class="dot"></view>
						<view class="dot"></view>
						<view class="dot"></view>
					</view>
					<view class="capsule-divider"></view>
					<view class="capsule-minus"></view>
					<view class="capsule-divider"></view>
					<view class="capsule-circle">
						<view class="circle-inner"></view>
					</view>
				</view>
			</view>
		</view>

		<!-- Header Banner for My Tab -->
		<view class="header-banner my-header" v-else-if="currentTabbar === 'my'">
			<view class="my-header-bg"></view>
			<view class="my-bg-circle my-bg-circle-large"></view>
			<view class="my-bg-circle my-bg-circle-small"></view>
			<view class="my-bg-circle my-bg-circle-left"></view>
			<view class="status-bar"></view>
			<view class="nav-bar my-nav">
				<view class="my-title-block">
					<text class="my-main-title">私厨-好饭菜</text>
					<text class="my-sub-title">好好做饭，好好吃饭</text>
				</view>
				<view class="capsule-menu light-capsule my-capsule">
					<view class="capsule-dots">
						<view class="dot"></view>
						<view class="dot"></view>
						<view class="dot"></view>
					</view>
					<view class="capsule-divider"></view>
					<view class="capsule-minus"></view>
					<view class="capsule-divider"></view>
					<view class="capsule-circle">
						<view class="circle-inner"></view>
					</view>
				</view>
			</view>
		</view>

		<!-- Dashboard Card ("我的厨房") - Only on Kitchen tab -->
		<view class="dashboard-card" v-if="currentTabbar === 'kitchen'">
			<view class="card-top-row">
				<image class="kitchen-avatar" src="/static/kitchen_avatar.png" mode="aspectFill"></image>
				<view class="kitchen-info">
					<text class="kitchen-title">{{ kitchenName }}</text>
					<text class="kitchen-subtitle">世间万物，唯有美食不可辜负</text>
				</view>
				<view class="chef-hat-icon-wrapper" @tap="onSettingsTap">
					<image class="svg-chef-hat" src="/static/chef_hat.svg" mode="aspectFit"></image>
				</view>
			</view>
		</view>

		<!-- Tabs & Controls Row - Only on Kitchen tab -->
		<view class="tabs-controls-row" v-if="currentTabbar === 'kitchen'">
			<view class="tabs-container">
				<view class="tab-item" :class="{ active: activeTab === 'private' }" @tap="switchTab('private')">
					<text class="tab-text">私房菜</text>
					<view class="active-indicator" v-if="activeTab === 'private'"></view>
				</view>
				<view class="tab-item" :class="{ active: activeTab === 'today', 'highlight-tutorial': tutorialStep === 4 }" @tap="switchTab('today')">
					<text class="tab-text">今日安排</text>
					<view class="active-indicator" v-if="activeTab === 'today'"></view>
				</view>
			</view>

			<view class="controls-container">
				<view class="control-btn btn-random" v-if="showRandom && dishes.length > 0" @tap="onRandomTap">
					<text>随机选</text>
				</view>
				<!-- 管理 / 添加菜品 已移除：菜品的增改由独立后台管理系统负责，前端只读 -->
				<view class="control-btn btn-search">
					<image class="svg-search" src="/static/search.svg" mode="aspectFit"></image>
					<text>搜索</text>
				</view>
			</view>
		</view>

		<!-- Content View Area -->
		<view class="content-view-area">
			<!-- "厨房" Content Tab View -->
			<view class="tab-content kitchen-content" v-if="currentTabbar === 'kitchen'">
				<!-- "私房菜" Tab View -->
				<view class="tab-content private-content" v-if="activeTab === 'private'">
					<view class="kitchen-category-strip three-level-category-strip">
						<view class="category-strip-marker"></view>
						<scroll-view class="level-one-text-scroll" scroll-x="true" show-scrollbar="false">
							<view
								class="kitchen-category-label"
								:class="{ active: activeKitchenLevelOneId === item.id }"
								v-for="item in kitchenCategoryTree"
								:key="item.id"
								@tap="selectKitchenLevelOne(item)"
							>
								<text>{{ item.name }}</text>
							</view>
						</scroll-view>
						<view class="refresh-action" @tap="onRefreshTap">
							<image class="svg-refresh" :class="{ rotating: isRefreshing }" src="/static/refresh.svg" mode="aspectFit"></image>
						</view>
					</view>

					<view class="kitchen-category-body">
						<view class="kitchen-side-pane">
							<view 
								class="side-category" 
								:class="{ active: activeKitchenLevelTwoId === item.id }" 
								v-for="item in activeKitchenLevelTwoList" 
								:key="item.id"
								@tap="selectKitchenLevelTwo(item)"
							>
								<text>{{ item.name }}</text>
							</view>
							<view class="category-manage" :class="{ 'highlight-tutorial': tutorialStep === 2 }" @tap="onCategoryManageTap">
								<image class="svg-gear" src="/static/gear.svg" mode="aspectFit"></image>
								<text class="category-text">分类管理</text>
							</view>
						</view>
						<view class="kitchen-main-pane">
							<view class="category-main-head" v-if="activeKitchenLevelTwo">
								<text>{{ activeKitchenLevelTwo.name }}</text>
							</view>
							<view class="kitchen-dish-list" v-if="activeKitchenDishes.length > 0">
								<view 
									class="kitchen-dish-card" 
									:class="{ active: activeKitchenDishId === dish.id, selected: isDishSelected(dish.id) }" 
									v-for="dish in activeKitchenDishes" 
									:key="dish.id"
									@tap="toggleSelectDish(dish.id)"
								>
									<image class="kitchen-dish-img" :src="dish.image" mode="aspectFill"></image>
									<view class="kitchen-dish-info">
										<text class="kitchen-dish-name">{{ dish.name }}</text>
										<text class="kitchen-dish-sales">销量 {{ dish.sales || 0 }}</text>
									</view>
									<view class="dish-action-cell">
										<view class="dish-select-btn" @tap.stop="toggleSelectDish(dish.id)">
											<view v-if="isDishSelected(dish.id)" class="select-checkmark"></view>
											<text v-else class="dish-plus-symbol">+</text>
										</view>
									</view>
								</view>
							</view>
							<view class="category-empty-pill" v-else>
								<text>该分类暂无美味~</text>
							</view>
						</view>
					</view>
					
					<!-- Bottom Floating Shopping Cart Panel -->
					<view class="cart-panel" :class="{ 'highlight-tutorial': tutorialStep === 3 }">
						<view class="cart-left">
							<view class="cart-icon-container">
								<image class="svg-cart" src="/static/cart.svg" mode="aspectFit"></image>
								<view class="cart-badge" v-if="selectedDishIds.length > 0">
									<text class="badge-text">{{ selectedDishIds.length }}</text>
								</view>
							</view>
						</view>
						
						<scroll-view class="cart-selected-preview" scroll-x="true" show-scrollbar="false" v-if="selectedKitchenDishes.length > 0">
							<view class="cart-selected-list">
								<view class="cart-selected-pill" v-for="dish in selectedKitchenDishes" :key="dish.id" @tap="toggleSelectDish(dish.id)">
									<text>{{ dish.name }}</text>
								</view>
							</view>
						</scroll-view>
						<view class="cart-empty-preview" v-else>
							<text>请选择菜品</text>
						</view>

						<view class="cart-center">
							<button class="cart-btn btn-invite" open-type="share" hover-class="cart-btn-hover" @tap="onInviteTap">
								<text>邀请下单</text>
							</button>
							<view class="cart-btn btn-done" :class="{ active: selectedDishIds.length > 0 }" @tap="onDoneTap">
								<text>{{ selectedDishIds.length > 0 ? `选好了(${selectedDishIds.length})` : '选好了' }}</text>
							</view>
						</view>
						
						<view class="cart-right">
							<image class="svg-arrow" src="/static/arrow_left.svg" mode="aspectFit"></image>
						</view>
					</view>
				</view>

				<!-- "今日安排" Tab View -->
				<view class="tab-content today-content" v-if="activeTab === 'today'">
					<view class="alert-notice-wrapper">
						<view class="alert-banner">
							<image class="svg-info" src="/static/info.svg" mode="aspectFit"></image>
							<text class="alert-text">今天还没有安排，快去邀请好友/自己下单吧~</text>
						</view>
					</view>
				</view>
			</view>

			<!-- "订单" Content Tab View -->
			<view class="tab-content order-tab-content" v-else-if="currentTabbar === 'order'">
				<!-- Top row holding avocado info and switcher side by side -->
				<view class="order-top-row">
					<view class="order-decor-avocado-card">
						<image class="avocado-img" src="/static/avocado.svg" mode="aspectFit"></image>
						<text class="order-decor-text">一共记录了 <text class="highlight-num">{{ ordersTotal }}</text> 个{{ orderWho }}</text>
					</view>
					<view class="order-sub-tabs" v-if="showDiary">
						<view class="order-sub-tab" :class="{ active: activeOrderSubTab === 'order' }" @tap="switchOrderSubTab('order')">
							<text>订单</text>
						</view>
						<view class="order-sub-tab" :class="{ active: activeOrderSubTab === 'diary' }" @tap="switchOrderSubTab('diary')">
							<text>美食日记</text>
						</view>
					</view>
				</view>

				<!-- 我的订单列表（来自后端） -->
				<view class="my-order-list" v-if="activeOrderSubTab === 'order' && myOrders.length">
					<view class="my-order-card" v-for="o in myOrders" :key="o.id" @tap="onOrderTap(o)">
						<view class="my-order-head">
							<text class="my-order-no">#{{ o.orderNo }}</text>
							<text class="my-order-status" :class="'st-' + o.orderStatus">{{ orderStatusText(o.orderStatus) }}</text>
						</view>
						<view class="my-order-body">
							<text class="my-order-service">{{ serviceTypeText(o.serviceType) }}</text>
							<text class="my-order-amount">￥{{ o.totalAmount }} · {{ o.totalCount }}件</text>
						</view>
						<text class="my-order-time">{{ formatTime(o.createTime) }}</text>
					</view>
				</view>

				<!-- Empty State -->
				<view class="order-empty-state" v-else>
					<image class="order-empty-rabbit-img" src="/static/empty_box_rabbit.png" mode="aspectFit"></image>
					<text class="order-empty-text">还没有订单哦</text>
				</view>

				<!-- Floating decorations (star on the left, calendar on the right) -->
				<text class="order-float-star">★</text>
				<view class="order-float-calendar">
					<image class="float-calendar-img" src="/static/calendar_noodles.svg" mode="aspectFit"></image>
				</view>
			</view>

			<!-- "发现" Content Tab View -->
			<view class="tab-content discover-tab-content" v-else-if="currentTabbar === 'discover'">
				<view class="share-square-hero">
					<view class="share-square-left">
						<view class="share-square-icon">
							<image class="share-square-icon-img" src="/static/discover_explore.svg" mode="aspectFit"></image>
						</view>
						<view class="share-square-copy">
							<text class="share-square-name">分享广场</text>
							<text class="share-square-desc">做完菜了，把成品晒到这里</text>
						</view>
					</view>
					<view class="share-publish-btn" @tap="onPublishResultTap">
						<text>发布成品</text>
					</view>
				</view>

				<view class="share-composer" @tap="onPublishResultTap">
					<image class="share-composer-avatar" src="/static/kitchen_avatar.png" mode="aspectFill"></image>
					<view class="share-composer-placeholder">
						<text>今天做了什么好菜？</text>
					</view>
					<image class="share-composer-camera" src="/static/camera.svg" mode="aspectFit"></image>
				</view>

				<view class="share-feed-list">
					<view class="share-post-card" v-for="post in shareSquarePosts" :key="post.id">
						<view class="share-post-head">
							<image class="share-post-avatar" :src="post.avatar" mode="aspectFill"></image>
							<view class="share-post-user">
								<text class="share-post-name">{{ post.author }}</text>
								<text class="share-post-time">{{ post.time }}</text>
							</view>
						</view>
						<text class="share-post-title">{{ post.title }}</text>
						<text class="share-post-content">{{ post.content }}</text>
						<image class="share-post-img" :src="post.image" mode="aspectFill"></image>
						<view class="share-post-tags">
							<view class="share-post-tag" v-for="tag in post.tags" :key="tag">
								<text>{{ tag }}</text>
							</view>
						</view>
						<view class="share-post-actions">
							<view class="share-action" @tap="toggleSharePostLike(post.id)">
								<text class="share-action-icon">{{ post.liked ? '已赞' : '点赞' }}</text>
								<text>{{ post.likes }}</text>
							</view>
							<view class="share-action" @tap="onCommentPostTap(post)">
								<text class="share-action-icon">评论</text>
								<text>{{ post.comments }}</text>
							</view>
							<view class="share-action" @tap="onSharePostTap(post)">
								<text class="share-action-icon">转发</text>
							</view>
						</view>
					</view>
					<view class="share-empty-state" v-if="!shareSquarePosts.length">
						<text class="share-empty-text">还没有成品分享</text>
					</view>
				</view>
			</view>

			<!-- "我的" Content Tab View -->
			<view class="tab-content my-tab-content" v-else-if="currentTabbar === 'my'">
				<!-- Profile Info Card -->
				<view class="my-profile-card">
					<view class="profile-left-col">
						<image class="my-profile-avatar" src="/static/kitchen_avatar.png" mode="aspectFill"></image>
						<view class="profile-names">
							<view class="profile-username-row">
								<text class="profile-username">御厨9061</text>
								<image class="username-edit-pen-img" src="/static/edit_green.svg" mode="aspectFit"></image>
							</view>
							<view class="profile-user-id-row" @tap="copyUserCode">
								<text class="profile-user-id">ID: 8115*******9061</text>
								<image class="username-copy-btn-img" src="/static/copy_gray.svg" mode="aspectFit"></image>
							</view>
						</view>
					</view>
					<view class="profile-carrot-badge">
						<text class="carrot-emoji">🥕</text>
						<text class="carrot-amount-num">0</text>
					</view>
				</view>

				<!-- Grid swiper menu -->
				<view class="my-swiper-menu-box">
					<swiper class="my-menu-swiper" :indicator-dots="false" @change="onSwiperChange">
						<!-- Slide 1 -->
						<swiper-item>
							<view class="my-grid-layout">
								<!-- Feature 1: 美食日历 -->
								<view class="my-grid-item-cell" @tap="onMyMenuTap('美食日历')" v-if="showDiary">
									<view class="my-grid-icon-circle soft-bg-mint">
										<image class="my-grid-svg" src="/static/my_calendar.svg" mode="aspectFit"></image>
									</view>
									<text class="my-grid-item-label">美食日历</text>
								</view>
								
								<!-- Feature 2: 饮食计划（无后端支撑，暂隐藏） -->
								<view class="my-grid-item-cell" v-if="false">
									<view class="my-grid-icon-circle soft-bg-mint">
										<image class="my-grid-svg" src="/static/my_plan.svg" mode="aspectFit"></image>
									</view>
									<text class="my-grid-item-label">饮食计划</text>
								</view>
							</view>
						</swiper-item>
					</swiper>

					<!-- Page indicator dots -->
					<view class="my-swiper-dots single-dot">
						<view class="my-indicator-dot" :class="{ active: myGridPageIndex === 0 }"></view>
					</view>
				</view>

				<!-- Contribution Activity card -->
				<view class="my-activity-wall-card">
					<view class="activity-wall-header">
						<text class="activity-wall-title">厨房动态墙</text>
						<image class="activity-wall-help-icon" src="/static/question_circle.svg" mode="aspectFit"></image>
					</view>

					<view class="activity-wall-months-labels">
						<text class="month-txt-label">月</text>
						<text class="month-txt-label">2月</text>
						<text class="month-txt-label">3月</text>
						<text class="month-txt-label">4月</text>
						<text class="month-txt-label">5月</text>
						<text class="month-txt-label">6月</text>
					</view>

					<view class="activity-wall-squares-grid">
						<view 
							class="activity-wall-square" 
							v-for="(level, idx) in activityCells" 
							:key="idx"
							:class="'square-lvl-' + level"
						></view>
					</view>
				</view>

				<!-- Subscription Notice（订阅通知：无后端支撑，暂隐藏） -->
				<view class="my-sub-notice-row" v-if="false">
					<view class="sub-notice-left-side">
						<image class="bell-alert-icon" src="/static/discover_bell.svg" mode="aspectFit"></image>
						<view class="sub-notice-text-content">
							<text class="sub-notice-main-text">订阅通知</text>
							<text class="sub-notice-sub-text">点击增加消息通知次数</text>
						</view>
					</view>
					<view class="sub-notice-right-side">
						<text class="sub-notice-status-lbl">未开启</text>
						<text class="sub-notice-arrow-icon">›</text>
					</view>
				</view>

				<!-- Bottom Watermark -->
				<view class="my-footer-watermark-row">
					<text class="footer-watermark-text">以御膳之礼.. 待日常三餐</text>
				</view>
			</view>
		</view>

		<!-- Fixed Bottom Tab Bar -->
		<view class="bottom-tab-bar">
			<view class="tab-bar-item" :class="{ active: currentTabbar === 'kitchen' }" @tap="switchTabbar('kitchen')">
				<image class="tabbar-icon" :src="currentTabbar === 'kitchen' ? '/static/tab_kitchen_active.svg' : '/static/tab_kitchen.svg'" mode="aspectFit"></image>
				<text class="tabbar-text">厨房</text>
			</view>
			
			<view class="tab-bar-item" :class="{ active: currentTabbar === 'order' }" @tap="switchTabbar('order')">
				<image class="tabbar-icon" :src="currentTabbar === 'order' ? '/static/tab_order_active.svg' : '/static/tab_order.svg'" mode="aspectFit"></image>
				<text class="tabbar-text">订单</text>
			</view>
			
			<view class="tab-bar-item" :class="{ active: currentTabbar === 'discover' }" @tap="switchTabbar('discover')">
				<view class="tabbar-icon-container">
					<image class="tabbar-icon" :src="currentTabbar === 'discover' ? '/static/tab_discover_active.svg' : '/static/tab_discover.svg'" mode="aspectFit"></image>
					<view class="badge-dot"></view>
				</view>
				<text class="tabbar-text">发现</text>
			</view>
			
			<view class="tab-bar-item" :class="{ active: currentTabbar === 'my' }" @tap="switchTabbar('my')">
				<image class="tabbar-icon" :src="currentTabbar === 'my' ? '/static/tab_my_active.svg' : '/static/tab_my.svg'" mode="aspectFit"></image>
				<text class="tabbar-text">我的</text>
			</view>
		</view>

		<!-- Interactive Tutorial Overlay (Dimmed Backdrop) -->
		<view class="tutorial-backdrop" v-if="tutorialStep > 0 && currentTabbar === 'kitchen'" @tap="skipTutorial"></view>

		<!-- Tutorial Tooltip Bubble -->
		<view class="tutorial-tooltip-container" :class="'step-' + tutorialStep" v-if="tutorialStep > 0 && currentTabbar === 'kitchen'">
			<!-- Step 1 Tooltip -->
			<view class="tooltip-bubble bubble-step-1" v-if="tutorialStep === 1">
				<view class="tooltip-content">
					<text class="tooltip-text">点击这里开始添加您的第一道美味</text>
					<view class="tooltip-action-btn" @tap.stop="nextTutorialStep">
						<text>下一步(1/4)</text>
					</view>
				</view>
				<view class="tooltip-arrow arrow-up-right"></view>
			</view>

			<!-- Step 2 Tooltip -->
			<view class="tooltip-bubble bubble-step-2" v-if="tutorialStep === 2">
				<view class="tooltip-content">
					<text class="tooltip-text">可以在这里对您的菜品进行快捷分类管理哦~</text>
					<view class="tooltip-action-btn" @tap.stop="nextTutorialStep">
						<text>下一步(2/4)</text>
					</view>
				</view>
				<view class="tooltip-arrow arrow-up-left"></view>
			</view>

			<!-- Step 3 Tooltip -->
			<view class="tooltip-bubble bubble-step-3" v-if="tutorialStep === 3">
				<view class="tooltip-arrow arrow-down-left"></view>
				<view class="tooltip-content">
					<text class="tooltip-text">选好菜品后，在这里可以一键邀请好友或自己下单~</text>
					<view class="tooltip-action-btn" @tap.stop="nextTutorialStep">
						<text>下一步(3/4)</text>
					</view>
				</view>
			</view>

			<!-- Step 4 Tooltip -->
			<view class="tooltip-bubble bubble-step-4" v-if="tutorialStep === 4">
				<view class="tooltip-content">
					<text class="tooltip-text">在这里可以查看并规划您今天的用餐安排哦~</text>
					<view class="tooltip-action-btn" @tap.stop="nextTutorialStep">
						<text>完成(4/4)</text>
					</view>
				</view>
				<view class="tooltip-arrow arrow-up-left-tab"></view>
			</view>
		</view>

		<!-- Bottom Drawer Sheet for Add Dishes -->
		<view class="drawer-backdrop" v-if="showAddDrawer" @tap="closeAddDrawer"></view>
		<view class="drawer-panel" :class="{ open: showAddDrawer }">
			<view class="drawer-header">
				<text class="drawer-title">添加菜品</text>
				<view class="drawer-close-bar"></view>
			</view>
			
			<view class="drawer-options-list">
				<!-- Option 1: 去分享广场找灵感 -->
				<view class="drawer-option-item" @tap="goExplore">
					<view class="option-icon-bg bg-steal">
						<image class="option-icon" src="/static/steal_bag.svg" mode="aspectFit"></image>
					</view>
					<view class="option-content">
						<view class="option-title-row">
							<text class="option-title">去分享广场找灵感</text>
							<view class="option-badge bg-red">推荐</view>
						</view>
						<text class="option-desc">海量菜品任你挑选</text>
					</view>
					<image class="option-chevron" src="/static/arrow_left.svg" mode="aspectFit"></image>
				</view>
				
				<!-- Option 2: 快速手动添加 -->
				<view class="drawer-option-item" @tap="quickAdd">
					<view class="option-icon-bg bg-quick">
						<image class="option-icon" src="/static/lightning.svg" mode="aspectFit"></image>
					</view>
					<view class="option-content">
						<view class="option-title-row">
							<text class="option-title">快速手动添加</text>
							<view class="option-badge bg-red">最多人选择</view>
						</view>
						<text class="option-desc">快速添加多款拿手好菜</text>
					</view>
					<image class="option-chevron" src="/static/arrow_left.svg" mode="aspectFit"></image>
				</view>
				
				<!-- Option 3: 详细手动添加 -->
				<view class="drawer-option-item" @tap="detailedAdd">
					<view class="option-icon-bg bg-detailed">
						<image class="option-icon" src="/static/detail_edit.svg" mode="aspectFit"></image>
					</view>
					<view class="option-content">
						<view class="option-title-row">
							<text class="option-title">详细手动添加</text>
						</view>
						<text class="option-desc">详细记录你的拿手好菜</text>
					</view>
					<image class="option-chevron" src="/static/arrow_left.svg" mode="aspectFit"></image>
				</view>
				
				<!-- Option 4: 菜谱推荐 -->
				<view class="drawer-option-item" @tap="recommendAdd">
					<view class="option-icon-bg bg-recommend">
						<image class="option-icon" src="/static/magic_wand.svg" mode="aspectFit"></image>
					</view>
					<view class="option-content">
						<view class="option-title-row">
							<text class="option-title">菜谱推荐</text>
							<view class="option-badge bg-blue">智能</view>
						</view>
						<text class="option-desc">输入任意内容，一键推荐菜谱</text>
					</view>
					<image class="option-chevron" src="/static/arrow_left.svg" mode="aspectFit"></image>
				</view>
				
				<!-- Option 5: 轻松导入菜品 
				<view class="drawer-option-item" @tap="easyImport">
					<view class="option-icon-bg bg-import">
						<image class="option-icon" src="/static/import_dish.svg" mode="aspectFit"></image>
					</view>
					<view class="option-content">
						<view class="option-title-row">
							<text class="option-title">轻松导入菜品</text>
						</view>
						<text class="option-desc">一键导入[小红书/下厨房]菜品</text>
					</view>
					<image class="option-chevron" src="/static/arrow_left.svg" mode="aspectFit"></image>
				</view>
				-->
			</view>
			
			<!-- Cancel Button -->
			<view class="drawer-cancel-btn" @tap="closeAddDrawer">
				<text>取消</text>
			</view>
		</view>

		<!-- 进入小程序的公告弹窗 -->
		<view class="announce-backdrop" v-if="showAnnouncement" @tap="closeAnnouncement"></view>
		<view class="announce-popup" v-if="showAnnouncement">
			<view class="announce-head">
				<text class="announce-title">{{ announcement.title }}</text>
			</view>
			<scroll-view class="announce-body" scroll-y>
				<text class="announce-line" v-for="(line, idx) in announcement.lines" :key="idx">{{ line }}</text>
			</scroll-view>
			<view class="announce-never" @tap="toggleAnnounceNever">
				<view class="announce-check" :class="{ checked: announceNever }">
					<text v-if="announceNever">✓</text>
				</view>
				<text class="announce-never-text">不再提示</text>
			</view>
			<view class="announce-btn" @tap="closeAnnouncement">
				<text>我知道了</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { apiCategoryTree } from '@/api/category.js'
	import { apiDishList } from '@/api/dish.js'
	import { apiShareList, apiShareLike, apiSharePublish } from '@/api/share.js'
	import { apiCommentAdd } from '@/api/comment.js'
	import { apiShopInfo } from '@/api/shop.js'
	import { apiMyOrders } from '@/api/order.js'
	import { ensureLogin } from '@/utils/login.js'
	import { getToken } from '@/utils/auth.js'
	import { uploadFile } from '@/utils/request.js'

	export default {
		data() {
			return {
				activeTab: 'private',     // 'private' | 'today'
				currentTabbar: 'kitchen', // 'kitchen' | 'order' | 'discover' | 'my'
				tutorialStep: 0,          // 0 to 4 (onboarding)
				isRefreshing: false,
				showAddDrawer: false,
				dishes: [],
				selectedDishIds: [],
				pendingInviteDishIds: [],
				shopInfo: null,
				myOrders: [],
				ordersTotal: 0,
				activeOrderSubTab: 'order', // 'order' | 'diary'
				myGridPageIndex: 0,
				activityCells: [],
				// 分享广场：完全靠 loadShareSquare 填充；为空显示空状态
				shareSquarePosts: [],
				activeKitchenLevelOneId: '',
				activeKitchenLevelTwoId: '',
				activeKitchenDishId: '',
				// 分类树：靠 loadCategoryTree 填充；失败即保持空
				kitchenCategoryTree: [],
				
				// Settings state
				kitchenName: '我的厨房',
				showDiary: true,
				showRandom: true,
				orderWho: '订单',
				orderType: '全部',

				// 进入小程序的公告弹窗（内容由后端 shop 下发）
				showAnnouncement: false,
				announceNever: false,
				announcement: {
					id: '',
					title: '',
					lines: []
				}
			}
		},
		computed: {
			activeKitchenLevelOne() {
				return this.kitchenCategoryTree.find(item => item.id === this.activeKitchenLevelOneId) || this.kitchenCategoryTree[0] || null;
			},
			activeKitchenLevelTwoList() {
				return this.activeKitchenLevelOne ? (this.activeKitchenLevelOne.children || []) : [];
			},
			activeKitchenLevelTwo() {
				return this.activeKitchenLevelTwoList.find(item => item.id === this.activeKitchenLevelTwoId) || this.activeKitchenLevelTwoList[0] || null;
			},
			activeKitchenDishes() {
				return this.activeKitchenLevelTwo ? (this.activeKitchenLevelTwo.dishes || []) : [];
			},
			activeKitchenDish() {
				return this.activeKitchenDishes.find(item => item.id === this.activeKitchenDishId) || this.activeKitchenDishes[0] || null;
			},
			flatKitchenDishes() {
				const dishes = [];
				this.kitchenCategoryTree.forEach(levelOne => {
					(levelOne.children || []).forEach(levelTwo => {
						(levelTwo.dishes || []).forEach(dish => {
							dishes.push({
								...dish,
								levelOneName: levelOne.name,
								levelTwoName: levelTwo.name
							});
						});
					});
				});
				return dishes;
			},
			selectedKitchenDishes() {
				return this.selectedDishIds
					.map(id => this.flatKitchenDishes.find(dish => String(dish.id) === String(id)))
					.filter(Boolean);
			}
		},
		onLoad(options = {}) {
			this.tutorialStep = 0;
			this.generateActivityCells();
			this.applyInviteOptions(options);
		},
		onShow() {
			if (!getToken()) {
				ensureLogin().catch(() => {})
				return
			}
			this.loadSelectedDishIds();
			this.loadDishes();
			this.loadSettings();
			// 三端互通：拉取后端真实数据（失败/为空显示空状态，不回退假数据）
			this.loadCategoryTree();
			this.loadShareSquare();
			this.loadShopInfo();
			this.loadMyOrders();
		},
		onShareAppMessage() {
			return this.buildInviteSharePayload();
		},
		onShareTimeline() {
			const payload = this.buildInviteSharePayload();
			const query = payload.path.indexOf('?') > -1 ? payload.path.split('?')[1] : '';
			return {
				title: payload.title,
				query,
				imageUrl: payload.imageUrl
			};
		},
		methods: {
			// ==== 后端数据对接 ====
			async loadCategoryTree() {
				try {
					const [treeRes, dishRes] = await Promise.all([
						apiCategoryTree(),
						apiDishList({ pageNum: 1, pageSize: 500 })
					]);
					const cats = (treeRes && treeRes.data) || [];
					const dishes = (dishRes && dishRes.rows) || [];
					const tree = this.buildBrowseTree(cats, dishes);
					if (tree.length) {
						this.kitchenCategoryTree = tree;
						const l1 = tree[0];
						this.activeKitchenLevelOneId = l1.id;
						const l2 = (l1.children || [])[0];
						this.activeKitchenLevelTwoId = l2 ? l2.id : '';
						const d0 = l2 && l2.dishes ? l2.dishes[0] : null;
						this.activeKitchenDishId = d0 ? d0.id : '';
					}
				} catch (e) {
					// 失败即保持空，不回退假数据
					console.error('loadCategoryTree failed', e);
				}
			},
			buildBrowseTree(cats, dishes) {
				const dishMap = {};
				dishes.forEach(d => {
					const cid = d.categoryId;
					if (!dishMap[cid]) dishMap[cid] = [];
					dishMap[cid].push({
						id: d.id,
						name: d.dishName,
						desc: d.story || (d.categoryName ? '· ' + d.categoryName : ''),
						image: d.cover || '/static/onion_chicken.png',
						sales: d.sales || 0
					});
				});
				const collectDishes = (node) => {
					let arr = (dishMap[node.id] || []).slice();
					(node.children || []).forEach(c => { arr = arr.concat(collectDishes(c)); });
					return arr;
				};
				return (cats || []).map(l1 => {
					let children = (l1.children || []).map(l2 => ({
						id: l2.id,
						name: l2.catName,
						dishes: collectDishes(l2)
					}));
					if (!children.length) {
						children = [{ id: l1.id, name: l1.catName, dishes: dishMap[l1.id] || [] }];
					}
					return {
						id: l1.id,
						name: l1.catName,
						image: l1.image || '/static/onion_chicken.png',
						children
					};
				});
			},
			async loadShareSquare() {
				try {
					const res = await apiShareList({ pageNum: 1, pageSize: 20 });
					const rows = (res && res.rows) || [];
					this.shareSquarePosts = rows.map(p => ({
						id: p.id,
						author: p.userNickname || '小兔子用户',
						avatar: p.userAvatar || '/static/kitchen_avatar.png',
						time: this.formatTime(p.createTime),
						title: p.title || '',
						content: p.content || '',
						image: (p.images ? p.images.split(',')[0] : '') || '/static/onion_chicken.png',
						tags: p.tags ? p.tags.split(',').filter(Boolean) : [],
						likes: p.likeCount || 0,
						comments: p.commentCount || 0,
						liked: !!p.liked
					}));
				} catch (e) {}
			},
			async loadShopInfo() {
				try {
					const res = await apiShopInfo();
					const shop = res && res.data;
					if (!shop) return;
					this.shopInfo = shop;
					if (shop.shopName && !uni.getStorageSync('kitchenName')) {
						this.kitchenName = shop.shopName;
					}
					// 公告：内容来自后端 shop.announceEnabled/announceTitle/announceContent
					this.announcement = {
						id: shop.announceTitle || '',
						title: shop.announceTitle || '',
						lines: shop.announceContent ? String(shop.announceContent).split('\n') : [],
						enabled: shop.announceEnabled
					};
					this.maybeShowAnnouncement();
				} catch (e) {}
			},
			async loadMyOrders() {
				try {
					await ensureLogin();
					const res = await apiMyOrders({ pageNum: 1, pageSize: 50 });
					this.myOrders = (res && res.rows) || [];
					this.ordersTotal = (res && res.total) || 0;
				} catch (e) {}
			},
			formatTime(t) {
				if (!t) return '';
				// 后端返回 "yyyy-MM-dd HH:mm:ss"，展示到分钟
				return String(t).slice(0, 16).replace('T', ' ');
			},
			serviceTypeText(t) {
				return { '0': '同城配送', '1': '厨师代炒', '2': '店内自提' }[t] || '—';
			},
			orderStatusText(s) {
				return { '0': '待处理', '1': '已接单', '2': '制作中', '3': '已完成', '4': '已取消' }[s] || '—';
			},
			onOrderTap(order) {
				uni.showToast({ title: '订单 ' + (order.orderNo || ''), icon: 'none' });
			},
			maybeShowAnnouncement() {
				// 公告开关由后端下发（announceEnabled==='0' 则不弹）
				if (this.announcement.enabled === '0') {
					return;
				}
				if (!this.announcement.lines || !this.announcement.lines.length) {
					return;
				}
				const dismissedId = uni.getStorageSync('announcement_dismissed');
				if (dismissedId && dismissedId === this.announcement.id) {
					return; // 用户对这条公告点过“不再提示”
				}
				this.showAnnouncement = true;
			},
			toggleAnnounceNever() {
				this.announceNever = !this.announceNever;
			},
			closeAnnouncement() {
				if (this.announceNever) {
					uni.setStorageSync('announcement_dismissed', this.announcement.id);
				}
				this.showAnnouncement = false;
			},
			generateActivityCells() {
				// Generate an empty contribution wall like the reference screen.
				const cells = [];
				for (let i = 0; i < 168; i++) {
					let lvl = 0;
					cells.push(lvl);
				}
				this.activityCells = cells;
			},
			loadDishes() {
				this.dishes = uni.getStorageSync('dishes') || [];
			},
			loadSelectedDishIds() {
				const cached = uni.getStorageSync('selectedDishIds');
				this.selectedDishIds = Array.isArray(cached) ? cached : [];
			},
			normalizeInviteIds(value) {
				const raw = Array.isArray(value) ? value.join(',') : String(value || '');
				let decoded = raw;
				try {
					decoded = decodeURIComponent(raw);
				} catch (e) {}
				const seen = {};
				return decoded
					.split(',')
					.map(item => item.trim())
					.filter(Boolean)
					.filter(id => {
						const key = String(id);
						if (seen[key]) return false;
						seen[key] = true;
						return true;
					})
					.slice(0, 50);
			},
			applyInviteOptions(options = {}) {
				const ids = this.normalizeInviteIds(options.ids || options.dishIds);
				if (!ids.length) return;
				this.pendingInviteDishIds = ids;
				this.selectedDishIds = ids;
				uni.setStorageSync('selectedDishIds', ids);
				uni.showToast({
					title: `已带入${ids.length}道邀请菜品`,
					icon: 'none'
				});
			},
			buildInviteSharePayload() {
				const ids = this.normalizeInviteIds(this.selectedDishIds);
				const shopName = (this.shopInfo && this.shopInfo.shopName) || this.kitchenName || '小兔子厨房';
				const selectedNames = this.selectedKitchenDishes
					.map(dish => dish.name)
					.filter(Boolean)
					.slice(0, 2)
					.join('、');
				const title = ids.length
					? (selectedNames ? `${shopName}邀请你一起吃：${selectedNames}` : `${shopName}已选${ids.length}道菜，来一起下单`)
					: `${shopName}邀请你一起点菜`;
				const firstDish = this.selectedKitchenDishes[0] || {};
				const imageUrl = firstDish.image
					|| (this.shopInfo && (this.shopInfo.cover || this.shopInfo.coverImage || this.shopInfo.logo || this.shopInfo.shopLogo))
					|| '/static/kitchen_banner.png';
				const query = ids.length ? `from=invite&ids=${encodeURIComponent(ids.join(','))}` : 'from=invite';
				return {
					title,
					path: `/pages/index/index?${query}`,
					imageUrl
				};
			},
			isDishSelected(id) {
				return this.selectedDishIds.some(item => String(item) === String(id));
			},
			toggleSelectDish(id) {
				const idx = this.selectedDishIds.findIndex(item => String(item) === String(id));
				if (idx > -1) {
					this.selectedDishIds.splice(idx, 1);
				} else {
					this.selectedDishIds.push(id);
				}
				this.activeKitchenDishId = id;
				uni.setStorageSync('selectedDishIds', this.selectedDishIds);
			},
			selectKitchenLevelOne(item) {
				if (!item) return;
				this.activeKitchenLevelOneId = item.id;
				const firstLevelTwo = (item.children || [])[0];
				this.activeKitchenLevelTwoId = firstLevelTwo ? firstLevelTwo.id : '';
				const firstDish = firstLevelTwo && firstLevelTwo.dishes ? firstLevelTwo.dishes[0] : null;
				this.activeKitchenDishId = firstDish ? firstDish.id : '';
			},
			selectKitchenLevelTwo(item) {
				if (!item) return;
				this.activeKitchenLevelTwoId = item.id;
				const firstDish = (item.dishes || [])[0];
				this.activeKitchenDishId = firstDish ? firstDish.id : '';
			},
			selectKitchenDish(dish) {
				if (!dish) return;
				this.activeKitchenDishId = dish.id;
			},
			switchTab(tab) {
				if (this.tutorialStep > 0 && this.tutorialStep !== 4) return; // Prevent tab switching during other tutorial steps
				this.activeTab = tab;
				if (tab === 'today' && this.tutorialStep === 4) {
					// Complete the tutorial
					this.tutorialStep = 0;
				}
			},
			onSettingsTap() {
				if (this.tutorialStep > 0) return;
				uni.navigateTo({
					url: '/pages/kitchen-settings/kitchen-settings'
				});
			},
			onCategoryManageTap() {
				if (this.tutorialStep > 0) {
					if (this.tutorialStep === 2) {
						this.nextTutorialStep();
					}
					return;
				}
				uni.navigateTo({
					url: '/pages/category-manage/category-manage'
				});
			},
			switchTabbar(tabbar) {
				if (this.tutorialStep > 0) return; // Prevent switching tabbar during tutorial
				this.currentTabbar = tabbar;
			},
			onAddDishTap() {
				if (this.tutorialStep === 1) {
					this.nextTutorialStep();
				} else {
					this.showAddDrawer = true;
				}
			},
			closeAddDrawer() {
				this.showAddDrawer = false;
			},
			goExplore() {
				this.closeAddDrawer();
				this.currentTabbar = 'discover';
			},
			quickAdd() {
				this.closeAddDrawer();
				uni.navigateTo({
					url: '/pages/quick-add/quick-add'
				});
			},
			detailedAdd() {
				this.closeAddDrawer();
				uni.navigateTo({
					url: '/pages/detailed-add/detailed-add'
				});
			},
			recommendAdd() {
				this.closeAddDrawer();
				uni.navigateTo({
					url: '/pages/recipe-recommend/recipe-recommend'
				});
			},
			onInviteTap() {
				const payload = this.buildInviteSharePayload();
				uni.setStorageSync('lastInviteSharePayload', payload);
				// #ifndef MP-WEIXIN
				uni.setClipboardData({
					data: `${payload.title}\n${payload.path}`,
					success: () => {
						uni.showToast({ title: '邀请文案已复制', icon: 'none' });
					}
				});
				// #endif
			},
			onDoneTap() {
				if (this.selectedDishIds.length === 0) return;
				const selectedDish = this.selectedKitchenDishes[0] || this.activeKitchenDish || {};
				const selectedName = encodeURIComponent(selectedDish.name || '炖猪脚');
				const selectedImage = encodeURIComponent(selectedDish.image || '/static/onion_chicken.png');
				const ids = this.selectedDishIds.join(',');
				uni.navigateTo({
					url: `/pages/submit-order/submit-order?count=${this.selectedDishIds.length}&name=${selectedName}&image=${selectedImage}&ids=${ids}`
				});
			},
			onRefreshTap() {
				if (this.isRefreshing) return;
				this.isRefreshing = true;
				uni.showToast({
					title: '正在刷新菜品',
					icon: 'loading',
					duration: 800
				});
				setTimeout(() => {
					this.isRefreshing = false;
					this.loadDishes();
				}, 1000);
			},
			nextTutorialStep() {
				if (this.tutorialStep === 1) {
					this.tutorialStep = 2;
				} else if (this.tutorialStep === 2) {
					this.tutorialStep = 3;
				} else if (this.tutorialStep === 3) {
					this.tutorialStep = 4;
					this.activeTab = 'private'; // Keep private tab to highlight today tab
				} else if (this.tutorialStep === 4) {
					// Finalize tutorial
					this.activeTab = 'today'; // Switch to today's arrangement to show the content of that tab
					this.tutorialStep = 0;
					uni.showToast({
						title: '新手引导完成！',
						icon: 'success'
					});
				}
			},
			skipTutorial() {
				this.tutorialStep = 0;
				uni.showToast({
					title: '已跳过引导',
					icon: 'none'
				});
			},
			
			// Order page methods
			switchOrderSubTab(tab) {
				this.activeOrderSubTab = tab;
			},

			// Discover page methods
			async onPublishResultTap() {
				try {
					await ensureLogin();
				} catch (e) {
					uni.showToast({ title: '请先登录后再发布', icon: 'none' });
					return;
				}
				uni.chooseImage({
					count: 1,
					success: (imgRes) => {
						const path = imgRes.tempFilePaths && imgRes.tempFilePaths[0];
						if (!path) return;
						uploadFile(path).then((up) => {
							const imageUrl = up.url;
							uni.showModal({
								title: '发布成品',
								editable: true,
								placeholderText: '说说这道菜的故事…',
								success: (m) => {
									if (!m.confirm) return;
									const content = (m.content || '').trim();
									apiSharePublish({
										title: content.slice(0, 20) || '我的成品',
										content: content,
										images: imageUrl
									}).then(() => {
										uni.showToast({ title: '发布成功，等待审核', icon: 'none' });
										this.loadShareSquare();
									}).catch(() => {});
								}
							});
						}).catch(() => {});
					}
				});
			},
			toggleSharePostLike(id) {
				const post = this.shareSquarePosts.find(item => item.id === id);
				if (!post) return;
				// 仅真实后端动态(id 为数字)可点赞，用后端返回的 liked 决定 UI
				if (typeof id !== 'number') return;
				ensureLogin().then(() => apiShareLike(id)).then((res) => {
					const liked = !!(res && res.data && res.data.liked);
					if (post.liked === liked) return;
					post.liked = liked;
					post.likes += liked ? 1 : -1;
				}).catch(() => {});
			},
			onCommentPostTap(post) {
				// 仅真实后端动态(id 为数字)可评论
				if (!post || typeof post.id !== 'number') return;
				uni.showModal({
					title: '发表评论',
					editable: true,
					placeholderText: '写下你的评论…',
					success: (m) => {
						if (!m.confirm) return;
						const content = (m.content || '').trim();
						if (!content) return;
						ensureLogin()
							.then(() => apiCommentAdd({ postId: post.id, content }))
							.then((res) => {
								const audited = res && res.data && res.data.status === '1';
								if (audited === false) {
									uni.showToast({ title: '评论已提交，待审核', icon: 'none' });
								} else {
									post.comments++;
									uni.showToast({ title: '评论成功', icon: 'none' });
								}
							})
							.catch(() => {});
					}
				});
			},
			onSharePostTap(post) {
				uni.setClipboardData({
					data: '「小兔子厨房」看到一道好菜：' + (post && post.title ? post.title : '成品分享'),
					success: () => {
						uni.showToast({ title: '已复制分享文案', icon: 'none' });
					}
				});
			},

			// My page methods
			copyUserCode() {
				uni.setClipboardData({
					data: '811576459061',
					success: () => {
						uni.showToast({ title: 'ID已复制', icon: 'success' });
					}
				});
			},
			onSwiperChange(e) {
				this.myGridPageIndex = e.detail.current;
			},
			onMyMenuTap(name) {
				if (name === '美食日历') {
					if (!this.showDiary) {
						uni.showToast({ title: '美食日历功能已关闭', icon: 'none' });
						return;
					}
					this.currentTabbar = 'order';
					this.activeOrderSubTab = 'diary';
				}
			},
			loadSettings() {
				this.kitchenName = uni.getStorageSync('kitchenName') || '我的厨房';
				this.showDiary = uni.getStorageSync('showDiary') !== false;
				this.showRandom = uni.getStorageSync('showRandom') !== false;
			},
			onRandomTap() {
				if (this.dishes.length === 0) return;
				const randomIndex = Math.floor(Math.random() * this.dishes.length);
				const selectedDish = this.dishes[randomIndex];
				
				if (!this.selectedDishIds.some(id => String(id) === String(selectedDish.id))) {
					this.selectedDishIds.push(selectedDish.id);
				}
				uni.setStorageSync('selectedDishIds', this.selectedDishIds);
				
				uni.showModal({
					title: '今天吃这个！',
					content: `为您随机推荐了：${selectedDish.name}，已帮您选中！`,
					showCancel: false,
					confirmText: '太棒了',
					confirmColor: '#10B981'
				});
			}
		}
	}
</script>

<style>
	/* Reset and page structure */
	.page-container {
		min-height: 100vh;
		background-color: #FAFAFA;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		position: relative;
		padding-bottom: 280rpx; /* Ensure floating panels and bottom tabs don't overlap content */
		box-sizing: border-box;
	}

	/* Header Banner */
	.header-banner {
		position: relative;
		width: 750rpx;
		height: 480rpx;
		overflow: hidden;
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
		background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 60%, rgba(250,250,250,1) 100%);
		z-index: 1;
	}

	/* Navigation Bar and Capsular Menu */
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
		justify-content: flex-end;
		padding-right: 20rpx;
		box-sizing: border-box;
	}

	.capsule-menu {
		width: 174rpx;
		height: 64rpx;
		background-color: rgba(255, 255, 255, 0.6);
		border: 1rpx solid rgba(0, 0, 0, 0.08);
		backdrop-filter: blur(10px);
		border-radius: 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-around;
		padding: 0 16rpx;
		box-sizing: border-box;
	}

	.capsule-dots {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 36rpx;
	}

	.capsule-dots .dot {
		width: 8rpx;
		height: 8rpx;
		border-radius: 50%;
		background-color: #000000;
	}

	.capsule-divider {
		width: 1rpx;
		height: 36rpx;
		background-color: rgba(0, 0, 0, 0.1);
	}

	.capsule-circle {
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		border: 4rpx solid #000000;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.circle-inner {
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		background-color: #000000;
	}

	/* Dashboard Card ("我的厨房") */
	.dashboard-card {
		position: relative;
		z-index: 5;
		margin: -80rpx 24rpx 0 24rpx;
		background-color: #FFFFFF;
		border-radius: 32rpx;
		padding: 36rpx 30rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.04);
		box-sizing: border-box;
	}

	.card-top-row {
		display: flex;
		align-items: center;
	}

	.kitchen-avatar {
		width: 110rpx;
		height: 110rpx;
		border-radius: 20rpx;
		background-color: #F0F0F0;
		flex-shrink: 0;
	}

	.kitchen-info {
		flex: 1;
		margin-left: 24rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.kitchen-title {
		font-size: 38rpx;
		font-weight: bold;
		color: #1A1A1A;
		letter-spacing: 1rpx;
	}

	.kitchen-subtitle {
		font-size: 24rpx;
		color: #8C8C8C;
		margin-top: 10rpx;
	}

	.chef-hat-icon-wrapper {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.svg-chef-hat {
		width: 50rpx;
		height: 50rpx;
	}

	/* Tabs & Controls Row */
	.tabs-controls-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 40rpx 30rpx 20rpx 30rpx;
		height: 80rpx;
		position: relative;
		z-index: 5;
	}

	.tabs-container {
		display: flex;
		align-items: center;
		gap: 36rpx;
	}

	.tab-item {
		position: relative;
		padding: 10rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
	}

	.tab-text {
		font-size: 32rpx;
		color: #666666;
		transition: all 0.2s ease;
	}

	.tab-item.active .tab-text {
		font-size: 34rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.active-indicator {
		position: absolute;
		bottom: -2rpx;
		width: 48rpx;
		height: 6rpx;
		border-radius: 3rpx;
		background: #10B981;
	}

	.controls-container {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.control-btn {
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 30rpx;
		font-size: 24rpx;
		box-sizing: border-box;
		transition: all 0.2s ease;
	}

	.btn-manage {
		border: 1rpx solid #10B981;
		color: #10B981;
		padding: 0 28rpx;
		background-color: #FFFFFF;
	}

	.btn-random {
		border: 1rpx solid #FF7B54;
		color: #FF7B54;
		padding: 0 24rpx;
		background-color: #FFFFFF;
	}

	.btn-add {
		background-color: #10B981;
		color: #FFFFFF;
		padding: 0 32rpx;
		box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.2);
	}

	.btn-search {
		display: flex;
		align-items: center;
		gap: 8rpx;
		color: #666666;
		padding: 0 10rpx;
	}

	.svg-search {
		width: 32rpx;
		height: 32rpx;
	}

	/* Content View Area */
	.content-view-area {
		padding: 0 24rpx;
		box-sizing: border-box;
		position: relative;
		z-index: 4;
	}

	.category-refresh-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10rpx 6rpx 20rpx 6rpx;
	}

	.category-manage {
		display: flex;
		align-items: center;
		gap: 10rpx;
		border-radius: 12rpx;
		padding: 8rpx;
		transition: all 0.2s;
	}

	.svg-gear {
		width: 34rpx;
		height: 34rpx;
	}

	.category-text {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
	}

	.refresh-action {
		width: 50rpx;
		height: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.svg-refresh {
		width: 38rpx;
		height: 38rpx;
	}

	.rotating {
		animation: rotate 1s linear infinite;
	}

	@keyframes rotate {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 100rpx;
		padding-bottom: 120rpx;
	}

	.empty-rabbit {
		width: 260rpx;
		height: 260rpx;
	}

	.empty-text {
		font-size: 26rpx;
		color: #999999;
		text-align: center;
		width: 480rpx;
		line-height: 1.6;
		margin-top: 40rpx;
	}

	/* Dishes Grid on Homepage (When populated) */
	.dishes-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24rpx;
		padding: 10rpx 6rpx;
		box-sizing: border-box;
	}

	.dish-item-card {
		background-color: #FFFFFF;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
		position: relative;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.checkbox-overlay {
		position: absolute;
		top: 16rpx;
		left: 16rpx;
		z-index: 5;
	}

	.checkbox-circle {
		width: 44rpx;
		height: 44rpx;
		border-radius: 50%;
		border: 3rpx solid rgba(255, 255, 255, 0.85);
		background-color: rgba(0, 0, 0, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		transition: all 0.2s;
	}

	.checkbox-circle.checked {
		background-color: #10B981;
		border-color: #10B981;
	}

	.checkbox-inner {
		width: 18rpx;
		height: 18rpx;
		background-color: #FFFFFF;
		border-radius: 50%;
	}

	.dish-card-img {
		width: 100%;
		height: 260rpx;
		background-color: #F5F5F5;
	}

	.dish-card-details {
		padding: 16rpx 20rpx;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.dish-card-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dish-card-tag-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.dish-card-tag {
		align-self: flex-start;
		font-size: 20rpx;
		color: #10B981;
		background-color: #E6FBF7;
		padding: 2rpx 12rpx;
		border-radius: 6rpx;
		font-weight: 500;
	}

	.dish-card-sales {
		font-size: 20rpx;
		color: #8C8C8C;
	}

	/* Today Tab Content */
	.alert-notice-wrapper {
		padding: 10rpx 6rpx;
	}

	.alert-banner {
		background-color: #EBFBF8;
		border-radius: 16rpx;
		padding: 24rpx 30rpx;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.svg-info {
		width: 36rpx;
		height: 36rpx;
		flex-shrink: 0;
	}

	.alert-text {
		font-size: 26rpx;
		color: #059669;
		margin-left: 16rpx;
		font-weight: 500;
	}

	/* Bottom Floating Cart Panel */
	.cart-panel {
		position: fixed;
		bottom: 140rpx;
		left: 24rpx;
		right: 24rpx;
		background-color: #FFFFFF;
		border-radius: 40rpx;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 28rpx;
		box-sizing: border-box;
		z-index: 90;
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from { transform: translateY(50rpx); opacity: 0; }
		to { transform: translateY(0); opacity: 1; }
	}

	.cart-left {
		width: 80rpx;
		display: flex;
		align-items: center;
	}

	.cart-icon-container {
		position: relative;
		width: 48rpx;
		height: 48rpx;
	}

	.cart-selected-preview {
		flex: 1;
		min-width: 0;
		height: 64rpx;
		margin: 0 14rpx;
		white-space: nowrap;
		box-sizing: border-box;
	}

	.cart-selected-list {
		height: 64rpx;
		display: inline-flex;
		align-items: center;
		gap: 10rpx;
	}

	.cart-selected-pill {
		max-width: 160rpx;
		height: 54rpx;
		padding: 0 18rpx;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 28rpx;
		background: #eefbf5;
		color: #138b5f;
		font-size: 24rpx;
		font-weight: 800;
		box-sizing: border-box;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cart-selected-pill text {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cart-empty-preview {
		flex: 1;
		min-width: 0;
		margin: 0 14rpx;
		color: #8f9794;
		font-size: 25rpx;
		font-weight: 700;
	}

	.svg-cart {
		width: 48rpx;
		height: 48rpx;
	}

	.cart-badge {
		position: absolute;
		top: -12rpx;
		right: -12rpx;
		background-color: #FF4D4F;
		border-radius: 18rpx;
		padding: 0 10rpx;
		height: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2rpx solid #FFFFFF;
	}

	.badge-text {
		font-size: 18rpx;
		color: #FFFFFF;
		font-weight: bold;
	}

	.cart-center {
		display: flex;
		align-items: center;
		gap: 20rpx;
		flex: 1;
		justify-content: flex-end;
		padding-right: 20rpx;
	}

	.cart-btn {
		height: 72rpx;
		border-radius: 36rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: bold;
		box-sizing: border-box;
		transition: all 0.2s;
	}

	button.cart-btn {
		padding: 0;
		margin: 0;
		line-height: 1;
	}

	button.cart-btn::after {
		border: 0;
	}

	.cart-btn-hover {
		opacity: 0.86;
		transform: scale(0.98);
	}

	.btn-invite {
		border: 2rpx solid #10B981;
		color: #10B981;
		width: 190rpx;
		background-color: #FFFFFF;
	}

	.btn-done {
		background-color: #E2E2E2;
		color: #999999;
		width: 190rpx;
	}

	.btn-done.active {
		background-color: #7CDBC1; /* Active soft green */
		color: #FFFFFF;
	}

	.cart-right {
		width: 50rpx;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.svg-arrow {
		width: 36rpx;
		height: 36rpx;
		opacity: 0.5;
	}

	/* Fixed Bottom Tab Bar */
	.bottom-tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 750rpx;
		height: 120rpx;
		background-color: #FFFFFF;
		border-top: 1rpx solid #EEEEEE;
		display: flex;
		align-items: center;
		justify-content: space-around;
		padding-bottom: env(safe-area-inset-bottom);
		z-index: 100;
		box-sizing: border-box;
	}

	.tab-bar-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 120rpx;
		color: #8C8C8C;
		transition: all 0.2s ease;
	}

	.tabbar-icon {
		width: 44rpx;
		height: 44rpx;
	}

	.tabbar-icon-container {
		position: relative;
		width: 44rpx;
		height: 44rpx;
	}

	.badge-dot {
		position: absolute;
		top: -4rpx;
		right: -4rpx;
		width: 14rpx;
		height: 14rpx;
		border-radius: 50%;
		background-color: #FF4D4F;
		border: 2rpx solid #FFFFFF;
	}

	.tabbar-text {
		font-size: 20rpx;
		margin-top: 6rpx;
	}

	.tab-bar-item.active {
		color: #10B981;
	}

	/* Tutorial Highlighting Overlay & Elements */
	.tutorial-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* Dynamic highlighting using relative position and higher index */
	.highlight-tutorial {
		position: relative !important;
		z-index: 1005 !important;
		background-color: #FFFFFF !important; /* Make sure background is solid when highlighted */
		box-shadow: 0 0 16rpx rgba(255, 255, 255, 0.8) !important;
	}
	
	.btn-add.highlight-tutorial {
		background-color: #10B981 !important; /* Keep original color */
		color: #FFFFFF !important;
	}
	
	.tab-item.highlight-tutorial {
		background-color: transparent !important;
		border-radius: 8rpx;
		padding: 10rpx 15rpx;
		box-shadow: 0 0 12rpx rgba(255, 255, 255, 0.8) !important;
	}

	.cart-panel.highlight-tutorial {
		z-index: 1005 !important;
		box-shadow: 0 0 20rpx rgba(255, 255, 255, 0.9) !important;
	}

	/* Tutorial Tooltip Bubbles styling */
	.tutorial-tooltip-container {
		position: fixed;
		z-index: 1010;
		width: 750rpx;
		pointer-events: none; /* Let clicks pass through except tooltip button */
	}

	.tooltip-bubble {
		position: absolute;
		background-color: #FFFFFF;
		border-radius: 16rpx;
		padding: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		pointer-events: auto; /* Re-enable pointer events for interactions */
		animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes popIn {
		from { transform: scale(0.85); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	.tooltip-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}

	.tooltip-text {
		font-size: 28rpx;
		color: #333333;
		text-align: center;
		font-weight: 500;
	}

	.tooltip-action-btn {
		background-color: #10B981;
		color: #FFFFFF;
		font-size: 24rpx;
		padding: 10rpx 24rpx;
		border-radius: 30rpx;
		font-weight: bold;
		cursor: pointer;
	}

	.tooltip-arrow {
		position: absolute;
		width: 0;
		height: 0;
		border-style: solid;
	}

	/* Placement of bubbles for each step */
	
	/* Step 1: Points to Add Dishes (btn-add) */
	.step-1 {
		top: 510rpx; /* Placed below controls row */
		left: 0;
	}
	.bubble-step-1 {
		right: 90rpx;
		width: 440rpx;
	}
	.arrow-up-right {
		top: -14rpx;
		right: 80rpx;
		border-width: 0 16rpx 16rpx 16rpx;
		border-color: transparent transparent #FFFFFF transparent;
	}

	/* Step 2: Points to Category Management */
	.step-2 {
		top: 610rpx; /* Below Category Management */
		left: 0;
	}
	.bubble-step-2 {
		left: 30rpx;
		width: 440rpx;
	}
	.arrow-up-left {
		top: -14rpx;
		left: 80rpx;
		border-width: 0 16rpx 16rpx 16rpx;
		border-color: transparent transparent #FFFFFF transparent;
	}

	/* Step 3: Points to Bottom Cart Panel */
	.step-3 {
		bottom: 270rpx; /* Above Bottom Cart Panel */
		left: 0;
	}
	.bubble-step-3 {
		left: 24rpx;
		right: 24rpx;
		margin: 0 auto;
		width: 660rpx;
	}
	.arrow-down-left {
		bottom: -14rpx;
		left: 100rpx;
		border-width: 16rpx 16rpx 0 16rpx;
		border-color: #FFFFFF transparent transparent transparent;
	}

	/* Step 4: Points to Today Tab */
	.step-4 {
		top: 510rpx; /* Below Today tab */
		left: 0;
	}
	.bubble-step-4 {
		left: 120rpx;
		width: 440rpx;
	}
	.arrow-up-left-tab {
		top: -14rpx;
		left: 80rpx;
		border-width: 0 16rpx 16rpx 16rpx;
		border-color: transparent transparent #FFFFFF transparent;
	}

	/* Add Dishes Drawer styles */
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

	.drawer-panel {
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

	.drawer-panel.open {
		transform: translateY(0);
	}

	.drawer-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		margin-bottom: 40rpx;
	}

	.drawer-title {
		font-size: 34rpx;
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

	.drawer-options-list {
		display: flex;
		flex-direction: column;
		gap: 30rpx;
	}

	.drawer-option-item {
		display: flex;
		align-items: center;
		padding: 10rpx 0;
	}

	.option-icon-bg {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.bg-steal { background-color: #EBFBF8; }
	.bg-quick { background-color: #E8F8F5; }
	.bg-detailed { background-color: #EBF7FF; }
	.bg-recommend { background-color: #FFF7E6; }
	.bg-import { background-color: #FFF0F0; }

	.option-icon {
		width: 44rpx;
		height: 44rpx;
	}

	.option-content {
		flex: 1;
		margin-left: 24rpx;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.option-title-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.option-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.option-badge {
		font-size: 18rpx;
		color: #FFFFFF;
		padding: 2rpx 10rpx;
		border-radius: 6rpx;
		font-weight: 500;
	}

	.bg-red { background-color: #FF4D4F; }
	.bg-blue { background-color: #1890FF; }

	.option-desc {
		font-size: 24rpx;
		color: #8C8C8C;
	}

	.option-chevron {
		width: 32rpx;
		height: 32rpx;
		transform: rotate(180deg); /* Turn arrow pointing left to right chevron > */
		opacity: 0.3;
	}

	.drawer-cancel-btn {
		width: 100%;
		height: 90rpx;
		background-color: #F7F7F7;
		border-radius: 45rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 50rpx;
		font-size: 30rpx;
		color: #333333;
		font-weight: bold;
	}

	/* 进入小程序的公告弹窗 */
	.announce-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1300;
		animation: fadeIn 0.25s ease;
	}

	.announce-popup {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 600rpx;
		background-color: #FFFFFF;
		border-radius: 32rpx;
		padding: 44rpx 40rpx 36rpx;
		box-sizing: border-box;
		z-index: 1305;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.18);
	}

	.announce-head {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 28rpx;
	}

	.announce-title {
		font-size: 34rpx;
		font-weight: 900;
		color: #1b2428;
	}

	.announce-body {
		max-height: 460rpx;
	}

	.announce-line {
		display: block;
		font-size: 27rpx;
		line-height: 1.7;
		color: #4e5653;
		font-weight: 600;
	}

	.announce-never {
		display: flex;
		align-items: center;
		margin-top: 30rpx;
	}

	.announce-check {
		width: 36rpx;
		height: 36rpx;
		border-radius: 8rpx;
		border: 2rpx solid #cfd6d3;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 24rpx;
		font-weight: 900;
		box-sizing: border-box;
	}

	.announce-check.checked {
		background: #35cda4;
		border-color: #35cda4;
	}

	.announce-never-text {
		margin-left: 14rpx;
		font-size: 25rpx;
		color: #8f9794;
		font-weight: 700;
	}

	.announce-btn {
		margin-top: 32rpx;
		height: 88rpx;
		border-radius: 44rpx;
		background: #35cda4;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fbfefd;
		font-size: 30rpx;
		font-weight: 900;
		box-shadow: 0 10rpx 24rpx rgba(53, 205, 164, 0.25);
	}

	/* ==========================================================================
	   Order Tab Styles
	   ========================================================================== */
	.order-header-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 480rpx;
		background: linear-gradient(180deg, #E6FBF7 0%, #FAFAFA 100%);
		z-index: 1;
	}

	.order-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 750rpx;
		padding: 0 32rpx;
		box-sizing: border-box;
		position: relative;
		z-index: 10;
	}

	.order-nav-left {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}

	.filter-dropdown {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.filter-text {
		font-size: 34rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.filter-arrow {
		width: 0;
		height: 0;
		border-left: 8rpx solid transparent;
		border-right: 8rpx solid transparent;
		border-top: 10rpx solid #1A1A1A;
		margin-left: 8rpx;
		margin-top: 4rpx;
	}

	.date-picker-btn {
		background-color: rgba(255, 255, 255, 0.7);
		border: 1rpx solid rgba(0, 0, 0, 0.06);
		border-radius: 30rpx;
		padding: 8rpx 24rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.02);
	}

	.date-text {
		font-size: 24rpx;
		color: #8C8C8C;
	}

	.light-capsule {
		background-color: rgba(255, 255, 255, 0.8) !important;
		border: 1rpx solid rgba(0, 0, 0, 0.05) !important;
	}

	.order-tab-content {
		position: relative;
		padding-top: 20rpx;
	}

	.order-top-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 10rpx 0rpx;
		box-sizing: border-box;
		margin-bottom: 20rpx;
	}

	.order-decor-avocado-card {
		display: flex;
		align-items: center;
	}

	.avocado-img {
		width: 80rpx;
		height: 80rpx;
		filter: drop-shadow(0 4rpx 8rpx rgba(46, 90, 28, 0.12));
	}

	.order-decor-text {
		font-size: 26rpx;
		color: #333333;
		margin-left: 16rpx;
		font-weight: bold;
	}

	.highlight-num {
		font-size: 32rpx;
		color: #10B981;
		font-weight: bold;
		margin: 0 6rpx;
	}

	.order-sub-tabs {
		display: flex;
		align-items: center;
		background-color: rgba(255, 255, 255, 0.85);
		border-radius: 40rpx;
		padding: 4rpx;
		border: 1rpx solid rgba(0, 0, 0, 0.04);
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
	}

	.order-sub-tab {
		padding: 12rpx 36rpx;
		border-radius: 36rpx;
		font-size: 26rpx;
		font-weight: bold;
		color: #666666;
		transition: all 0.2s ease;
	}

	.order-sub-tab.active {
		background-color: #10B981;
		color: #FFFFFF;
	}

	.order-empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 140rpx;
		padding-bottom: 120rpx;
	}

	.order-empty-rabbit-img {
		width: 260rpx;
		height: 260rpx;
	}

	.order-empty-text {
		font-size: 28rpx;
		color: #999999;
		margin-top: 24rpx;
	}

	.order-float-star {
		position: absolute;
		left: 40rpx;
		top: 500rpx;
		font-size: 40rpx;
		color: #FFF275;
		opacity: 0.8;
		text-shadow: 0 2rpx 6rpx rgba(255,242,117,0.4);
		animation: floatAnim 3s ease-in-out infinite alternate;
	}

	.order-float-calendar {
		position: absolute;
		right: 32rpx;
		top: 480rpx;
		width: 100rpx;
		height: 100rpx;
		animation: floatAnim 3.5s ease-in-out infinite alternate-reverse;
	}

	.float-calendar-img {
		width: 100rpx;
		height: 100rpx;
		filter: drop-shadow(0 8rpx 20rpx rgba(16, 185, 129, 0.15));
	}

	@keyframes floatAnim {
		0% { transform: translateY(0px) rotate(0deg); }
		100% { transform: translateY(-15px) rotate(3deg); }
	}

	/* ==========================================================================
	   Discover Tab Styles
	   ========================================================================== */
	.discover-header-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 480rpx;
		background: linear-gradient(180deg, #E6FBF7 0%, #FAFAFA 100%);
		z-index: 1;
	}

	.discover-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 750rpx;
		position: relative;
		z-index: 10;
	}

	.discover-nav-left {
		position: absolute;
		left: 32rpx;
		display: flex;
		align-items: center;
	}

	.discover-title-text {
		font-size: 36rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.discover-tab-content {
		position: relative;
		padding-top: 10rpx;
	}

	.discover-notice-bar {
		background-color: #E6FBF7;
		border-radius: 16rpx;
		padding: 18rpx 28rpx;
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
		overflow: hidden;
		box-sizing: border-box;
	}

	.notice-icon {
		font-size: 28rpx;
		color: #10B981;
		margin-right: 16rpx;
		flex-shrink: 0;
	}

	.notice-text-container {
		flex: 1;
		overflow: hidden;
	}

	.notice-text {
		font-size: 24rpx;
		color: #059669;
		white-space: nowrap;
		display: inline-block;
		font-weight: 500;
		animation: marquee 25s linear infinite;
	}

	.discover-menu-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		margin-bottom: 40rpx;
	}

	.discover-menu-item {
		background-color: #FFFFFF;
		border-radius: 28rpx;
		padding: 24rpx 28rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.015);
		transition: all 0.2s ease;
	}

	.discover-menu-item:active {
		background-color: #F8F8F8;
		transform: scale(0.99);
	}

	.menu-item-left {
		display: flex;
		align-items: center;
	}

	.menu-item-icon-bg {
		width: 80rpx;
		height: 80rpx;
		border-radius: 22rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background: #EBFBF8;
	}

	.menu-item-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #262626;
		margin-left: 24rpx;
	}

	.menu-item-arrow {
		width: 32rpx;
		height: 32rpx;
		opacity: 0.25;
		transform: rotate(180deg);
	}

	.eati-menu-item {
		padding: 20rpx 28rpx;
	}

	.menu-title-sub-col {
		display: flex;
		flex-direction: column;
		margin-left: 24rpx;
		gap: 4rpx;
	}

	.menu-title-sub-col .menu-item-title {
		margin-left: 0;
	}

	.menu-item-desc {
		font-size: 22rpx;
		color: #8C8C8C;
	}

	.discover-float-heart {
		position: absolute;
		left: 20rpx;
		bottom: 120rpx;
		font-size: 56rpx;
		opacity: 0.6;
		animation: floatAnim 4s ease-in-out infinite alternate;
	}

	.discover-float-magnifier {
		position: absolute;
		right: 16rpx;
		bottom: 80rpx;
		opacity: 0.35;
		animation: floatAnim 3.2s ease-in-out infinite alternate-reverse;
	}

	/* ==========================================================================
	   My Tab Styles
	   ========================================================================== */
	.my-header-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 750rpx;
		height: 480rpx;
		background: linear-gradient(180deg, #10B981 0%, #059669 100%);
		z-index: 1;
	}

	.my-nav {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		width: 750rpx;
		padding: 0 40rpx 24rpx 40rpx;
		box-sizing: border-box;
		position: relative;
		z-index: 10;
		height: 80px;
	}

	.my-title-block {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.my-main-title {
		font-size: 46rpx;
		font-weight: bold;
		color: #FFFFFF;
		letter-spacing: 1rpx;
	}

	.my-sub-title {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.85);
	}

	.dark-capsule {
		background-color: rgba(0, 0, 0, 0.15) !important;
		border: 1rpx solid rgba(255, 255, 255, 0.15) !important;
	}

	.dark-capsule .dot {
		background-color: #FFFFFF !important;
	}

	.dark-capsule .capsule-circle {
		border-color: #FFFFFF !important;
	}

	.dark-capsule .circle-inner {
		background-color: #FFFFFF !important;
	}

	.my-tab-content {
		position: relative;
		z-index: 5;
	}

	.my-profile-card {
		background-color: #FFFFFF;
		border-radius: 36rpx;
		margin: -60rpx 0rpx 30rpx 0rpx;
		padding: 36rpx 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.04);
		position: relative;
		z-index: 10;
	}

	.profile-left-col {
		display: flex;
		align-items: center;
	}

	.my-profile-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background-color: #F0F0F0;
		border: 2rpx solid #FFFFFF;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
	}

	.profile-names {
		margin-left: 24rpx;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.profile-username-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.profile-username {
		font-size: 34rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.username-edit-pen {
		opacity: 0.8;
	}

	.profile-user-id-row {
		display: flex;
		align-items: center;
		gap: 10rpx;
		cursor: pointer;
	}

	.profile-user-id {
		font-size: 24rpx;
		color: #8C8C8C;
	}

	.profile-carrot-badge {
		background-color: #EBFBF8;
		border-radius: 32rpx;
		padding: 8rpx 24rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.carrot-emoji {
		font-size: 28rpx;
	}

	.carrot-amount-num {
		font-size: 28rpx;
		font-weight: bold;
		color: #10B981;
	}

	.my-swiper-menu-box {
		background-color: #FFFFFF;
		border-radius: 36rpx;
		padding: 36rpx 16rpx 24rpx 16rpx;
		box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.015);
		margin-bottom: 30rpx;
	}

	.my-menu-swiper {
		height: 330rpx;
	}

	.my-grid-layout {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		row-gap: 30rpx;
	}

	.my-grid-item-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
	}

	.my-grid-icon-circle {
		width: 90rpx;
		height: 90rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.my-grid-item-cell:active .my-grid-icon-circle {
		transform: scale(0.92);
	}

	.soft-bg-mint {
		background-color: #E6FBF7;
	}

	.soft-bg-grey {
		background-color: #F5F5F5;
	}

	.my-grid-svg {
		width: 46rpx;
		height: 46rpx;
	}

	.my-grid-item-label {
		font-size: 24rpx;
		color: #4A4A4A;
		font-weight: 500;
	}

	.my-carousel-placeholder-plus {
		font-size: 44rpx;
		color: #8C8C8C;
		font-weight: 300;
	}

	.my-swiper-dots {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 12rpx;
		margin-top: 14rpx;
	}

	.my-indicator-dot {
		width: 32rpx;
		height: 8rpx;
		border-radius: 4rpx;
		background-color: #E2E2E2;
		transition: all 0.25s ease;
	}

	.my-indicator-dot.dot-circle {
		width: 8rpx;
		height: 8rpx;
		border-radius: 50%;
	}

	.my-indicator-dot.active {
		background-color: #10B981;
		width: 32rpx;
	}

	.my-activity-wall-card {
		background-color: #FFFFFF;
		border-radius: 36rpx;
		padding: 36rpx 32rpx;
		box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.015);
		margin-bottom: 30rpx;
	}

	.activity-wall-header {
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 24rpx;
	}

	.activity-wall-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.activity-wall-months-labels {
		display: flex;
		justify-content: space-between;
		padding: 0 10rpx;
		margin-bottom: 14rpx;
	}

	.month-txt-label {
		font-size: 22rpx;
		color: #8C8C8C;
		font-weight: 500;
	}

	.activity-wall-squares-grid {
		display: grid;
		grid-template-columns: repeat(24, 1fr);
		gap: 6rpx;
	}

	.activity-wall-square {
		aspect-ratio: 1;
		border-radius: 5rpx;
		background-color: #F3F4F6;
	}

	.square-lvl-0 { background-color: #F3F4F6; }
	.square-lvl-1 { background-color: #E1F8F4; }
	.square-lvl-2 { background-color: #A7F3D0; }
	.square-lvl-3 { background-color: #34D399; }
	.square-lvl-4 { background-color: #059669; }

	.my-sub-notice-row {
		background-color: #FFFFFF;
		border-radius: 36rpx;
		padding: 28rpx 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.015);
		margin-bottom: 40rpx;
	}

	.sub-notice-left-side {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.bell-alert-emoji {
		font-size: 38rpx;
	}

	.sub-notice-text-content {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.sub-notice-main-text {
		font-size: 28rpx;
		font-weight: bold;
		color: #1A1A1A;
	}

	.sub-notice-sub-text {
		font-size: 22rpx;
		color: #8C8C8C;
	}

	.sub-notice-right-side {
		display: flex;
		align-items: center;
		gap: 12rpx;
		cursor: pointer;
	}

	.sub-notice-status-lbl {
		font-size: 26rpx;
		color: #8C8C8C;
	}

	.sub-notice-arrow-icon {
		font-size: 26rpx;
		color: #C0C0C0;
	}

	.my-footer-watermark-row {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 10rpx 0 50rpx 0;
	}

	.footer-watermark-text {
		font-size: 24rpx;
		color: #C0C0C0;
		letter-spacing: 2rpx;
		font-family: serif;
	}

	/* Reference restore pass */
	.page-container {
		background: #fbfdfc;
		overflow-x: hidden;
		padding-bottom: calc(132rpx + env(safe-area-inset-bottom));
	}

	.content-view-area {
		padding: 0 30rpx;
	}

	.nav-bar {
		overflow: visible;
	}

	.capsule-menu {
		position: absolute;
		top: 8rpx;
		right: 24rpx;
		width: 236rpx;
		height: 64rpx;
		border-radius: 34rpx;
		background: rgba(251, 254, 253, 0.78);
		border: 1rpx solid rgba(34, 46, 43, 0.08);
		box-shadow: inset 0 1rpx 0 rgba(252, 254, 253, 0.8);
		display: flex;
		align-items: center;
		justify-content: space-around;
		padding: 0 22rpx;
		box-sizing: border-box;
		backdrop-filter: blur(12px);
		z-index: 30;
	}

	.capsule-dots {
		width: 42rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.capsule-dots .dot {
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		background-color: #17201d;
	}

	.capsule-divider {
		width: 1rpx;
		height: 38rpx;
		background-color: rgba(23, 32, 29, 0.12);
	}

	.capsule-minus {
		width: 28rpx;
		height: 6rpx;
		border-radius: 4rpx;
		background: #17201d;
	}

	.capsule-circle {
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		border: 6rpx solid #17201d;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.circle-inner {
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		background-color: #17201d;
	}

	.light-capsule {
		background: rgba(251, 254, 253, 0.76) !important;
		border-color: rgba(34, 46, 43, 0.08) !important;
	}

	/* Order page */
	.tab-order {
		background:
			radial-gradient(circle at 93% 15%, rgba(76, 215, 181, 0.2) 0 14rpx, transparent 15rpx),
			radial-gradient(circle at 94% 57%, rgba(76, 215, 181, 0.18) 0 12rpx, transparent 13rpx),
			linear-gradient(180deg, #f4fbf8 0%, #fbfdfc 20%, #fbfdfc 100%);
	}

	.order-header {
		height: 154rpx;
		overflow: visible;
	}

	.order-header-bg {
		height: 236rpx;
		background:
			radial-gradient(circle at 80% 28%, rgba(58, 211, 174, 0.16) 0 54rpx, transparent 55rpx),
			linear-gradient(180deg, #dff8f1 0%, #f4fbf8 74%, rgba(251, 253, 252, 0) 100%);
	}

	.order-dash-line {
		position: absolute;
		left: 82rpx;
		top: 72rpx;
		width: 282rpx;
		height: 96rpx;
		border-top: 4rpx dashed rgba(76, 215, 181, 0.36);
		border-radius: 50%;
		transform: rotate(-12deg);
		z-index: 2;
	}

	.order-spark {
		position: absolute;
		width: 22rpx;
		height: 22rpx;
		background: rgba(76, 215, 181, 0.24);
		border-radius: 2rpx;
		transform: rotate(45deg);
		z-index: 3;
	}

	.order-spark-top {
		top: 30rpx;
		left: 486rpx;
	}

	.order-leaf {
		position: absolute;
		width: 54rpx;
		height: 28rpx;
		border-radius: 54rpx 0 54rpx 0;
		background: linear-gradient(135deg, rgba(72, 210, 174, 0.22), rgba(72, 210, 174, 0.72));
		z-index: 2;
	}

	.order-leaf-left {
		left: 58rpx;
		top: 108rpx;
		transform: rotate(-35deg);
	}

	.order-leaf-right {
		right: 30rpx;
		top: -8rpx;
		transform: rotate(-28deg);
	}

	.order-heart {
		position: absolute;
		right: 48rpx;
		top: 134rpx;
		width: 30rpx;
		height: 30rpx;
		opacity: 0.34;
		background: #58d6b9;
		transform: rotate(45deg);
		z-index: 2;
	}

	.order-heart::before,
	.order-heart::after {
		content: "";
		position: absolute;
		width: 30rpx;
		height: 30rpx;
		border-radius: 50%;
		background: #58d6b9;
	}

	.order-heart::before {
		left: -15rpx;
		top: 0;
	}

	.order-heart::after {
		left: 0;
		top: -15rpx;
	}

	.order-nav {
		height: 86rpx;
		justify-content: flex-start;
		padding: 0 284rpx 0 28rpx;
	}

	.order-nav-left {
		gap: 28rpx;
		width: 100%;
	}

	.filter-text {
		font-size: 32rpx;
		line-height: 1;
		color: #202826;
	}

	.filter-arrow {
		border-left-width: 10rpx;
		border-right-width: 10rpx;
		border-top-width: 12rpx;
		border-top-color: #202826;
		margin-left: 10rpx;
	}

	.date-picker-btn {
		width: 188rpx;
		height: 58rpx;
		padding: 0;
		justify-content: center;
		border-radius: 32rpx;
		background: rgba(251, 254, 253, 0.76);
		border: 0;
		box-shadow: none;
	}

	.date-text {
		font-size: 26rpx;
		font-weight: 700;
		color: #8f9794;
	}

	.order-tab-content {
		position: relative;
		min-height: calc(100vh - 286rpx);
		padding-top: 0;
		overflow: visible;
	}

	.order-tab-content::before {
		content: "";
		position: absolute;
		right: -4rpx;
		top: 430rpx;
		width: 92rpx;
		height: 132rpx;
		opacity: 0.52;
		background-image: radial-gradient(circle, #d7f5ed 0 6rpx, transparent 7rpx);
		background-size: 20rpx 20rpx;
		z-index: 0;
	}

	.order-tab-content::after {
		content: "";
		position: absolute;
		left: 38rpx;
		top: 620rpx;
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: rgba(76, 215, 181, 0.34);
		box-shadow: 638rpx 108rpx 0 rgba(76, 215, 181, 0.42), 670rpx -310rpx 0 rgba(76, 215, 181, 0.28);
		z-index: 0;
	}

	.order-top-row {
		height: 94rpx;
		margin: 0;
		padding: 4rpx 0 0;
		position: relative;
		z-index: 2;
	}

	.order-decor-avocado-card {
		position: relative;
		min-width: 318rpx;
		height: 82rpx;
		display: flex;
		align-items: center;
	}

	.avocado-img {
		position: absolute;
		left: -22rpx;
		top: -8rpx;
		width: 78rpx;
		height: 78rpx;
		filter: drop-shadow(0 4rpx 10rpx rgba(61, 132, 53, 0.16));
	}

	.order-decor-text {
		position: relative;
		z-index: 2;
		margin-left: 0;
		font-size: 28rpx;
		font-weight: 800;
		color: #202826;
	}

	.highlight-num {
		font-size: 34rpx;
		color: #35cca4;
		margin: 0 5rpx;
	}

	.order-sub-tabs {
		position: relative;
		z-index: 2;
		background: transparent;
		border: 0;
		box-shadow: none;
		padding: 0;
		gap: 28rpx;
	}

	.order-sub-tab {
		height: 50rpx;
		min-width: 150rpx;
		border-radius: 28rpx;
		padding: 0 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 800;
		color: #2f3533;
	}

	.order-sub-tab.active {
		min-width: 174rpx;
		background: #35cda4;
		color: #fbfefd;
	}

	.order-empty-state {
		position: relative;
		z-index: 2;
		padding-top: 404rpx;
		padding-bottom: 260rpx;
	}

	.order-empty-rabbit-img {
		width: 154rpx;
		height: 154rpx;
		mix-blend-mode: multiply;
	}

	.order-empty-text {
		margin-top: 34rpx;
		font-size: 28rpx;
		font-weight: 700;
		color: #8d8f90;
	}

	.order-float-star {
		left: 38rpx;
		top: 796rpx;
		font-size: 42rpx;
		color: #ffd45b;
		opacity: 0.9;
		animation: none;
	}

	.order-float-calendar {
		right: 24rpx;
		top: 768rpx;
		width: 88rpx;
		height: 88rpx;
		animation: none;
	}

	.float-calendar-img {
		width: 88rpx;
		height: 88rpx;
	}

	/* My page */
	.tab-my {
		background:
			radial-gradient(circle at 95% 82%, rgba(76, 215, 181, 0.28) 0 8rpx, transparent 9rpx),
			linear-gradient(180deg, #36cfa9 0 300rpx, #f8faf9 300rpx, #f8faf9 100%);
	}

	.my-header {
		height: 360rpx;
		overflow: visible;
		background: #36cfa9;
	}

	.my-header-bg {
		height: 360rpx;
		background: #36cfa9;
	}

	.my-bg-circle {
		position: absolute;
		border-radius: 50%;
		background: rgba(223, 249, 240, 0.22);
		z-index: 2;
	}

	.my-bg-circle-large {
		right: -42rpx;
		top: -78rpx;
		width: 286rpx;
		height: 286rpx;
	}

	.my-bg-circle-small {
		right: 64rpx;
		top: 116rpx;
		width: 112rpx;
		height: 112rpx;
	}

	.my-bg-circle-left {
		left: -92rpx;
		bottom: -64rpx;
		width: 240rpx;
		height: 240rpx;
	}

	.my-nav {
		height: 174rpx;
		align-items: flex-start;
		padding: 18rpx 48rpx 0;
	}

	.my-title-block {
		gap: 14rpx;
	}

	.my-main-title {
		font-size: 42rpx;
		line-height: 1.16;
		font-weight: 900;
		color: #fbfefd;
		letter-spacing: 0;
	}

	.my-sub-title {
		font-size: 28rpx;
		line-height: 1.15;
		font-weight: 800;
		color: rgba(251, 254, 253, 0.96);
	}

	.my-capsule {
		top: 4rpx;
		right: 24rpx;
	}

	.my-tab-content {
		position: relative;
		z-index: 5;
	}

	.my-tab-content::before {
		content: "";
		position: absolute;
		right: -22rpx;
		top: 154rpx;
		width: 92rpx;
		height: 112rpx;
		opacity: 0.45;
		background-image: radial-gradient(circle, #dbf4ed 0 6rpx, transparent 7rpx);
		background-size: 20rpx 20rpx;
		z-index: 0;
	}

	.my-tab-content::after {
		content: "";
		position: absolute;
		right: -18rpx;
		bottom: 208rpx;
		width: 88rpx;
		height: 88rpx;
		opacity: 0.55;
		background-image: radial-gradient(circle, #d5f1e9 0 6rpx, transparent 7rpx);
		background-size: 20rpx 20rpx;
		z-index: 0;
	}

	.my-profile-card,
	.my-swiper-menu-box,
	.my-activity-wall-card,
	.my-sub-notice-row,
	.my-footer-watermark-row {
		position: relative;
		z-index: 2;
	}

	.my-profile-card {
		min-height: 168rpx;
		margin: -112rpx 0 22rpx;
		padding: 24rpx 32rpx;
		border-radius: 28rpx;
		background: #dff8ef;
		box-shadow: none;
		box-sizing: border-box;
	}

	.my-profile-avatar {
		width: 124rpx;
		height: 124rpx;
		border: 0;
		box-shadow: none;
	}

	.profile-names {
		margin-left: 26rpx;
		gap: 12rpx;
	}

	.profile-username {
		font-size: 34rpx;
		line-height: 1.2;
		font-weight: 900;
		color: #333b39;
	}

	.username-edit-pen-img {
		width: 28rpx;
		height: 28rpx;
	}

	.profile-user-id-row {
		align-self: flex-start;
		gap: 10rpx;
		padding: 4rpx 12rpx;
		border-radius: 18rpx;
		background: rgba(251, 254, 253, 0.64);
	}

	.profile-user-id {
		font-size: 26rpx;
		line-height: 1.2;
		color: #8e9492;
	}

	.username-copy-btn-img {
		width: 24rpx;
		height: 24rpx;
		opacity: 0.78;
	}

	.profile-carrot-badge {
		background: transparent;
		border-radius: 0;
		padding: 0;
		gap: 10rpx;
	}

	.carrot-emoji,
	.carrot-amount-num {
		font-size: 30rpx;
		line-height: 1;
	}

	.carrot-amount-num {
		font-weight: 900;
		color: #31cda4;
	}

	.my-swiper-menu-box {
		margin-bottom: 28rpx;
		padding: 34rpx 16rpx 24rpx;
		border-radius: 28rpx;
		background: #fbfefd;
		box-shadow: 0 12rpx 38rpx rgba(31, 50, 45, 0.04);
	}

	.my-menu-swiper {
		height: 306rpx;
	}

	.my-grid-layout {
		grid-template-columns: repeat(4, 1fr);
		row-gap: 30rpx;
	}

	.my-grid-item-cell {
		gap: 12rpx;
		min-height: 128rpx;
	}

	.my-grid-icon-circle {
		width: 88rpx;
		height: 88rpx;
		border-radius: 18rpx;
	}

	.soft-bg-mint {
		background-color: #ebfaf5;
	}

	.my-grid-svg {
		width: 58rpx;
		height: 58rpx;
	}

	.my-grid-item-label {
		font-size: 28rpx;
		line-height: 1.1;
		font-weight: 800;
		color: #3d4240;
	}

	.my-swiper-dots {
		gap: 12rpx;
		margin-top: 2rpx;
	}

	.my-indicator-dot {
		width: 42rpx;
		height: 10rpx;
		border-radius: 8rpx;
		background-color: #d3d7d6;
	}

	.my-indicator-dot.dot-circle {
		width: 12rpx;
		height: 12rpx;
	}

	.my-indicator-dot.active {
		width: 42rpx;
		background-color: #35cda4;
	}

	.my-activity-wall-card {
		margin-bottom: 28rpx;
		padding: 34rpx 24rpx 34rpx;
		border-radius: 26rpx;
		background: #fbfefd;
		box-shadow: 0 12rpx 38rpx rgba(31, 50, 45, 0.04);
	}

	.activity-wall-header {
		margin-bottom: 24rpx;
		gap: 12rpx;
	}

	.activity-wall-title {
		font-size: 34rpx;
		line-height: 1.2;
		font-weight: 900;
		color: #2c3331;
	}

	.activity-wall-help-icon {
		width: 28rpx;
		height: 28rpx;
	}

	.activity-wall-months-labels {
		padding: 0 4rpx;
		margin-bottom: 16rpx;
	}

	.month-txt-label {
		font-size: 24rpx;
		line-height: 1;
		font-weight: 600;
		color: #22aa82;
	}

	.activity-wall-squares-grid {
		grid-template-columns: repeat(24, 1fr);
		gap: 8rpx;
	}

	.activity-wall-square {
		border-radius: 6rpx;
		background-color: #f0f4f6;
	}

	.square-lvl-0,
	.square-lvl-1,
	.square-lvl-2,
	.square-lvl-3,
	.square-lvl-4 {
		background-color: #f0f4f6;
	}

	.my-sub-notice-row {
		min-height: 138rpx;
		margin-bottom: 24rpx;
		padding: 24rpx 32rpx;
		border-radius: 18rpx;
		background: #fbfefd;
		box-shadow: 0 8rpx 28rpx rgba(31, 50, 45, 0.035);
	}

	.sub-notice-left-side {
		gap: 18rpx;
	}

	.bell-alert-icon {
		width: 54rpx;
		height: 54rpx;
	}

	.sub-notice-text-content {
		gap: 12rpx;
	}

	.sub-notice-main-text {
		font-size: 32rpx;
		line-height: 1.1;
		font-weight: 900;
		color: #363b39;
	}

	.sub-notice-sub-text {
		font-size: 24rpx;
		line-height: 1.1;
		font-weight: 700;
		color: #9aa09e;
	}

	.sub-notice-status-lbl {
		font-size: 30rpx;
		font-weight: 800;
		color: #979d9b;
	}

	.sub-notice-arrow-icon {
		font-size: 54rpx;
		line-height: 1;
		font-weight: 300;
		color: #c7cbc9;
	}

	.my-footer-watermark-row {
		padding: 0 0 34rpx;
	}

	.footer-watermark-text {
		font-size: 26rpx;
		line-height: 1;
		font-weight: 800;
		color: #a3a9ad;
		letter-spacing: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}

	/* Bottom tab bar */
	.bottom-tab-bar {
		height: calc(126rpx + env(safe-area-inset-bottom));
		background: rgba(251, 254, 253, 0.98);
		border-top: 0;
		box-shadow: 0 -10rpx 28rpx rgba(28, 45, 40, 0.04);
		align-items: flex-start;
		padding-top: 16rpx;
	}

	.tab-bar-item {
		width: 142rpx;
		height: 104rpx;
		justify-content: flex-start;
	}

	.tabbar-icon,
	.tabbar-icon-container {
		width: 52rpx;
		height: 52rpx;
	}

	.tabbar-text {
		margin-top: 4rpx;
		font-size: 22rpx;
		line-height: 1.2;
		font-weight: 800;
		color: #1e2422;
	}

	.tab-bar-item.active .tabbar-text {
		color: #35cda4;
	}

	/* Mini program layout guard: the runtime already renders the top-right capsule. */
	.capsule-menu {
		display: none !important;
	}

	.location-icon-img {
		width: 44rpx;
		height: 44rpx;
		display: block;
	}

	.menu-svg-icon {
		width: 52rpx;
		height: 52rpx;
		display: block;
	}

	.discover-float-heart,
	.discover-float-magnifier {
		display: none;
	}

	.discover-float-magnifier-img {
		width: 120rpx;
		height: 120rpx;
		display: block;
	}

	.order-nav {
		padding: 0 188rpx 0 28rpx;
	}

	.order-nav-left {
		gap: 18rpx;
		flex-wrap: nowrap;
		min-width: 0;
	}

	.filter-dropdown,
	.date-picker-btn {
		flex-shrink: 0;
	}

	.filter-text,
	.date-text,
	.order-decor-text,
	.order-sub-tab {
		white-space: nowrap;
	}

	.date-picker-btn {
		width: 172rpx;
	}

	.date-text {
		font-size: 24rpx;
	}

	.cart-panel {
		bottom: calc(174rpx + env(safe-area-inset-bottom));
	}

	.location-icon-img,
	.discover-float-magnifier-img,
	.username-edit-pen-img,
	.username-copy-btn-img,
	.activity-wall-help-icon,
	.bell-alert-icon {
		max-width: 100%;
		max-height: 100%;
	}

	/* Screenshot parity pass */
	.page-container {
		min-height: 100vh;
		background: #fbfdfc;
		padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
		color: #202725;
		overflow-x: hidden;
	}

	.capsule-menu {
		display: none !important;
	}

	.content-view-area {
		padding: 0;
	}

	.bottom-tab-bar {
		height: calc(122rpx + env(safe-area-inset-bottom));
		padding: 14rpx 0 0;
		background: #fbfefd;
		border-top: 1rpx solid rgba(32, 39, 37, 0.04);
		box-shadow: 0 -10rpx 28rpx rgba(25, 41, 36, 0.035);
		align-items: flex-start;
	}

	.tab-bar-item {
		width: 140rpx;
		height: 100rpx;
		justify-content: flex-start;
	}

	.tabbar-icon,
	.tabbar-icon-container {
		width: 54rpx;
		height: 54rpx;
	}

	.tabbar-text {
		margin-top: 2rpx;
		font-size: 22rpx;
		line-height: 1.15;
		font-weight: 800;
		color: #151b19;
	}

	.tab-bar-item.active .tabbar-text {
		color: #35cda4;
	}

	.badge-dot {
		top: -2rpx;
		right: -2rpx;
		width: 12rpx;
		height: 12rpx;
		border-width: 2rpx;
	}

	/* Kitchen screenshot */
	.tab-kitchen {
		background: #fbfdfc;
	}

	.tab-kitchen .header-banner {
		height: 325rpx;
		overflow: hidden;
		background: #f5e7c7;
	}

	.tab-kitchen .banner-bg {
		width: 750rpx;
		height: 325rpx;
	}

	.tab-kitchen .banner-mask {
		display: none;
	}

	.tab-kitchen .dashboard-card {
		width: 750rpx;
		height: 180rpx;
		margin: -30rpx 0 0 0;
		padding: 26rpx 24rpx;
		border-radius: 44rpx 44rpx 0 0;
		background: #fbfefd;
		box-shadow: none;
	}

	.tab-kitchen .kitchen-avatar {
		width: 118rpx;
		height: 118rpx;
		border-radius: 16rpx;
	}

	.tab-kitchen .kitchen-info {
		margin-left: 22rpx;
	}

	.tab-kitchen .kitchen-title {
		font-size: 42rpx;
		line-height: 1.12;
		font-weight: 900;
		letter-spacing: 0;
		color: #141817;
	}

	.tab-kitchen .kitchen-subtitle {
		margin-top: 14rpx;
		font-size: 26rpx;
		line-height: 1;
		font-weight: 800;
		color: #9aa1a7;
	}

	.tab-kitchen .chef-hat-icon-wrapper {
		position: absolute;
		top: 44rpx;
		right: 33rpx;
		width: 56rpx;
		height: 56rpx;
	}

	.tab-kitchen .svg-chef-hat {
		width: 56rpx;
		height: 56rpx;
	}

	.tab-kitchen .tabs-controls-row {
		height: 86rpx;
		margin: 0;
		padding: 0 26rpx 0 46rpx;
		border-bottom: 1rpx solid #eef0ef;
		background: #fbfefd;
	}

	.tab-kitchen .tabs-container {
		gap: 50rpx;
	}

	.tab-kitchen .tab-item {
		height: 86rpx;
		padding: 0;
		justify-content: center;
	}

	.tab-kitchen .tab-text,
	.tab-kitchen .tab-item.active .tab-text {
		font-size: 30rpx;
		line-height: 1;
		font-weight: 900;
		color: #1c2220;
	}

	.tab-kitchen .active-indicator {
		bottom: 6rpx;
		width: 38rpx;
		height: 6rpx;
		border-radius: 6rpx;
		background: #36cfa9;
	}

	.tab-kitchen .controls-container {
		gap: 16rpx;
	}

	.tab-kitchen .btn-random {
		display: none;
	}

	.tab-kitchen .control-btn {
		height: 48rpx;
		border-radius: 26rpx;
		font-size: 24rpx;
		font-weight: 900;
	}

	.tab-kitchen .btn-manage {
		width: 86rpx;
		padding: 0;
		border: 2rpx solid #35cda4;
		color: #35cda4;
		background: #fbfefd;
	}

	.tab-kitchen .btn-add {
		width: 132rpx;
		padding: 0;
		background: #35cda4;
		box-shadow: none;
	}

	.tab-kitchen .btn-search {
		width: 112rpx;
		gap: 12rpx;
		padding: 0;
		color: #101513;
		background: #f7fbf9;
	}

	.tab-kitchen .svg-search {
		width: 35rpx;
		height: 35rpx;
	}

	.kitchen-category-strip {
		position: relative;
		height: 92rpx;
		display: flex;
		align-items: center;
		background: #fbfefd;
		border-bottom: 1rpx solid #f0f1f1;
		box-sizing: border-box;
	}

	.category-strip-marker {
		position: absolute;
		left: 0;
		top: 31rpx;
		width: 6rpx;
		height: 30rpx;
		border-radius: 0 6rpx 6rpx 0;
		background: #35cda4;
	}

	.kitchen-category-tab {
		margin-left: 73rpx;
		font-size: 30rpx;
		line-height: 92rpx;
		font-weight: 900;
		color: #151b19;
		white-space: nowrap;
	}

	.kitchen-category-tab.active {
		color: #35cda4;
	}

	.kitchen-category-strip .refresh-action {
		position: absolute;
		right: 40rpx;
		top: 20rpx;
		width: 52rpx;
		height: 52rpx;
	}

	.kitchen-category-strip .svg-refresh {
		width: 42rpx;
		height: 42rpx;
	}

	.kitchen-category-body {
		min-height: calc(100vh - 780rpx);
		display: flex;
		background: #fbfefd;
	}

	.kitchen-side-pane {
		width: 190rpx;
		min-height: calc(100vh - 780rpx);
		background: #f7f8fa;
		flex-shrink: 0;
	}

	.kitchen-side-pane .category-manage {
		height: 104rpx;
		padding: 0 0 0 26rpx;
		gap: 13rpx;
		border-radius: 0;
	}

	.kitchen-side-pane .svg-gear {
		width: 34rpx;
		height: 34rpx;
	}

	.kitchen-side-pane .category-text {
		font-size: 28rpx;
		font-weight: 900;
		color: #1f2523;
	}

	.kitchen-main-pane {
		flex: 1;
		background: #fbfefd;
	}

	.category-empty-pill {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 80rpx;
		margin: 25rpx 22rpx 0 22rpx;
		border-radius: 14rpx;
		background: #f7f8fa;
		font-size: 28rpx;
		line-height: 80rpx;
		font-weight: 900;
		color: #a9b0b6;
		text-align: center;
	}

	.tab-kitchen .cart-panel {
		left: 22rpx;
		right: 22rpx;
		bottom: calc(132rpx + env(safe-area-inset-bottom));
		height: 104rpx;
		padding: 0 18rpx 0 32rpx;
		border-radius: 54rpx;
		box-shadow: 0 12rpx 42rpx rgba(31, 40, 38, 0.11);
	}

	.tab-kitchen .cart-left {
		width: 105rpx;
	}

	.tab-kitchen .cart-icon-container,
	.tab-kitchen .svg-cart {
		width: 62rpx;
		height: 62rpx;
	}

	.tab-kitchen .cart-center {
		flex: none;
		gap: 12rpx;
		padding-right: 0;
		justify-content: flex-end;
	}

	.tab-kitchen .cart-btn {
		height: 72rpx;
		border-radius: 38rpx;
		font-size: 28rpx;
		font-weight: 900;
	}

	.tab-kitchen .btn-invite {
		width: 176rpx;
		border: 2rpx solid #35cda4;
		color: #35cda4;
	}

	.tab-kitchen .btn-done {
		width: 172rpx;
		background: #99e0c8;
		color: #fbfefd;
	}

	.tab-kitchen .cart-right {
		width: 78rpx;
		height: 78rpx;
		border-radius: 50%;
		background: #f4f6f8;
		align-items: center;
		justify-content: center;
	}

	.tab-kitchen .svg-arrow {
		width: 40rpx;
		height: 40rpx;
		opacity: 1;
	}

	/* Order screenshot */
	.tab-order {
		background:
			radial-gradient(circle at 94% 28%, rgba(68, 211, 179, 0.16) 0 13rpx, transparent 14rpx),
			radial-gradient(circle at 8% 51%, rgba(68, 211, 179, 0.19) 0 10rpx, transparent 11rpx),
			linear-gradient(180deg, #eafaf6 0, #fbfdfc 240rpx, #fbfdfc 100%);
	}

	.tab-order .header-banner {
		height: 124rpx;
		overflow: visible;
	}

	.tab-order .order-header-bg {
		height: 160rpx;
		background:
			radial-gradient(circle at 82% 10%, rgba(66, 209, 177, 0.18) 0 95rpx, transparent 96rpx),
			linear-gradient(180deg, #e2f8f3 0%, rgba(251, 253, 252, 0) 100%);
	}

	.tab-order .order-nav {
		height: 60rpx;
		padding: 0 248rpx 0 24rpx;
		justify-content: flex-start;
	}

	.tab-order .order-nav-left {
		width: 100%;
		gap: 20rpx;
		min-width: 0;
		flex-wrap: nowrap;
	}

	.tab-order .filter-text {
		font-size: 30rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
		white-space: nowrap;
	}

	.tab-order .filter-arrow {
		border-left-width: 8rpx;
		border-right-width: 8rpx;
		border-top-width: 10rpx;
		margin-left: 8rpx;
		border-top-color: #202725;
	}

	.tab-order .date-picker-btn {
		width: 176rpx;
		height: 58rpx;
		padding: 0;
		justify-content: center;
		border: 0;
		border-radius: 30rpx;
		background: rgba(251, 254, 253, 0.72);
		box-shadow: none;
	}

	.tab-order .date-text {
		font-size: 26rpx;
		line-height: 1;
		font-weight: 800;
		color: #909895;
		white-space: nowrap;
	}

	.tab-order .order-tab-content {
		min-height: calc(100vh - 262rpx);
		padding-top: 0;
		overflow: visible;
	}

	.tab-order .order-top-row {
		height: 92rpx;
		margin: 0;
		padding: 0 22rpx;
		position: relative;
		z-index: 2;
	}

	.tab-order .order-decor-avocado-card {
		position: relative;
		min-width: 348rpx;
		height: 92rpx;
		align-items: center;
	}

	.tab-order .avocado-img {
		position: absolute;
		left: -16rpx;
		top: 6rpx;
		width: 82rpx;
		height: 82rpx;
	}

	.tab-order .order-decor-text {
		margin-left: 0;
		font-size: 28rpx;
		line-height: 92rpx;
		font-weight: 900;
		color: #202725;
		white-space: nowrap;
		position: relative;
		z-index: 2;
	}

	.tab-order .highlight-num {
		font-size: 32rpx;
		color: #35cda4;
		margin: 0 4rpx;
	}

	.tab-order .order-sub-tabs {
		background: transparent;
		border: 0;
		box-shadow: none;
		padding: 0;
		gap: 34rpx;
	}

	.tab-order .order-sub-tab {
		height: 48rpx;
		min-width: 156rpx;
		padding: 0 16rpx;
		border-radius: 28rpx;
		font-size: 28rpx;
		line-height: 48rpx;
		font-weight: 900;
		color: #2a312f;
		white-space: nowrap;
	}

	.tab-order .order-sub-tab.active {
		min-width: 174rpx;
		background: #35cda4;
		color: #fbfefd;
	}

	.tab-order .order-empty-state {
		padding-top: 384rpx;
		padding-bottom: 312rpx;
	}

	.tab-order .order-empty-rabbit-img {
		width: 158rpx;
		height: 158rpx;
	}

	.tab-order .order-empty-text {
		margin-top: 32rpx;
		font-size: 28rpx;
		line-height: 1;
		font-weight: 800;
		color: #8d9091;
	}

	.tab-order .order-float-star {
		left: 56rpx;
		top: 792rpx;
		font-size: 39rpx;
		color: #ffd358;
		text-shadow: none;
		animation: none;
	}

	.tab-order .order-float-calendar {
		right: 30rpx;
		top: 760rpx;
		width: 90rpx;
		height: 90rpx;
		animation: none;
	}

	.tab-order .float-calendar-img {
		width: 90rpx;
		height: 90rpx;
	}

	/* Discover screenshot */
	.tab-discover {
		background:
			radial-gradient(circle at 90% 77%, rgba(63, 206, 174, 0.18) 0 10rpx, transparent 11rpx),
			linear-gradient(180deg, #eafaf6 0, #fbfdfc 245rpx, #fbfdfc 100%);
	}

	.tab-discover .discover-header {
		height: 130rpx;
		overflow: visible;
	}

	.tab-discover .discover-header-bg {
		height: 212rpx;
		background:
			radial-gradient(circle at 15% 0, rgba(63, 206, 174, 0.18) 0 90rpx, transparent 91rpx),
			linear-gradient(180deg, #e1f8f3 0%, rgba(251, 253, 252, 0) 100%);
	}

	.tab-discover .discover-nav {
		height: 78rpx;
		padding: 0 210rpx 0 0;
		box-sizing: border-box;
	}

	.tab-discover .discover-title-text {
		font-size: 34rpx;
		line-height: 1;
		font-weight: 900;
		color: #182532;
	}

	.tab-discover .discover-nav-left {
		left: 70rpx;
		top: 2rpx;
	}

	.tab-discover .location-icon-img {
		width: 78rpx;
		height: 78rpx;
	}

	.tab-discover .discover-tab-content {
		padding: 0 20rpx 180rpx;
	}

	.tab-discover .discover-notice-bar {
		height: 64rpx;
		margin: 0 -20rpx 20rpx;
		padding: 0 28rpx;
		border-radius: 0 0 8rpx 8rpx;
		background: #dff8ef;
	}

	.tab-discover .notice-icon {
		font-size: 28rpx;
		line-height: 1;
		margin-right: 10rpx;
	}

	.tab-discover .notice-text {
		font-size: 24rpx;
		line-height: 64rpx;
		font-weight: 900;
		color: #35cda4;
	}

	.tab-discover .discover-menu-list {
		gap: 16rpx;
		margin-bottom: 0;
	}

	.tab-discover .discover-menu-item {
		height: 92rpx;
		padding: 0 38rpx 0 34rpx;
		border-radius: 20rpx;
		box-shadow: 0 10rpx 28rpx rgba(28, 45, 40, 0.025);
		background: rgba(251, 254, 253, 0.94);
		box-sizing: border-box;
	}

	.tab-discover .eati-menu-item {
		height: 118rpx;
		padding: 0 38rpx 0 34rpx;
	}

	.tab-discover .menu-item-icon-bg {
		width: 62rpx;
		height: 62rpx;
		border-radius: 14rpx;
		background: #ecfaf5;
	}

	.tab-discover .menu-svg-icon {
		width: 48rpx;
		height: 48rpx;
	}

	.tab-discover .menu-item-title {
		margin-left: 22rpx;
		font-size: 30rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
	}

	.tab-discover .menu-title-sub-col {
		margin-left: 22rpx;
		gap: 14rpx;
	}

	.tab-discover .menu-item-desc {
		font-size: 24rpx;
		line-height: 1;
		font-weight: 800;
		color: #9aa1a0;
	}

	.tab-discover .menu-item-arrow {
		width: 34rpx;
		height: 34rpx;
		opacity: 0.28;
	}

	.tab-discover .discover-float-heart {
		display: block;
		left: 48rpx;
		top: 900rpx;
		bottom: auto;
		font-size: 54rpx;
		opacity: 0.26;
		animation: none;
	}

	.tab-discover .discover-float-magnifier {
		display: block;
		right: 46rpx;
		top: 820rpx;
		bottom: auto;
		opacity: 0.42;
		animation: none;
	}

	.tab-discover .discover-float-magnifier-img {
		width: 118rpx;
		height: 118rpx;
	}

	/* My screenshot */
	.tab-my {
		background:
			radial-gradient(circle at 92% 81%, rgba(63, 206, 174, 0.18) 0 8rpx, transparent 9rpx),
			linear-gradient(180deg, #35cda4 0 338rpx, #f8faf9 338rpx, #f8faf9 100%);
	}

	.tab-my .my-header {
		height: 338rpx;
		background: #35cda4;
		overflow: visible;
	}

	.tab-my .my-header-bg {
		height: 338rpx;
		background: #35cda4;
	}

	.tab-my .my-bg-circle-large {
		right: -48rpx;
		top: -78rpx;
		width: 292rpx;
		height: 292rpx;
	}

	.tab-my .my-bg-circle-small {
		right: 74rpx;
		top: 116rpx;
		width: 118rpx;
		height: 118rpx;
	}

	.tab-my .my-bg-circle-left {
		left: -88rpx;
		bottom: -56rpx;
		width: 232rpx;
		height: 232rpx;
	}

	.tab-my .my-nav {
		height: 176rpx;
		padding: 36rpx 36rpx 0;
		align-items: flex-start;
	}

	.tab-my .my-title-block {
		gap: 16rpx;
	}

	.tab-my .my-main-title {
		font-size: 42rpx;
		line-height: 1;
		font-weight: 900;
		color: #fbfefd;
		letter-spacing: 0;
	}

	.tab-my .my-sub-title {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: rgba(251, 254, 253, 0.96);
	}

	.tab-my .my-tab-content {
		padding: 0 17rpx 172rpx;
	}

	.tab-my .my-profile-card {
		height: 164rpx;
		min-height: 164rpx;
		margin: -99rpx 0 18rpx;
		padding: 24rpx 32rpx;
		border-radius: 22rpx;
		background: #dff8ef;
		box-shadow: none;
		box-sizing: border-box;
	}

	.tab-my .my-profile-avatar {
		width: 118rpx;
		height: 118rpx;
		border-radius: 50%;
		box-shadow: none;
		border: 0;
	}

	.tab-my .profile-names {
		margin-left: 28rpx;
		gap: 12rpx;
	}

	.tab-my .profile-username {
		font-size: 34rpx;
		line-height: 1;
		font-weight: 900;
		color: #333b39;
	}

	.tab-my .username-edit-pen-img {
		width: 28rpx;
		height: 28rpx;
	}

	.tab-my .profile-user-id-row {
		gap: 8rpx;
		padding: 5rpx 12rpx;
		border-radius: 18rpx;
		background: rgba(251, 254, 253, 0.62);
	}

	.tab-my .profile-user-id {
		font-size: 26rpx;
		line-height: 1;
		font-weight: 700;
		color: #8f9695;
	}

	.tab-my .username-copy-btn-img {
		width: 24rpx;
		height: 24rpx;
	}

	.tab-my .profile-carrot-badge {
		padding: 0;
		background: transparent;
		gap: 10rpx;
	}

	.tab-my .carrot-emoji,
	.tab-my .carrot-amount-num {
		font-size: 30rpx;
		line-height: 1;
	}

	.tab-my .carrot-amount-num {
		font-weight: 900;
		color: #35cda4;
	}

	.tab-my .my-swiper-menu-box {
		margin: 0 0 28rpx;
		padding: 34rpx 16rpx 24rpx;
		border-radius: 24rpx;
		background: #fbfefd;
		box-shadow: 0 12rpx 34rpx rgba(32, 45, 42, 0.035);
	}

	.tab-my .my-menu-swiper {
		height: 300rpx;
	}

	.tab-my .my-grid-layout {
		grid-template-columns: repeat(4, 1fr);
		row-gap: 28rpx;
	}

	.tab-my .my-grid-item-cell {
		min-height: 126rpx;
		gap: 14rpx;
	}

	.tab-my .my-grid-icon-circle {
		width: 84rpx;
		height: 84rpx;
		border-radius: 18rpx;
		background: #ebfaf5;
	}

	.tab-my .my-grid-svg {
		width: 58rpx;
		height: 58rpx;
	}

	.tab-my .my-grid-item-label {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: #3b413f;
	}

	.tab-my .my-swiper-dots {
		margin-top: 0;
		gap: 13rpx;
	}

	.tab-my .my-indicator-dot {
		width: 42rpx;
		height: 10rpx;
		border-radius: 10rpx;
		background: #d1d6d4;
	}

	.tab-my .my-indicator-dot.dot-circle {
		width: 12rpx;
		height: 12rpx;
	}

	.tab-my .my-indicator-dot.active {
		width: 42rpx;
		background: #35cda4;
	}

	.tab-my .my-activity-wall-card {
		margin: 0 0 28rpx;
		padding: 34rpx 24rpx;
		border-radius: 24rpx;
		background: #fbfefd;
		box-shadow: 0 12rpx 34rpx rgba(32, 45, 42, 0.035);
	}

	.tab-my .activity-wall-header {
		margin-bottom: 24rpx;
		gap: 12rpx;
	}

	.tab-my .activity-wall-title {
		font-size: 34rpx;
		line-height: 1;
		font-weight: 900;
		color: #2b3331;
	}

	.tab-my .activity-wall-help-icon {
		width: 28rpx;
		height: 28rpx;
	}

	.tab-my .month-txt-label {
		font-size: 24rpx;
		font-weight: 700;
		color: #23ad86;
	}

	.tab-my .activity-wall-squares-grid {
		gap: 8rpx;
	}

	.tab-my .activity-wall-square {
		border-radius: 6rpx;
		background: #f0f4f6;
	}

	.tab-my .my-sub-notice-row {
		min-height: 138rpx;
		margin: 0 0 24rpx;
		padding: 24rpx 32rpx;
		border-radius: 18rpx;
		background: #fbfefd;
		box-shadow: 0 10rpx 30rpx rgba(32, 45, 42, 0.03);
	}

	.tab-my .bell-alert-icon {
		width: 54rpx;
		height: 54rpx;
	}

	.tab-my .sub-notice-main-text {
		font-size: 32rpx;
		line-height: 1;
		font-weight: 900;
		color: #333b39;
	}

	.tab-my .sub-notice-sub-text {
		font-size: 24rpx;
		line-height: 1;
		font-weight: 800;
		color: #9aa1a0;
	}

	.tab-my .sub-notice-status-lbl {
		font-size: 30rpx;
		font-weight: 900;
		color: #969d9b;
	}

	.tab-my .sub-notice-arrow-icon {
		font-size: 54rpx;
		line-height: 1;
		font-weight: 300;
		color: #c6cbc9;
	}

	.tab-my .my-footer-watermark-row {
		padding: 0 0 12rpx;
	}

	.tab-my .footer-watermark-text {
		font-size: 26rpx;
		line-height: 1;
		font-weight: 900;
		color: #a4aaad;
		letter-spacing: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}

	/* Final screenshot lock: 750rpx-wide mini-program reference alignment. */
	.page-container {
		width: 750rpx;
		min-height: 100vh;
		background: #fbfefd;
		padding-bottom: calc(122rpx + env(safe-area-inset-bottom));
		overflow-x: hidden;
		font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
	}

	.status-bar {
		height: var(--status-bar-height);
	}

	.nav-bar,
	.order-nav,
	.discover-nav,
	.my-nav {
		width: 750rpx;
		box-sizing: border-box;
	}

	.capsule-menu {
		display: none !important;
	}

	.content-view-area {
		width: 750rpx;
		padding: 0;
		box-sizing: border-box;
	}

	.bottom-tab-bar {
		width: 750rpx;
		height: calc(122rpx + env(safe-area-inset-bottom));
		padding: 13rpx 0 0;
		align-items: flex-start;
		justify-content: space-around;
		background: rgba(251, 254, 253, 0.98);
		border-top: 1rpx solid rgba(32, 39, 37, 0.045);
		box-shadow: 0 -12rpx 34rpx rgba(29, 45, 40, 0.035);
	}

	.tab-bar-item {
		width: 128rpx;
		height: 100rpx;
		padding: 0;
		justify-content: flex-start;
	}

	.tabbar-icon,
	.tabbar-icon-container {
		width: 54rpx;
		height: 54rpx;
	}

	.tabbar-text {
		margin-top: 3rpx;
		font-size: 22rpx;
		line-height: 1.1;
		font-weight: 800;
		color: #121917;
	}

	.tab-bar-item.active .tabbar-text {
		color: #35cda4;
	}

	.badge-dot {
		top: 0;
		right: -1rpx;
		width: 12rpx;
		height: 12rpx;
		border-width: 2rpx;
	}

	/* Kitchen target */
	.tab-kitchen {
		background: #fbfefd;
	}

	.tab-kitchen .header-banner {
		width: 750rpx;
		height: 325rpx;
		background: #f3e7c4;
		overflow: hidden;
	}

	.tab-kitchen .banner-bg {
		width: 750rpx;
		height: 325rpx;
		object-fit: cover;
		object-position: 50% 44%;
	}

	.tab-kitchen .banner-mask {
		display: none;
	}

	.tab-kitchen .dashboard-card {
		width: 750rpx;
		height: 180rpx;
		min-height: 180rpx;
		margin: -30rpx 0 0 0;
		padding: 25rpx 24rpx 24rpx;
		border-radius: 44rpx 44rpx 0 0;
		background: #fbfefd;
		box-shadow: none;
	}

	.tab-kitchen .card-top-row {
		height: 118rpx;
	}

	.tab-kitchen .kitchen-avatar {
		width: 118rpx;
		height: 118rpx;
		border-radius: 17rpx;
	}

	.tab-kitchen .kitchen-info {
		margin-left: 22rpx;
		justify-content: center;
	}

	.tab-kitchen .kitchen-title {
		font-size: 42rpx;
		line-height: 1.05;
		font-weight: 900;
		color: #101716;
		letter-spacing: 0;
	}

	.tab-kitchen .kitchen-subtitle {
		margin-top: 16rpx;
		font-size: 26rpx;
		line-height: 1;
		font-weight: 800;
		color: #9ca3a8;
	}

	.tab-kitchen .chef-hat-icon-wrapper {
		top: 42rpx;
		right: 32rpx;
		width: 58rpx;
		height: 58rpx;
	}

	.tab-kitchen .svg-chef-hat {
		width: 58rpx;
		height: 58rpx;
	}

	.tab-kitchen .tabs-controls-row {
		width: 750rpx;
		height: 86rpx;
		margin: 0;
		padding: 0 28rpx 0 48rpx;
		border-bottom: 1rpx solid #ecefee;
		background: #fbfefd;
		box-sizing: border-box;
	}

	.tab-kitchen .tabs-container {
		gap: 50rpx;
	}

	.tab-kitchen .tab-item {
		height: 86rpx;
		padding: 0;
		justify-content: center;
	}

	.tab-kitchen .tab-text,
	.tab-kitchen .tab-item.active .tab-text {
		font-size: 30rpx;
		line-height: 1;
		font-weight: 900;
		color: #171d1b;
		letter-spacing: 0;
	}

	.tab-kitchen .active-indicator {
		bottom: 6rpx;
		width: 38rpx;
		height: 6rpx;
		border-radius: 6rpx;
		background: #35cda4;
	}

	.tab-kitchen .controls-container {
		gap: 16rpx;
	}

	.tab-kitchen .btn-random {
		display: none;
	}

	.tab-kitchen .control-btn {
		height: 48rpx;
		padding: 0;
		border-radius: 25rpx;
		font-size: 24rpx;
		line-height: 48rpx;
		font-weight: 900;
	}

	.tab-kitchen .btn-manage {
		width: 86rpx;
		border: 2rpx solid #35cda4;
		color: #35cda4;
		background: #fbfefd;
	}

	.tab-kitchen .btn-add {
		width: 132rpx;
		background: #35cda4;
		color: #fbfefd;
		box-shadow: none;
	}

	.tab-kitchen .btn-search {
		width: 112rpx;
		gap: 12rpx;
		color: #0f1413;
		background: #f7fbf9;
	}

	.tab-kitchen .svg-search {
		width: 35rpx;
		height: 35rpx;
	}

	.kitchen-category-strip {
		width: 750rpx;
		height: 92rpx;
		display: flex;
		align-items: center;
		background: #fbfefd;
		border-bottom: 1rpx solid #f0f1f1;
		box-sizing: border-box;
	}

	.category-strip-marker {
		left: 0;
		top: 31rpx;
		width: 6rpx;
		height: 30rpx;
		border-radius: 0 6rpx 6rpx 0;
		background: #35cda4;
	}

	.kitchen-category-tab {
		margin-left: 73rpx;
		font-size: 30rpx;
		line-height: 92rpx;
		font-weight: 900;
		color: #151b19;
	}

	.kitchen-category-tab.active {
		color: #35cda4;
	}

	.kitchen-category-strip .refresh-action {
		right: 40rpx;
		top: 20rpx;
		width: 52rpx;
		height: 52rpx;
	}

	.kitchen-category-strip .svg-refresh {
		width: 42rpx;
		height: 42rpx;
	}

	.kitchen-category-body {
		width: 750rpx;
		min-height: calc(100vh - 780rpx);
		display: flex;
		background: #fbfefd;
	}

	.kitchen-side-pane {
		width: 190rpx;
		min-height: calc(100vh - 780rpx);
		background: #f6f7f9;
		flex-shrink: 0;
	}

	.kitchen-side-pane .category-manage {
		height: 104rpx;
		padding: 0 0 0 26rpx;
		gap: 13rpx;
		border-radius: 0;
	}

	.kitchen-side-pane .svg-gear {
		width: 34rpx;
		height: 34rpx;
	}

	.kitchen-side-pane .category-text {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: #1f2523;
	}

	.kitchen-main-pane {
		flex: 1;
		background: #fbfefd;
	}

	.category-empty-pill {
		height: 80rpx;
		margin: 25rpx 22rpx 0;
		border-radius: 14rpx;
		background: #f7f8fa;
		font-size: 28rpx;
		line-height: 80rpx;
		font-weight: 900;
		color: #a9b0b6;
	}

	.tab-kitchen .cart-panel {
		left: 22rpx;
		right: 22rpx;
		bottom: calc(132rpx + env(safe-area-inset-bottom));
		height: 104rpx;
		padding: 0 18rpx 0 32rpx;
		border-radius: 54rpx;
		background: rgba(251, 254, 253, 0.98);
		box-shadow: 0 12rpx 42rpx rgba(31, 40, 38, 0.11);
	}

	/* Order target */
	.tab-order {
		background:
			radial-gradient(circle at 92% 27%, rgba(66, 209, 177, 0.18) 0 12rpx, transparent 13rpx),
			radial-gradient(circle at 8% 51%, rgba(66, 209, 177, 0.18) 0 10rpx, transparent 11rpx),
			linear-gradient(180deg, #eafaf6 0, #fbfdfc 230rpx, #fbfdfc 100%);
	}

	.tab-order .header-banner {
		width: 750rpx;
		height: 124rpx;
		overflow: visible;
	}

	.tab-order .order-header-bg {
		height: 160rpx;
		background:
			radial-gradient(circle at 83% 2%, rgba(66, 209, 177, 0.17) 0 96rpx, transparent 97rpx),
			linear-gradient(180deg, #e2f8f3 0%, rgba(251, 253, 252, 0) 100%);
	}

	.tab-order .order-nav {
		height: 60rpx;
		padding: 0 246rpx 0 24rpx;
		justify-content: flex-start;
	}

	.tab-order .order-nav-left {
		width: 100%;
		gap: 20rpx;
		flex-wrap: nowrap;
	}

	.tab-order .filter-text {
		font-size: 30rpx;
		font-weight: 900;
		line-height: 1;
		color: #202725;
	}

	.tab-order .filter-arrow {
		border-left-width: 8rpx;
		border-right-width: 8rpx;
		border-top-width: 10rpx;
		margin-left: 8rpx;
		border-top-color: #202725;
	}

	.tab-order .date-picker-btn {
		width: 176rpx;
		height: 58rpx;
		padding: 0;
		border: 0;
		border-radius: 30rpx;
		justify-content: center;
		background: rgba(251, 254, 253, 0.78);
		box-shadow: none;
	}

	.tab-order .date-text {
		font-size: 26rpx;
		line-height: 1;
		font-weight: 800;
		color: #909895;
	}

	.tab-order .order-tab-content {
		min-height: calc(100vh - 270rpx);
		padding-top: 0;
		overflow: visible;
	}

	.tab-order .order-top-row {
		height: 92rpx;
		padding: 0 22rpx;
		margin: 0;
		position: relative;
		z-index: 2;
	}

	.tab-order .order-decor-avocado-card {
		min-width: 346rpx;
		height: 92rpx;
	}

	.tab-order .avocado-img {
		left: -16rpx;
		top: 6rpx;
		width: 82rpx;
		height: 82rpx;
	}

	.tab-order .order-decor-text {
		margin-left: 0;
		font-size: 28rpx;
		line-height: 92rpx;
		font-weight: 900;
		color: #202725;
	}

	.tab-order .highlight-num {
		font-size: 32rpx;
		color: #35cda4;
		margin: 0 4rpx;
	}

	.tab-order .order-sub-tabs {
		gap: 34rpx;
		background: transparent;
		border: 0;
		box-shadow: none;
		padding: 0;
	}

	.tab-order .order-sub-tab {
		height: 48rpx;
		min-width: 156rpx;
		padding: 0 16rpx;
		border-radius: 28rpx;
		font-size: 28rpx;
		line-height: 48rpx;
		font-weight: 900;
		color: #2a312f;
	}

	.tab-order .order-sub-tab.active {
		min-width: 174rpx;
		background: #35cda4;
		color: #fbfefd;
	}

	.tab-order .order-empty-state {
		padding-top: 384rpx;
		padding-bottom: 312rpx;
	}

	.tab-order .order-empty-rabbit-img {
		width: 158rpx;
		height: 158rpx;
	}

	.tab-order .order-empty-text {
		margin-top: 32rpx;
		font-size: 28rpx;
		line-height: 1;
		font-weight: 800;
		color: #8d9091;
	}

	.tab-order .order-float-star {
		left: 56rpx;
		top: 792rpx;
		font-size: 39rpx;
		color: #ffd358;
		opacity: 0.95;
		text-shadow: none;
		animation: none;
	}

	.tab-order .order-float-calendar {
		right: 30rpx;
		top: 760rpx;
		width: 90rpx;
		height: 90rpx;
		animation: none;
	}

	.tab-order .float-calendar-img {
		width: 90rpx;
		height: 90rpx;
	}

	/* Discover target */
	.tab-discover {
		background:
			radial-gradient(circle at 91% 80%, rgba(63, 206, 174, 0.19) 0 10rpx, transparent 11rpx),
			linear-gradient(180deg, #eafaf6 0, #fbfdfc 238rpx, #fbfdfc 100%);
	}

	.tab-discover .discover-header {
		width: 750rpx;
		height: 130rpx;
		overflow: visible;
	}

	.tab-discover .discover-header-bg {
		height: 212rpx;
		background:
			radial-gradient(circle at 16% 4%, rgba(63, 206, 174, 0.18) 0 90rpx, transparent 91rpx),
			linear-gradient(180deg, #e1f8f3 0%, rgba(251, 253, 252, 0) 100%);
	}

	.tab-discover .discover-nav {
		height: 78rpx;
		padding: 0;
		justify-content: center;
	}

	.tab-discover .discover-title-text {
		font-size: 34rpx;
		line-height: 1;
		font-weight: 900;
		color: #182532;
		text-align: center;
	}

	.tab-discover .discover-nav-left {
		left: 70rpx;
		top: 2rpx;
	}

	.tab-discover .location-icon-img {
		width: 78rpx;
		height: 78rpx;
	}

	.tab-discover .discover-tab-content {
		padding: 0 20rpx 180rpx;
	}

	.tab-discover .discover-notice-bar {
		height: 64rpx;
		margin: 0 -20rpx 20rpx;
		padding: 0 28rpx;
		border-radius: 0 0 8rpx 8rpx;
		background: #dff8ef;
	}

	.tab-discover .notice-icon {
		font-size: 28rpx;
		margin-right: 10rpx;
	}

	.tab-discover .notice-text {
		font-size: 24rpx;
		line-height: 64rpx;
		font-weight: 900;
		color: #35cda4;
	}

	.tab-discover .discover-menu-list {
		gap: 16rpx;
		margin-bottom: 0;
	}

	.tab-discover .discover-menu-item {
		height: 92rpx;
		padding: 0 38rpx 0 34rpx;
		border-radius: 20rpx;
		background: rgba(251, 254, 253, 0.94);
		box-shadow: 0 10rpx 28rpx rgba(28, 45, 40, 0.025);
	}

	.tab-discover .eati-menu-item {
		height: 118rpx;
	}

	.tab-discover .menu-item-icon-bg {
		width: 62rpx;
		height: 62rpx;
		border-radius: 14rpx;
		background: #ecfaf5;
	}

	.tab-discover .menu-svg-icon {
		width: 48rpx;
		height: 48rpx;
	}

	.tab-discover .menu-item-title {
		margin-left: 22rpx;
		font-size: 30rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
	}

	.tab-discover .menu-title-sub-col {
		margin-left: 22rpx;
		gap: 14rpx;
	}

	.tab-discover .menu-title-sub-col .menu-item-title {
		margin-left: 0;
	}

	.tab-discover .menu-item-desc {
		font-size: 24rpx;
		line-height: 1;
		font-weight: 800;
		color: #9aa1a0;
	}

	.tab-discover .menu-item-arrow {
		width: 34rpx;
		height: 34rpx;
		opacity: 0.28;
	}

	/* My target */
	.tab-my {
		background:
			radial-gradient(circle at 92% 81%, rgba(63, 206, 174, 0.18) 0 8rpx, transparent 9rpx),
			linear-gradient(180deg, #35cda4 0 338rpx, #f8faf9 338rpx, #f8faf9 100%);
	}

	.tab-my .my-header {
		width: 750rpx;
		height: 338rpx;
		background: #35cda4;
		overflow: visible;
	}

	.tab-my .my-header-bg {
		height: 338rpx;
		background: #35cda4;
	}

	.tab-my .my-bg-circle-large {
		right: -48rpx;
		top: -78rpx;
		width: 292rpx;
		height: 292rpx;
	}

	.tab-my .my-bg-circle-small {
		right: 74rpx;
		top: 116rpx;
		width: 118rpx;
		height: 118rpx;
	}

	.tab-my .my-bg-circle-left {
		left: -88rpx;
		bottom: -56rpx;
		width: 232rpx;
		height: 232rpx;
	}

	.tab-my .my-nav {
		height: 176rpx;
		padding: 36rpx 36rpx 0;
		align-items: flex-start;
	}

	.tab-my .my-title-block {
		gap: 16rpx;
	}

	.tab-my .my-main-title {
		font-size: 42rpx;
		line-height: 1;
		font-weight: 900;
		color: #fbfefd;
		letter-spacing: 0;
	}

	.tab-my .my-sub-title {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: rgba(251, 254, 253, 0.96);
	}

	.tab-my .my-tab-content {
		padding: 0 17rpx 172rpx;
	}

	.tab-my .my-profile-card {
		height: 164rpx;
		min-height: 164rpx;
		margin: -99rpx 0 18rpx;
		padding: 24rpx 32rpx;
		border-radius: 22rpx;
		background: #dff8ef;
		box-shadow: none;
	}

	.tab-my .my-profile-avatar {
		width: 118rpx;
		height: 118rpx;
		border-radius: 50%;
		border: 0;
		box-shadow: none;
	}

	.tab-my .profile-names {
		margin-left: 28rpx;
		gap: 12rpx;
	}

	.tab-my .profile-username {
		font-size: 34rpx;
		line-height: 1;
		font-weight: 900;
		color: #333b39;
	}

	.tab-my .profile-user-id-row {
		gap: 8rpx;
		padding: 5rpx 12rpx;
		border-radius: 18rpx;
		background: rgba(251, 254, 253, 0.62);
	}

	.tab-my .profile-user-id {
		font-size: 26rpx;
		line-height: 1;
		font-weight: 700;
		color: #8f9695;
	}

	.tab-my .username-edit-pen-img {
		width: 28rpx;
		height: 28rpx;
	}

	.tab-my .username-copy-btn-img {
		width: 24rpx;
		height: 24rpx;
	}

	.tab-my .profile-carrot-badge {
		padding: 0;
		background: transparent;
		gap: 10rpx;
	}

	.tab-my .carrot-emoji,
	.tab-my .carrot-amount-num {
		font-size: 30rpx;
		line-height: 1;
	}

	.tab-my .carrot-amount-num {
		font-weight: 900;
		color: #35cda4;
	}

	.tab-my .my-swiper-menu-box {
		margin: 0 0 28rpx;
		padding: 34rpx 16rpx 24rpx;
		border-radius: 24rpx;
		background: #fbfefd;
		box-shadow: 0 12rpx 34rpx rgba(32, 45, 42, 0.035);
	}

	.tab-my .my-menu-swiper {
		height: 300rpx;
	}

	.tab-my .my-grid-layout {
		grid-template-columns: repeat(4, 1fr);
		row-gap: 28rpx;
	}

	.tab-my .my-grid-item-cell {
		min-height: 126rpx;
		gap: 14rpx;
	}

	.tab-my .my-grid-icon-circle {
		width: 84rpx;
		height: 84rpx;
		border-radius: 18rpx;
		background: #ebfaf5;
	}

	.tab-my .my-grid-svg {
		width: 58rpx;
		height: 58rpx;
	}

	.tab-my .my-grid-item-label {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: #3b413f;
	}

	.tab-my .my-swiper-dots {
		margin-top: 0;
		gap: 13rpx;
	}

	.tab-my .my-indicator-dot {
		width: 42rpx;
		height: 10rpx;
		border-radius: 10rpx;
		background: #d1d6d4;
	}

	.tab-my .my-indicator-dot.dot-circle {
		width: 12rpx;
		height: 12rpx;
	}

	.tab-my .my-indicator-dot.active {
		width: 42rpx;
		background: #35cda4;
	}

	.tab-my .my-activity-wall-card {
		margin: 0 0 28rpx;
		padding: 34rpx 24rpx;
		border-radius: 24rpx;
		background: #fbfefd;
		box-shadow: 0 12rpx 34rpx rgba(32, 45, 42, 0.035);
	}

	.tab-my .activity-wall-header {
		margin-bottom: 24rpx;
		gap: 12rpx;
	}

	.tab-my .activity-wall-title {
		font-size: 34rpx;
		line-height: 1;
		font-weight: 900;
		color: #2b3331;
	}

	.tab-my .activity-wall-help-icon {
		width: 28rpx;
		height: 28rpx;
	}

	.tab-my .month-txt-label {
		font-size: 24rpx;
		font-weight: 700;
		color: #23ad86;
	}

	.tab-my .activity-wall-squares-grid {
		grid-template-columns: repeat(24, 1fr);
		gap: 8rpx;
	}

	.tab-my .activity-wall-square {
		border-radius: 6rpx;
		background: #f0f4f6;
	}

	.tab-my .my-sub-notice-row {
		min-height: 138rpx;
		margin: 0 0 24rpx;
		padding: 24rpx 32rpx;
		border-radius: 18rpx;
		background: #fbfefd;
		box-shadow: 0 10rpx 30rpx rgba(32, 45, 42, 0.03);
	}

	.tab-my .bell-alert-icon {
		width: 54rpx;
		height: 54rpx;
	}

	.tab-my .sub-notice-main-text {
		font-size: 32rpx;
		line-height: 1;
		font-weight: 900;
		color: #333b39;
	}

	.tab-my .sub-notice-sub-text {
		font-size: 24rpx;
		line-height: 1;
		font-weight: 800;
		color: #9aa1a0;
	}

	.tab-my .sub-notice-status-lbl {
		font-size: 30rpx;
		font-weight: 900;
		color: #969d9b;
	}

	.tab-my .sub-notice-arrow-icon {
		font-size: 54rpx;
		line-height: 1;
		font-weight: 300;
		color: #c6cbc9;
	}

	.tab-my .my-footer-watermark-row {
		padding: 0 0 12rpx;
	}

	.tab-my .footer-watermark-text {
		font-size: 26rpx;
		line-height: 1;
		font-weight: 900;
		color: #a4aaad;
		letter-spacing: 0;
		font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
	}

	/* Kitchen order layout: left category rail + right dish list */
	.tab-kitchen .three-level-category-strip {
		height: 86rpx;
		padding: 0 96rpx 0 34rpx;
		gap: 0;
		justify-content: flex-start;
		border-top: 1rpx solid #f3f5f4;
		border-bottom: 1rpx solid #eef0ef;
		box-sizing: border-box;
	}

	.tab-kitchen .three-level-category-strip .category-strip-marker {
		top: 28rpx;
	}

	.tab-kitchen .level-one-text-scroll {
		width: 100%;
		height: 86rpx;
		white-space: nowrap;
		overflow: hidden;
		box-sizing: border-box;
	}

	.tab-kitchen .kitchen-category-label {
		height: 86rpx;
		margin-right: 40rpx;
		display: inline-flex;
		align-items: center;
		vertical-align: top;
		font-size: 30rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
		white-space: nowrap;
	}

	.tab-kitchen .kitchen-category-label.active {
		color: #35cda4;
	}

	.tab-kitchen .three-level-category-strip .refresh-action {
		top: 17rpx;
		right: 34rpx;
	}

	.tab-kitchen .kitchen-category-body {
		width: 750rpx;
		min-height: calc(100vh - 682rpx);
		display: flex;
		align-items: stretch;
		background: #fbfefd;
	}

	.tab-kitchen .kitchen-side-pane {
		width: 188rpx;
		min-height: calc(100vh - 682rpx);
		background: #f7f8fa;
		flex-shrink: 0;
	}

	.tab-kitchen .side-category {
		height: 108rpx;
		padding: 0 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 800;
		color: #3e4542;
		position: relative;
		text-align: center;
		box-sizing: border-box;
	}

	.tab-kitchen .side-category.active {
		background: #fbfefd;
		color: #35cda4;
		font-weight: 900;
	}

	.tab-kitchen .side-category.active::before {
		content: "";
		position: absolute;
		left: 0;
		top: 37rpx;
		width: 6rpx;
		height: 34rpx;
		border-radius: 0 6rpx 6rpx 0;
		background: #35cda4;
	}

	.tab-kitchen .category-manage {
		height: 118rpx;
		margin-top: 10rpx;
		padding: 0 14rpx 0 24rpx;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 12rpx;
		border-radius: 0;
		background: transparent;
		box-sizing: border-box;
	}

	.tab-kitchen .category-breadcrumb {
		display: none;
	}

	.tab-kitchen .category-main-head {
		height: 88rpx;
		padding: 0 28rpx;
		display: flex;
		align-items: center;
		font-size: 34rpx;
		font-weight: 800;
		color: #202725;
		box-sizing: border-box;
	}

	.tab-kitchen .breadcrumb-separator {
		color: #b9c1be;
		font-size: 28rpx;
		line-height: 1;
	}

	.tab-kitchen .breadcrumb-current {
		color: #35cda4;
	}

	.tab-kitchen .kitchen-dish-list {
		padding: 0 24rpx 210rpx 26rpx;
		display: flex;
		flex-direction: column;
		gap: 0;
		box-sizing: border-box;
	}

	.tab-kitchen .kitchen-dish-card {
		height: 196rpx;
		margin: 0;
		padding: 18rpx 0;
		display: flex;
		align-items: center;
		border-radius: 0;
		background: #fbfefd;
		border: 0;
		box-shadow: none;
		box-sizing: border-box;
		position: relative;
	}

	.tab-kitchen .kitchen-dish-card.active {
		box-shadow: none;
	}

	.tab-kitchen .kitchen-dish-card.selected {
		background: #f5fffb;
	}

	.tab-kitchen .kitchen-dish-img {
		width: 160rpx;
		height: 128rpx;
		border-radius: 8rpx;
		background: #f4f6f5;
		flex-shrink: 0;
	}

	.tab-kitchen .kitchen-dish-info {
		flex: 1;
		min-width: 0;
		height: 128rpx;
		margin-left: 22rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 6rpx 0 8rpx;
		box-sizing: border-box;
	}

	.tab-kitchen .dish-action-cell {
		width: 64rpx;
		height: 128rpx;
		margin-left: 8rpx;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-shrink: 0;
	}

	.tab-kitchen .kitchen-dish-name {
		font-size: 32rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tab-kitchen .kitchen-dish-desc,
	.tab-kitchen .kitchen-dish-sales {
		font-size: 22rpx;
		line-height: 1;
		font-weight: 700;
		color: #9ba3a0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tab-kitchen .dish-select-btn {
		width: 54rpx;
		height: 54rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		background: #35cda4;
		color: #fbfefd;
		font-size: 40rpx;
		line-height: 1;
		font-weight: 900;
		box-sizing: border-box;
		flex-shrink: 0;
		position: relative;
		z-index: 2;
		box-shadow: 0 8rpx 18rpx rgba(53, 205, 164, 0.25);
		transition: transform 160ms ease-out, opacity 160ms ease-out;
	}

	.tab-kitchen .kitchen-dish-card.selected .dish-select-btn {
		background: #18c256;
		color: #fbfefd;
	}

	.tab-kitchen .dish-select-btn:active {
		transform: scale(0.92);
		opacity: 0.86;
	}

	.tab-kitchen .dish-plus-symbol {
		display: block;
		line-height: 1;
		transform: translateY(-3rpx);
	}

	.tab-kitchen .select-checkmark {
		width: 18rpx;
		height: 10rpx;
		border-left: 4rpx solid currentColor;
		border-bottom: 4rpx solid currentColor;
		transform: rotate(-45deg);
		margin-top: -4rpx;
		box-sizing: border-box;
	}

	/* Share square feed */
	.tab-discover .discover-title-text {
		font-size: 36rpx;
		font-weight: 900;
		color: #182532;
	}

	.tab-discover .discover-tab-content {
		padding: 0 22rpx 176rpx;
		box-sizing: border-box;
	}

	.share-square-hero {
		width: 706rpx;
		min-height: 126rpx;
		margin: 0 0 18rpx;
		padding: 22rpx 24rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-radius: 24rpx;
		background: rgba(251, 254, 253, 0.96);
		box-shadow: 0 10rpx 28rpx rgba(28, 45, 40, 0.035);
		box-sizing: border-box;
	}

	.share-square-left {
		min-width: 0;
		display: flex;
		align-items: center;
	}

	.share-square-icon {
		width: 72rpx;
		height: 72rpx;
		border-radius: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #e9faf5;
		flex-shrink: 0;
	}

	.share-square-icon-img {
		width: 52rpx;
		height: 52rpx;
	}

	.share-square-copy {
		min-width: 0;
		margin-left: 18rpx;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.share-square-name {
		font-size: 32rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
	}

	.share-square-desc {
		font-size: 23rpx;
		line-height: 1;
		font-weight: 700;
		color: #8f9794;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.share-publish-btn {
		width: 148rpx;
		height: 56rpx;
		margin-left: 18rpx;
		border-radius: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #35cda4;
		color: #fbfefd;
		font-size: 24rpx;
		line-height: 1;
		font-weight: 900;
		flex-shrink: 0;
		box-shadow: 0 8rpx 20rpx rgba(53, 205, 164, 0.18);
	}

	.share-composer {
		width: 706rpx;
		height: 94rpx;
		margin-bottom: 18rpx;
		padding: 0 22rpx;
		display: flex;
		align-items: center;
		border-radius: 22rpx;
		background: #fbfefd;
		box-shadow: 0 8rpx 24rpx rgba(28, 45, 40, 0.028);
		box-sizing: border-box;
	}

	.share-composer-avatar {
		width: 56rpx;
		height: 56rpx;
		border-radius: 50%;
		background: #eef5f2;
		flex-shrink: 0;
	}

	.share-composer-placeholder {
		height: 56rpx;
		margin-left: 16rpx;
		padding: 0 18rpx;
		display: flex;
		align-items: center;
		border-radius: 28rpx;
		background: #f5f8f7;
		color: #9aa2a0;
		font-size: 25rpx;
		font-weight: 700;
		flex: 1;
		box-sizing: border-box;
	}

	.share-composer-camera {
		width: 42rpx;
		height: 42rpx;
		margin-left: 16rpx;
		flex-shrink: 0;
		opacity: 0.72;
	}

	.share-feed-list {
		display: flex;
		flex-direction: column;
		gap: 18rpx;
	}

	.share-empty-state {
		padding: 80rpx 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.share-empty-text {
		font-size: 26rpx;
		color: #9aa2a0;
		font-weight: 500;
	}

	.share-post-card {
		width: 706rpx;
		padding: 24rpx 24rpx 20rpx;
		border-radius: 24rpx;
		background: rgba(251, 254, 253, 0.98);
		box-shadow: 0 10rpx 30rpx rgba(28, 45, 40, 0.03);
		box-sizing: border-box;
	}

	.share-post-head {
		display: flex;
		align-items: center;
		margin-bottom: 18rpx;
	}

	.share-post-avatar {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background: #eef5f2;
		flex-shrink: 0;
	}

	.share-post-user {
		min-width: 0;
		margin-left: 16rpx;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.share-post-name {
		font-size: 27rpx;
		line-height: 1;
		font-weight: 900;
		color: #22302c;
	}

	.share-post-time {
		font-size: 21rpx;
		line-height: 1;
		font-weight: 700;
		color: #a1a9a6;
	}

	.share-post-title {
		display: block;
		margin-bottom: 12rpx;
		font-size: 31rpx;
		line-height: 1.2;
		font-weight: 900;
		color: #202725;
	}

	.share-post-content {
		display: block;
		margin-bottom: 18rpx;
		font-size: 26rpx;
		line-height: 1.45;
		font-weight: 700;
		color: #4d5653;
	}

	.share-post-img {
		width: 658rpx;
		height: 328rpx;
		border-radius: 18rpx;
		background: #eef3f1;
	}

	.share-post-tags {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12rpx;
		margin: 18rpx 0 16rpx;
	}

	.share-post-tag {
		height: 38rpx;
		padding: 0 14rpx;
		display: flex;
		align-items: center;
		border-radius: 20rpx;
		background: #eaf9f4;
		color: #25b58d;
		font-size: 21rpx;
		font-weight: 800;
		box-sizing: border-box;
	}

	.share-post-actions {
		height: 44rpx;
		display: flex;
		align-items: center;
		gap: 28rpx;
		border-top: 1rpx solid #eef2f1;
		padding-top: 16rpx;
	}

	.share-action {
		display: flex;
		align-items: center;
		gap: 8rpx;
		color: #7c8582;
		font-size: 23rpx;
		font-weight: 800;
	}

	.share-action-icon {
		color: #35cda4;
	}

	/* My page: only keep needed menu entries */
	.tab-my .my-menu-swiper {
		height: 150rpx;
	}

	.tab-my .my-swiper-menu-box {
		padding-bottom: 28rpx;
	}

	.tab-my .my-swiper-dots.single-dot {
		display: none;
	}

	/* 我的订单列表 */
	.my-order-list {
		padding: 8rpx 24rpx 24rpx;
	}
	.my-order-card {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 24rpx 28rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.04);
	}
	.my-order-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 14rpx;
	}
	.my-order-no {
		font-size: 26rpx;
		color: #333333;
		font-weight: 600;
	}
	.my-order-status {
		font-size: 24rpx;
		color: #10B981;
		background: rgba(16,185,129,0.1);
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
	}
	.my-order-status.st-4 {
		color: #9CA3AF;
		background: rgba(156,163,175,0.12);
	}
	.my-order-status.st-3 {
		color: #6B7280;
		background: rgba(107,114,128,0.1);
	}
	.my-order-body {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10rpx;
	}
	.my-order-service {
		font-size: 26rpx;
		color: #4B5563;
	}
	.my-order-amount {
		font-size: 28rpx;
		color: #F97316;
		font-weight: 600;
	}
	.my-order-time {
		font-size: 22rpx;
		color: #9CA3AF;
	}
</style>
