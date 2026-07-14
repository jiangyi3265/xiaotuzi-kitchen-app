<template>
	<view class="page">
		<view class="head"><text class="back" @tap="back">‹</text><text class="title">情侣空间</text><text class="rank" @tap="showRank=true">榜单</text></view>
		<view class="page-loading" v-if="loadingSpace">正在加载情侣空间...</view>
		<view class="bind" v-else-if="!space">
			<view class="heart">♥</view><text class="bind-title">把一日三餐，变成两个人的事</text>
			<text class="bind-desc">创建空间后分享邀请码，绑定后双方都能共同点餐和异地投喂</text>
			<picker mode="date" :value="startDate" @change="startDate=$event.detail.value"><view class="date-input">相恋日期：{{startDate}}</view></picker>
			<view class="primary" :class="{disabled:!!actionBusy}" @tap="create">{{ actionBusy === 'create' ? '创建中...' : '创建情侣空间' }}</view><text class="or">已有邀请码</text>
			<view class="join"><input v-model="inviteCode" maxlength="6" placeholder="输入6位邀请码"/><text :class="{disabled:!!actionBusy}" @tap="join">{{ actionBusy === 'join' ? '绑定中...' : '绑定' }}</text></view>
		</view>
		<scroll-view class="body" scroll-y v-else>
			<view class="feed-notice" v-if="unreadFeed" @tap="openFeedNotice"><view class="notice-icon">投</view><view><text>{{latestFeed.title}}</text><text>{{latestFeed.content}}</text></view><text>查看订单 ›</text></view>
			<view class="love-card">
				<text class="days">{{days}}</text><text class="days-label">我们在一起的天数</text>
				<view class="couple"><view><image src="/static/kitchen_avatar.png"/><text>我</text></view><text class="line">♥</text><view><image src="/static/kitchen_avatar.png"/><text>{{space.userB?'TA':'等待绑定'}}</text></view></view>
				<view class="invite" v-if="!space.userB">邀请码 {{space.inviteCode}} <button open-type="share">邀请 TA</button></view>
			</view>
			<view class="actions">
				<view @tap="goFeed"><text class="action-icon">投</text><text class="action-title">异地投喂</text><text class="action-desc">给对方远程下单</text></view>
				<view @tap="goOrder"><text class="action-icon">菜</text><text class="action-title">一起点菜</text><text class="action-desc">按分类选择并下单</text></view>
				<view @tap="showRank=true"><text class="action-icon">榜</text><text class="action-title">情侣榜单</text><text class="action-desc">查看甜蜜排行</text></view>
			</view>
			<view class="section-row shared-title"><text>双方共同菜单</text><text @tap="goOrder">继续点菜</text></view>
			<view class="shared-menu" v-if="space.items&&space.items.length">
				<view class="shared-row" v-for="item in space.items" :key="item.userId+'-'+item.dishId"><image :src="item.cover||'/static/onion_chicken.png'" mode="aspectFill"/><view><text>{{item.dishName}}</text><text>{{String(item.userId)===String(space.currentUserId)?'我':item.addedBy}} 点了 {{item.quantity}}份</text></view><text>￥{{item.subtotal}}</text></view>
			</view>
			<view class="empty shared-empty" v-else @tap="goOrder">还没有共同选菜，点这里一起挑选</view>
			<view class="section-row"><text>我们的纪念日</text><text @tap="showAdd=true">＋ 添加</text></view>
			<view class="ann-list" v-if="space.anniversaries&&space.anniversaries.length"><view class="ann" v-for="a in space.anniversaries" :key="a.id"><text class="calendar">纪</text><view><text>{{a.title}}</text><text>{{a.anniversaryDate}}</text></view></view></view>
			<view class="empty" v-else>还没有纪念日，添加一个重要日子吧</view>
			<text class="feed-stat">我们已经异地投喂 <text>{{space.feedCount||0}}</text> 次</text>
			<view class="unbind" :class="{disabled:!!actionBusy}" @tap="unbind">{{ actionBusy === 'unbind' ? '解除中...' : '解除情侣空间' }}</view>
			<view class="safe-space"></view>
		</scroll-view>
		<view class="mask" v-if="showAdd||showRank" @tap="showAdd=false;showRank=false"></view>
		<view class="sheet" v-if="showAdd"><text class="sheet-title">添加纪念日</text><input v-model="annTitle" maxlength="80" placeholder="纪念日名称"/><picker mode="date" :value="annDate" @change="annDate=$event.detail.value"><view class="date-input">{{annDate}}</view></picker><view class="primary" :class="{disabled:!!actionBusy}" @tap="addAnn">{{ actionBusy === 'anniversary' ? '保存中...' : '保存' }}</view></view>
		<view class="sheet rank-sheet" v-if="showRank"><text class="sheet-title">情侣投喂榜</text><view class="rank-row" v-for="(r,i) in leaderboard" :key="r.id"><text>{{i+1}}</text><text>{{r.userAName}} ♥ {{r.userBName}}</text><text>{{r.feedCount}}次</text></view><view class="empty" v-if="!leaderboard.length">还没有榜单数据</view></view>
	</view>
</template>
<script>
	import { apiCoupleCreate, apiCoupleJoin, apiCoupleDetail, apiCoupleAnniversary, apiCoupleLeaderboard, apiCoupleUnbind, apiSocialNotifications, apiSocialNotificationsRead } from '@/api/social.js'
	import { ensureLogin } from '@/utils/login.js'

	export default {
		data() {
			const today = new Date().toISOString().slice(0, 10)
			return {
				space: null,
				loadingSpace: true,
				actionBusy: '',
				startDate: today,
				inviteCode: '',
				showAdd: false,
				annTitle: '',
				annDate: today,
				showRank: false,
				leaderboard: [],
				notices: [],
				unreadFeed: 0
			}
		},
		computed: {
			days() {
				if (!this.space || !this.space.startDate) return 0
				const start = new Date(this.space.startDate).getTime()
				return Number.isFinite(start) ? Math.max(1, Math.floor((Date.now() - start) / 86400000) + 1) : 0
			},
			latestFeed() {
				return this.notices.find(item => item.type === 'couple_feed') || {}
			}
		},
		onLoad(options = {}) {
			if (options.code) this.inviteCode = String(options.code).trim().toUpperCase()
			this.loadRank()
		},
		onShow() {
			this.load()
			this.loadNotices()
		},
		onShareAppMessage() {
			return {
				title: '邀请你绑定我们的情侣空间',
				path: '/pages/couple-space/couple-space?code=' + (this.space ? this.space.inviteCode : '')
			}
		},
		methods: {
			async load() {
				let shouldAutoJoin = false
				try {
					await ensureLogin()
					const res = await apiCoupleDetail()
					this.space = res.data || null
					shouldAutoJoin = !this.space && !!this.inviteCode && !this.actionBusy
				} catch (e) {} finally {
					this.loadingSpace = false
				}
				if (shouldAutoJoin) await this.join()
			},
			async loadNotices() {
				try {
					await ensureLogin()
					const res = await apiSocialNotifications()
					const data = (res && res.data) || {}
					this.notices = data.rows || []
					this.unreadFeed = this.notices.filter(item => item.type === 'couple_feed' && String(item.readFlag) === '0').length
				} catch (e) {}
			},
			async openFeedNotice() {
				uni.setStorageSync('afterSubmitGoOrder', '1')
				try {
					await apiSocialNotificationsRead()
					this.unreadFeed = 0
				} catch (e) {}
				uni.navigateBack()
			},
			async create() {
				if (this.actionBusy) return
				try {
					this.actionBusy = 'create'
					const res = await apiCoupleCreate({ startDate: this.startDate })
					this.space = res.data
					await this.load()
				} catch (e) {} finally {
					this.actionBusy = ''
				}
			},
			async join() {
				if (this.actionBusy) return
				const inviteCode = this.inviteCode.trim().toUpperCase()
				if (!/^[A-Z0-9]{6}$/.test(inviteCode)) {
					uni.showToast({ title: '请输入正确的6位邀请码', icon: 'none' })
					return
				}
				try {
					this.actionBusy = 'join'
					await apiCoupleJoin({ inviteCode })
					this.inviteCode = inviteCode
					await this.load()
					uni.showToast({ title: '绑定成功', icon: 'success' })
				} catch (e) {} finally {
					this.actionBusy = ''
				}
			},
			async addAnn() {
				if (this.actionBusy) return
				const title = this.annTitle.trim()
				if (!title) {
					uni.showToast({ title: '请填写纪念日名称', icon: 'none' })
					return
				}
				try {
					this.actionBusy = 'anniversary'
					await apiCoupleAnniversary({ title, anniversaryDate: this.annDate })
					this.showAdd = false
					this.annTitle = ''
					await this.load()
					uni.showToast({ title: '纪念日已保存', icon: 'success' })
				} catch (e) {} finally {
					this.actionBusy = ''
				}
			},
			goOrder() {
				if (!this.space || !this.space.userB) {
					uni.showToast({ title: '请先邀请对方完成绑定', icon: 'none' })
					return
				}
				uni.navigateTo({ url: '/pages/social-order/social-order?mode=couple' })
			},
			goFeed() {
				if (!this.space || !this.space.userB) {
					uni.showToast({ title: '请先邀请对方完成绑定', icon: 'none' })
					return
				}
				uni.navigateTo({ url: '/pages/social-order/social-order?mode=couple&remote=1' })
			},
			unbind() {
				if (this.actionBusy) return
				uni.showModal({
					title: '解除情侣空间',
					content: '解除后双方将不能继续共同点餐，历史订单仍会保留。',
					confirmText: '确认解除',
					confirmColor: '#d05e70',
					success: async res => {
						if (!res.confirm) return
						try {
							this.actionBusy = 'unbind'
							await apiCoupleUnbind()
							this.space = null
							this.inviteCode = ''
							uni.showToast({ title: '已解除', icon: 'success' })
						} catch (e) {} finally {
							this.actionBusy = ''
						}
					}
				})
			},
			async loadRank() {
				try {
					const res = await apiCoupleLeaderboard()
					this.leaderboard = res.data || []
				} catch (e) {}
			},
			back() {
				uni.navigateBack()
			}
		}
	}
</script>
<style>
	.page{min-height:100vh;background:#fff7f7;color:#31282a}.head{height:166rpx;padding:calc(34rpx + env(safe-area-inset-top)) 28rpx 22rpx;display:flex;align-items:flex-end;background:linear-gradient(135deg,#ffe3e8,#fff8f5);box-sizing:border-box}.back{width:62rpx;font-size:54rpx}.title{flex:1;font-size:38rpx;font-weight:900}.rank{color:#d8677e;font-weight:800}.page-loading{padding:120rpx 30rpx;text-align:center;color:#9b888c}.bind{padding:44rpx 30rpx;display:flex;flex-direction:column;align-items:center}.heart{width:120rpx;height:120rpx;border-radius:40rpx;background:#ffebef;color:#ed7188;text-align:center;line-height:120rpx;font-size:58rpx}.bind-title{margin-top:28rpx;font-size:34rpx;font-weight:900}.bind-desc{margin:14rpx 20rpx 28rpx;text-align:center;font-size:24rpx;line-height:1.6;color:#917d82}.date-input{height:78rpx;padding:0 24rpx;border-radius:16rpx;background:#fff;display:flex;align-items:center;box-sizing:border-box;color:#796b6e}.bind picker{width:100%}.primary{width:100%;height:82rpx;margin-top:18rpx;border-radius:42rpx;background:#e9788f;color:#fff;display:flex;align-items:center;justify-content:center;font-size:29rpx;font-weight:900}.primary.disabled,.join text.disabled,.unbind.disabled{opacity:.5;pointer-events:none}.or{margin:30rpx;color:#a79599}.join{width:100%;height:80rpx;padding:0 22rpx;border-radius:16rpx;background:#fff;display:flex;align-items:center;box-sizing:border-box}.join input{flex:1}.join text{color:#d8677e;font-weight:900}.body{height:calc(100vh - 166rpx)}.love-card{margin:24rpx;padding:34rpx;border-radius:30rpx;background:linear-gradient(145deg,#ef7e93,#f4a4a5);color:#fff;text-align:center;box-shadow:0 14rpx 30rpx rgba(220,95,119,.2)}.days{display:block;font-size:72rpx;font-weight:900}.days-label{font-size:23rpx;opacity:.86}.couple{margin-top:28rpx;display:flex;align-items:center;justify-content:center;gap:26rpx}.couple>view{display:flex;flex-direction:column}.couple image{width:84rpx;height:84rpx;border-radius:50%;border:4rpx solid rgba(255,255,255,.7)}.line{font-size:36rpx}.invite{margin-top:20rpx}.invite button{display:inline-block;margin-left:12rpx;padding:0 18rpx;height:50rpx;line-height:50rpx;border-radius:25rpx;font-size:21rpx}.actions{margin:0 24rpx;display:grid;grid-template-columns:repeat(3,1fr);gap:12rpx}.actions>view{padding:22rpx 8rpx;border-radius:20rpx;background:#fff;display:flex;flex-direction:column;align-items:center}.action-icon{width:58rpx;height:58rpx;border-radius:20rpx;background:#fff0f2;color:#d8677e;text-align:center;line-height:58rpx;font-weight:900}.action-title{margin-top:10rpx;font-weight:900}.action-desc{margin-top:5rpx;font-size:18rpx;color:#927f83}.section-row{padding:34rpx 30rpx 16rpx;display:flex;justify-content:space-between;font-size:29rpx;font-weight:900}.section-row text:last-child{font-size:23rpx;color:#d8677e}.ann-list{margin:0 24rpx;border-radius:22rpx;background:#fff;overflow:hidden}.ann{padding:20rpx;display:flex;align-items:center;border-bottom:1rpx solid #f4e9eb}.calendar{width:82rpx;height:70rpx;border-radius:15rpx;background:#fff0f2;color:#d8677e;text-align:center;line-height:70rpx;font-weight:900}.ann>view{margin-left:16rpx;display:flex;flex-direction:column}.ann>view text:first-child{font-weight:900}.ann>view text:last-child{margin-top:7rpx;font-size:21rpx;color:#a28f93}.empty{padding:38rpx;text-align:center;color:#a89599}.feed-stat{display:block;margin:22rpx 24rpx;text-align:center;color:#9b888c}.feed-stat text{color:#d8677e;font-weight:900}.unbind{margin:30rpx auto 0;width:260rpx;height:68rpx;border:2rpx solid #e4c7cc;border-radius:36rpx;color:#b76070;display:flex;align-items:center;justify-content:center;font-weight:800}.safe-space{height:80rpx}.mask{position:fixed;inset:0;background:rgba(40,30,33,.45);z-index:20}.sheet{position:fixed;left:0;right:0;bottom:0;z-index:21;padding:30rpx 28rpx calc(30rpx + env(safe-area-inset-bottom));border-radius:28rpx 28rpx 0 0;background:#fff}.sheet-title{display:block;font-size:33rpx;font-weight:900;margin-bottom:20rpx}.sheet input{height:78rpx;padding:0 22rpx;background:#faf3f4;border-radius:16rpx;margin-bottom:14rpx}.rank-row{height:76rpx;display:grid;grid-template-columns:50rpx 1fr 80rpx;align-items:center;border-bottom:1rpx solid #f2e8ea}.rank-row text:last-child{color:#d8677e;text-align:right}.rank-sheet{max-height:70vh;overflow:auto}
	.feed-notice{margin:18rpx 24rpx 0;padding:18rpx 20rpx;display:flex;align-items:center;border:1rpx solid #f0cbd2;border-radius:20rpx;background:#fff0f3}.notice-icon{width:58rpx;height:58rpx;display:flex;align-items:center;justify-content:center;border-radius:18rpx;background:#e9788f;color:#fff;font-weight:900}.feed-notice>view:nth-child(2){flex:1;margin-left:14rpx;display:flex;flex-direction:column}.feed-notice>view:nth-child(2) text:first-child{font-size:24rpx;font-weight:900}.feed-notice>view:nth-child(2) text:last-child{margin-top:5rpx;color:#947d82;font-size:19rpx}.feed-notice>text:last-child{color:#c55f73;font-size:20rpx;font-weight:800}.shared-menu{margin:0 24rpx;border-radius:22rpx;background:#fff;overflow:hidden}.shared-row{min-height:104rpx;padding:14rpx 18rpx;display:flex;align-items:center;border-bottom:1rpx solid #f4e9eb}.shared-row:last-child{border-bottom:0}.shared-row image{width:76rpx;height:76rpx;border-radius:13rpx}.shared-row>view{flex:1;margin-left:14rpx;display:flex;flex-direction:column}.shared-row>view text:first-child{font-size:25rpx;font-weight:900}.shared-row>view text:last-child{margin-top:6rpx;color:#a07f87;font-size:20rpx}.shared-row>text:last-child{color:#d8677e;font-weight:900}.shared-empty{margin:0 24rpx;padding:30rpx;border:1rpx dashed #edcbd2;border-radius:20rpx;background:#fff}
</style>
