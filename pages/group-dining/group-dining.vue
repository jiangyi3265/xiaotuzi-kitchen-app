<template>
	<view class="page" :class="{ embedded }">
		<view class="header">
			<view class="header-back" v-if="!embedded || room" @tap="handleBack">‹</view>
			<view class="header-copy">
				<text class="header-title">多人聚餐</text>
				<text class="header-subtitle">一起点菜，热闹开饭</text>
			</view>
			<view class="header-search" @tap="promptJoin">⌕</view>
		</view>

		<scroll-view class="page-scroll" scroll-y v-if="!room">
			<view class="create-card">
				<view class="create-copy">
					<text class="create-title">创建聚餐房间</text>
					<text class="create-desc">邀请朋友加入，共同点菜和准备采购清单</text>
					<input class="room-name-input" v-model="title" maxlength="20" placeholder="给聚餐起个名字" />
					<view class="create-button" :class="{ disabled: creating }" @tap="create">{{ creating ? '创建中' : '新建房间' }}</view>
				</view>
				<view class="food-orb">
					<image src="/static/onion_chicken.png" mode="aspectFill"></image>
					<text>聚</text>
				</view>
			</view>

			<view class="section-heading">
				<text>进行中的聚餐</text>
				<text @tap="loadRooms">刷新</text>
			</view>
			<scroll-view class="room-scroll" scroll-x show-scrollbar="false" v-if="myRooms.length">
				<view class="room-list">
					<view class="ongoing-card" v-for="item in myRooms" :key="item.id" @tap="open(item.id)">
						<image :src="item.cover || '/static/kitchen_banner.png'" mode="aspectFill"></image>
						<view class="ongoing-copy">
							<text class="ongoing-title">{{ item.title }}</text>
							<text>{{ item.memberCount || 1 }}人 · 已选{{ item.itemCount || 0 }}道菜</text>
						</view>
					</view>
				</view>
			</scroll-view>
			<view class="rooms-empty" v-else>
				<text>还没有进行中的聚餐</text>
				<text>创建房间或输入好友的房间码加入</text>
			</view>

			<view class="join-card">
				<input v-model="joinCode" maxlength="6" placeholder="输入6位房间码" />
				<view @tap="join">加入房间</view>
			</view>

			<view class="quick-actions">
				<view @tap="scanJoin"><view class="action-icon">⌗</view><text>扫码加入</text></view>
				<button open-type="share" class="action-button"><view class="action-icon">邀</view><text>邀请好友</text></button>
				<view @tap="openLatestRoom"><view class="action-icon">菜</view><text>共同点菜</text></view>
				<view @tap="openLatestSettlement"><view class="action-icon">AA</view><text>AA结算</text></view>
			</view>
			<view class="bottom-space"></view>
		</scroll-view>

		<scroll-view class="page-scroll room-page" scroll-y v-else>
			<view class="active-room-card">
				<view class="active-room-head">
					<view>
						<text class="active-room-title">{{ room.title }}</text>
						<text class="active-room-code" @tap="copyRoomCode">房间码 {{ room.roomCode }} · 点击复制</text>
					</view>
					<view class="room-live">进行中</view>
				</view>
				<view class="room-action-row">
					<view @tap="showQrCode"><text>⌗</text><text class="action-label">房间二维码</text></view>
					<button open-type="share"><text>邀</text><text class="action-label">邀请好友</text></button>
					<view @tap="randomDish"><text>趣</text><text class="action-label">随机点菜</text></view>
					<view @tap="showSettlement"><text>AA</text><text class="action-label">费用结算</text></view>
				</view>
			</view>

			<view class="members-card">
				<view class="card-title-row"><text>聚餐成员</text><text>{{ room.members.length }}人</text></view>
				<scroll-view scroll-x class="member-scroll" show-scrollbar="false">
					<view class="member-list">
						<view class="member" v-for="member in room.members" :key="member.userId">
							<image :src="member.avatar || '/static/kitchen_avatar.png'" mode="aspectFill"></image>
							<text>{{ member.nickname }}</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<view class="bill-card">
				<view><text>聚餐总计</text><text class="bill-value">￥{{ room.total || 0 }}</text></view>
				<view class="bill-divider"></view>
				<view><text>每人应付</text><text class="bill-value mint">￥{{ room.aa || 0 }}</text></view>
			</view>

			<view class="card-title-row section-title-row">
				<text>已购清单</text>
				<text>共￥{{ room.purchasedTotal || 0 }}</text>
			</view>
			<view class="ordered-list" v-if="room.purchasedItems && room.purchasedItems.length">
				<view class="ordered-item" v-for="item in room.purchasedItems" :key="item.dishId">
					<image :src="item.cover || '/static/onion_chicken.png'" mode="aspectFill"></image>
					<view class="ordered-main">
						<text>{{ item.dishName }}</text>
						<text>已下单 · ￥{{ item.price }} × {{ item.quantity }}</text>
					</view>
					<text class="ordered-price">￥{{ item.subtotal }}</text>
				</view>
			</view>
			<view class="rooms-empty ordered-empty" v-else>还没有已购菜品，提交订单后会显示在这里</view>

			<view class="card-title-row section-title-row"><text>一起加菜</text><text>点击＋加入菜单</text></view>
			<scroll-view class="category-scroll" scroll-x show-scrollbar="false">
				<view class="category-list">
					<view class="category-chip" :class="{ active: activeCategoryId === '' }" @tap="activeCategoryId = ''">全部</view>
					<view class="category-chip" :class="{ active: String(activeCategoryId) === String(cat.id) }" v-for="cat in categories" :key="cat.id" @tap="activeCategoryId = cat.id">{{ cat.catName }}</view>
				</view>
			</scroll-view>
			<view class="dish-grid">
				<view class="dish-card" v-for="dish in filteredDishes" :key="dish.id">
					<image :src="dish.cover || '/static/onion_chicken.png'" mode="aspectFill"></image>
					<text class="dish-name">{{ dish.dishName }}</text>
					<view><text>￥{{ dish.virtualPrice || 0 }}</text><text class="dish-add" @tap="add(dish)">＋</text></view>
				</view>
			</view>
			<view class="bottom-space"></view>
		</scroll-view>
		<view class="room-cart-bar" v-if="room && !cartVisible">
			<view class="room-cart-summary" @tap="cartVisible=true"><view class="room-cart-icon"><image src="/static/cart.svg" mode="aspectFit"></image><text>{{room.items.length}}</text></view><view><text>共同购物车</text><text>{{room.items.reduce((s,item)=>s+Number(item.quantity||0),0)}}份 · ￥{{room.cartTotal||0}}</text></view></view>
			<view class="room-finish-compact" v-if="isOwner" @tap="finishRoom">结束</view>
			<view class="room-submit-fixed" :class="{disabled:!room.items.length}" @tap="submitGroupOrder">提交订单</view>
		</view>

		<view class="modal-mask" v-if="qrVisible || settlementVisible || cartVisible" @tap="closeModal"></view>
		<view class="qr-modal" v-if="qrVisible">
			<text class="modal-title">扫码加入聚餐</text>
			<text class="modal-desc">好友打开多人聚餐，点击“扫码加入”扫描此码</text>
			<image class="qr-image" :src="qrImage" mode="aspectFit" @tap="previewQr"></image>
			<text class="qr-code">房间码 {{ room.roomCode }}</text>
			<view class="modal-button" @tap="copyRoomCode">复制房间码</view>
		</view>
		<view class="settlement-modal" v-if="settlementVisible">
			<text class="modal-title">AA费用结算</text>
			<view class="settlement-total"><text>本次聚餐总额</text><text class="settlement-value">￥{{ room ? room.total || 0 : 0 }}</text></view>
			<view class="settlement-total mint-box"><text>{{ room ? room.members.length : 0 }}人平均分摊</text><text class="settlement-value">￥{{ room ? room.aa || 0 : 0 }}/人</text></view>
			<text class="modal-desc">当前为费用核算结果，微信实际收款需开通商户分账能力。</text>
			<view class="modal-button" @tap="closeModal">知道了</view>
		</view>
		<view class="cart-sheet" v-if="cartVisible&&room">
			<view class="cart-sheet-head"><view><text>共同购物车</text><text>{{room.items.length}}种菜，共￥{{room.cartTotal||0}}</text></view><text @tap="closeModal">×</text></view>
			<scroll-view class="cart-sheet-list" scroll-y><view class="cart-sheet-row" v-for="item in room.items" :key="item.dishId"><image :src="item.cover||'/static/onion_chicken.png'" mode="aspectFill"/><view><text>{{item.dishName}}</text><text>{{item.addedBy}} 添加 · {{item.quantity}}份</text></view><text>￥{{item.subtotal}}</text></view><view class="rooms-empty" v-if="!room.items.length">购物车还是空的</view></scroll-view>
			<view class="cart-sheet-submit" :class="{disabled:!room.items.length}" @tap="submitGroupOrder">提交聚餐订单</view>
		</view>
	</view>
</template>

<script>
	import { apiGroupCreate, apiGroupJoin, apiGroupDetail, apiGroupAddItem, apiMyGroupRooms, apiGroupQrCode, apiGroupFinish } from '@/api/social.js'
	import { apiDishList } from '@/api/dish.js'
	import { apiCategoryTree } from '@/api/category.js'
	import { ensureLogin } from '@/utils/login.js'
	import { getUserInfo } from '@/utils/auth.js'

	export default {
		props: {
			embedded: { type: Boolean, default: false }
		},
		data() {
			return {
				title: '周末聚餐',
				joinCode: '',
				room: null,
				myRooms: [],
				dishes: [],
				categories: [],
				activeCategoryId: '',
				creating: false,
				qrVisible: false,
				qrImage: '',
				settlementVisible: false,
				cartVisible: false
			}
		},
		computed: {
			filteredDishes() {
				if (this.activeCategoryId === '') return this.dishes
				return this.dishes.filter(dish => String(dish.categoryId) === String(this.activeCategoryId))
			},
			isOwner() {
				const user = getUserInfo() || {}
				return !!this.room && String(this.room.ownerUserId) === String(user.id || user.userId)
			}
		},
		mounted() {
			if (this.embedded) this.initialize()
		},
		onLoad(options = {}) {
			this.initialize(options)
		},
		onShow() {
			if (!this.room) this.loadRooms()
		},
		onShareAppMessage() {
			return this.getSharePayload()
		},
		methods: {
			initialize(options = {}) {
			this.loadDishes()
			this.loadCategories()
			this.loadRooms()
			if (options.code) {
				this.joinCode = String(options.code).toUpperCase()
				this.join()
			}
			},
			getSharePayload() {
			const target = this.room || this.myRooms[0]
			return {
				title: target ? `${target.title}，来一起点菜` : '来小兔子厨房一起聚餐',
				path: target ? `/pages/group-dining/group-dining?code=${target.roomCode}` : '/pages/group-dining/group-dining'
			}
		},
			async loadCategories() {
				try {
					const res = await apiCategoryTree()
					const flatten = rows => (rows || []).reduce((all, item) => all.concat(item, flatten(item.children)), [])
					this.categories = flatten((res && res.data) || [])
				} catch (e) {}
			},
			async loadRooms() {
				try {
					await ensureLogin()
					const res = await apiMyGroupRooms()
					this.myRooms = (res && res.data) || []
				} catch (e) {}
			},
			async loadDishes() {
				try {
					const res = await apiDishList({ pageNum: 1, pageSize: 30 })
					this.dishes = (res && res.rows) || []
				} catch (e) {}
			},
			async create() {
				if (this.creating) return
				try {
					this.creating = true
					await ensureLogin()
					const res = await apiGroupCreate({ title: this.title.trim() || '今天一起吃饭' })
					await this.open(res.data.id)
					await this.loadRooms()
				} catch (e) {} finally {
					this.creating = false
				}
			},
			async join() {
				const code = this.joinCode.trim().toUpperCase()
				if (!/^[A-Z0-9]{6}$/.test(code)) {
					uni.showToast({ title: '请输入正确的6位房间码', icon: 'none' })
					return
				}
				try {
					await ensureLogin()
					const res = await apiGroupJoin({ roomCode: code })
					await this.open(res.data.id)
					await this.loadRooms()
				} catch (e) {}
			},
			promptJoin() {
				uni.showModal({
					title: '加入聚餐房间',
					editable: true,
					placeholderText: '输入6位房间码',
					confirmText: '加入',
					success: res => {
						if (res.confirm) {
							this.joinCode = String(res.content || '').trim().toUpperCase()
							this.join()
						}
					}
				})
			},
			scanJoin() {
				uni.scanCode({
					scanType: ['qrCode'],
					success: result => {
						const match = String(result.result || '').match(/(?:code=)?([A-Z0-9]{6})$/i)
						if (!match) {
							uni.showToast({ title: '没有识别到聚餐房间码', icon: 'none' })
							return
						}
						this.joinCode = match[1].toUpperCase()
						this.join()
					}
				})
			},
			async open(id) {
				const res = await apiGroupDetail(id)
				this.room = res.data
			},
			async refresh() {
				if (this.room) await this.open(this.room.id)
			},
			async add(dish) {
				try {
					await apiGroupAddItem({ roomId: this.room.id, dishId: dish.id, quantity: 1 })
					await this.refresh()
					uni.showToast({ title: '已加入共同菜单', icon: 'none' })
				} catch (e) {}
			},
			async randomDish() {
				if (!this.filteredDishes.length) return
				const dish = this.filteredDishes[Math.floor(Math.random() * this.filteredDishes.length)]
				await this.add(dish)
			},
			submitGroupOrder() {
				if (!this.room || !this.room.items.length) {
					uni.showToast({ title: '请先选择菜品', icon: 'none' })
					return
				}
				const items = encodeURIComponent(JSON.stringify(this.room.items.map(item => ({ dishId: item.dishId, quantity: item.quantity }))))
				uni.navigateTo({ url: `/pages/submit-order/submit-order?groupRoomId=${this.room.id}&items=${items}` })
			},
			finishRoom() {
				if (!this.room || !this.isOwner) return
				uni.showModal({
					title: '结束聚餐',
					content: '结束后成员不能继续点菜或下单，历史订单仍会保留。',
					confirmText: '确认结束',
					success: async res => {
						if (!res.confirm) return
						try {
							await apiGroupFinish(this.room.id)
							this.room = null
							await this.loadRooms()
							uni.showToast({ title: '聚餐已结束', icon: 'success' })
						} catch (e) {}
					}
				})
			},
			async showQrCode() {
				try {
					const res = await apiGroupQrCode(this.room.id)
					this.qrImage = res.data.image
					this.qrVisible = true
				} catch (e) {}
			},
			previewQr() {
				if (this.qrImage) uni.previewImage({ urls: [this.qrImage] })
			},
			copyRoomCode() {
				if (!this.room) return
				uni.setClipboardData({ data: this.room.roomCode })
			},
			openLatestRoom() {
				if (this.myRooms.length) this.open(this.myRooms[0].id)
				else uni.showToast({ title: '请先创建或加入聚餐房间', icon: 'none' })
			},
			async openLatestSettlement() {
				if (!this.myRooms.length) {
					uni.showToast({ title: '还没有进行中的聚餐', icon: 'none' })
					return
				}
				await this.open(this.myRooms[0].id)
				this.showSettlement()
			},
			showSettlement() {
				this.settlementVisible = true
			},
			closeModal() {
				this.qrVisible = false
				this.settlementVisible = false
				this.cartVisible = false
			},
			handleBack() {
				if (this.room) {
					this.room = null
					this.loadRooms()
				} else {
					uni.navigateBack()
				}
			}
		}
	}
</script>

<style scoped>
	.page { min-height: 100vh; background: #f4faf7; color: #1f2926; }
	.page.embedded { min-height: calc(100vh - 122rpx - env(safe-area-inset-bottom)); }
	.page.embedded .page-scroll { height: calc(100vh - 352rpx - env(safe-area-inset-bottom)); }
	.page.embedded .room-cart-bar { bottom: calc(138rpx + env(safe-area-inset-bottom)); z-index: 90; }
	.header { height: 230rpx; padding: calc(46rpx + env(safe-area-inset-top)) 32rpx 30rpx; display: flex; align-items: flex-end; background: radial-gradient(circle at 88% 18%, rgba(255,255,255,.28) 0 82rpx, transparent 84rpx), linear-gradient(145deg, #28cfa3, #7be2c2); box-sizing: border-box; color: #fff; }
	.header-back { width: 62rpx; height: 62rpx; margin-right: 20rpx; border-radius: 50%; background: rgba(255,255,255,.94); color: #268c72; font-size: 52rpx; line-height: 55rpx; text-align: center; }
	.header-copy { flex: 1; display: flex; flex-direction: column; }
	.header-title { font-size: 45rpx; line-height: 1; font-weight: 900; letter-spacing: -1rpx; }
	.header-subtitle { margin-top: 14rpx; font-size: 25rpx; color: rgba(255,255,255,.88); }
	.header-search { width: 62rpx; height: 62rpx; font-size: 52rpx; line-height: 54rpx; transform: rotate(-18deg); }
	.page-scroll { height: calc(100vh - 230rpx); }
	.create-card { position: relative; min-height: 350rpx; margin: 26rpx 24rpx 8rpx; padding: 38rpx 270rpx 32rpx 32rpx; overflow: hidden; border-radius: 32rpx; background: linear-gradient(145deg, #fffef9, #edfff8); box-shadow: 0 16rpx 38rpx rgba(31,115,91,.10); box-sizing: border-box; }
	.create-copy { position: relative; z-index: 2; }
	.create-title { display: block; font-size: 38rpx; font-weight: 900; }
	.create-desc { display: block; width: 360rpx; margin-top: 15rpx; color: #71817b; font-size: 23rpx; line-height: 1.5; }
	.room-name-input { width: 360rpx; height: 66rpx; margin-top: 20rpx; padding: 0 20rpx; border-radius: 14rpx; background: #f2f7f5; font-size: 25rpx; box-sizing: border-box; }
	.create-button { width: 300rpx; height: 68rpx; margin-top: 16rpx; display: flex; align-items: center; justify-content: center; border-radius: 36rpx; background: #30cda3; color: #fff; font-size: 28rpx; font-weight: 900; box-shadow: 0 10rpx 22rpx rgba(48,205,163,.24); }
	.create-button.disabled { opacity: .55; }
	.food-orb { position: absolute; right: 24rpx; top: 64rpx; width: 220rpx; height: 220rpx; border-radius: 50%; background: #d9f8ee; box-shadow: inset 0 0 0 16rpx rgba(255,255,255,.45); }
	.food-orb image { width: 190rpx; height: 190rpx; margin: 15rpx; border-radius: 50%; }
	.food-orb text { position: absolute; right: 4rpx; top: -12rpx; width: 58rpx; height: 58rpx; border-radius: 20rpx; background: #30cda3; color: #fff; line-height: 58rpx; text-align: center; font-weight: 900; }
	.section-heading, .card-title-row { padding: 30rpx 30rpx 18rpx; display: flex; align-items: center; justify-content: space-between; }
	.section-heading text:first-child, .card-title-row text:first-child { font-size: 31rpx; font-weight: 900; }
	.section-heading text:last-child, .card-title-row text:last-child { color: #36bd99; font-size: 23rpx; }
	.room-scroll { width: 750rpx; white-space: nowrap; }
	.room-list { padding: 0 24rpx; display: inline-flex; gap: 18rpx; }
	.ongoing-card { width: 270rpx; overflow: hidden; border-radius: 22rpx; background: #fff; box-shadow: 0 10rpx 26rpx rgba(42,89,76,.08); }
	.ongoing-card image { width: 270rpx; height: 160rpx; background: #dff6ef; }
	.ongoing-copy { padding: 18rpx; display: flex; flex-direction: column; }
	.ongoing-title { font-size: 27rpx !important; color: #202a27 !important; font-weight: 900; overflow: hidden; text-overflow: ellipsis; }
	.ongoing-copy text:last-child { margin-top: 8rpx; font-size: 21rpx; color: #8d9995; }
	.rooms-empty { margin: 0 24rpx; padding: 45rpx 20rpx; border-radius: 22rpx; background: #fff; display: flex; flex-direction: column; align-items: center; color: #8c9994; font-size: 24rpx; }
	.rooms-empty text:last-child { margin-top: 10rpx; font-size: 21rpx; color: #a8b1ae; }
	.join-card { height: 80rpx; margin: 22rpx 24rpx; padding: 0 12rpx 0 24rpx; border-radius: 18rpx; display: flex; align-items: center; background: #fff; box-sizing: border-box; }
	.join-card input { flex: 1; }
	.join-card view { height: 58rpx; padding: 0 22rpx; display: flex; align-items: center; border-radius: 30rpx; background: #e8faf4; color: #24b88f; font-size: 24rpx; font-weight: 900; }
	.quick-actions { margin: 0 24rpx; padding: 24rpx 12rpx; display: grid; grid-template-columns: repeat(4, 1fr); border-radius: 26rpx; background: #fff; box-shadow: 0 10rpx 28rpx rgba(42,89,76,.06); }
	.quick-actions > view, .action-button { margin: 0; padding: 0; border: 0; background: transparent; display: flex; flex-direction: column; align-items: center; color: #2d3935; font-size: 22rpx; line-height: 1; }
	.action-button::after { border: 0; }
	.action-icon { width: 62rpx; height: 62rpx; margin-bottom: 12rpx; display: flex; align-items: center; justify-content: center; border-radius: 20rpx; background: #e8faf4; color: #25bd94; font-size: 25rpx; font-weight: 900; }
	.room-page { padding-top: 2rpx; box-sizing: border-box; }
	.active-room-card { margin: 24rpx; padding: 28rpx; border-radius: 28rpx; background: linear-gradient(145deg, #173a31, #28614f); color: #fff; box-shadow: 0 14rpx 34rpx rgba(22,58,48,.17); }
	.active-room-head { display: flex; justify-content: space-between; }
	.active-room-title { display: block; font-size: 35rpx; font-weight: 900; }
	.active-room-code { display: block; margin-top: 10rpx; color: #b9d7ce; font-size: 22rpx; }
	.room-live { height: 48rpx; padding: 0 16rpx; display: flex; align-items: center; border-radius: 25rpx; background: #35cda4; font-size: 21rpx; font-weight: 900; }
	.room-action-row { margin-top: 28rpx; display: grid; grid-template-columns: repeat(4, 1fr); }
	.room-action-row > view, .room-action-row button { margin: 0; padding: 0; border: 0; background: transparent; color: #fff; display: flex; flex-direction: column; align-items: center; line-height: 1; }
	.room-action-row button::after { border: 0; }
	.room-action-row > view > text:first-child, .room-action-row button > text:first-child { width: 58rpx; height: 58rpx; border-radius: 20rpx; background: rgba(255,255,255,.14); display: flex; align-items: center; justify-content: center; font-weight: 900; }
	.room-action-row .action-label { margin-top: 10rpx; color: #d6e8e2; font-size: 19rpx; }
	.members-card, .bill-card, .ordered-list { margin: 0 24rpx 18rpx; border-radius: 24rpx; background: #fff; }
	.member-scroll { white-space: nowrap; padding-bottom: 22rpx; }
	.member-list { padding: 0 20rpx; display: inline-flex; }
	.member { width: 104rpx; display: inline-flex; flex-direction: column; align-items: center; }
	.member image { width: 68rpx; height: 68rpx; border-radius: 50%; background: #eef6f3; }
	.member text { width: 96rpx; margin-top: 8rpx; text-align: center; overflow: hidden; text-overflow: ellipsis; font-size: 20rpx; }
	.bill-card { padding: 26rpx 20rpx; display: grid; grid-template-columns: 1fr 1rpx 1fr; }
	.bill-card > view:not(.bill-divider) { display: flex; flex-direction: column; align-items: center; }
	.bill-card text { color: #82908b; font-size: 22rpx; }
	.bill-card .bill-value { margin-top: 9rpx; color: #172e28; font-size: 36rpx; font-weight: 800; }
	.bill-divider { background: #edf1ef; }
	.mint { color: #27bd93; }
	.section-title-row { padding-top: 22rpx; }
	.ordered-list { padding: 0 20rpx; }
	.ordered-item { min-height: 118rpx; display: flex; align-items: center; border-bottom: 1rpx solid #edf2f0; }
	.ordered-item:last-child { border-bottom: 0; }
	.ordered-item image { width: 82rpx; height: 82rpx; border-radius: 13rpx; }
	.ordered-main { flex: 1; margin-left: 16rpx; display: flex; flex-direction: column; }
	.ordered-main text:first-child { font-size: 27rpx; font-weight: 900; }
	.ordered-main text:last-child { margin-top: 8rpx; color: #8d9995; font-size: 20rpx; }
	.ordered-price { font-weight: 900; }
	.ordered-empty { margin-bottom: 18rpx; }
	.dish-grid { padding: 0 24rpx; display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; }
	.dish-card { padding: 13rpx; border-radius: 20rpx; background: #fff; }
	.dish-card image { width: 100%; height: 190rpx; border-radius: 14rpx; background: #edf5f2; }
	.dish-name { display: block; margin: 12rpx 4rpx; font-size: 25rpx; font-weight: 900; }
	.dish-card > view { display: flex; align-items: center; justify-content: space-between; color: #28ba92; font-size: 23rpx; }
	.dish-add { width: 45rpx; height: 45rpx; border-radius: 50%; background: #35cda4; color: #fff; text-align: center; line-height: 43rpx; font-size: 34rpx; }
	.bottom-space { height: 190rpx; }
	.modal-mask { position: fixed; inset: 0; z-index: 210; background: rgba(17,35,30,.56); }
	.qr-modal, .settlement-modal { position: fixed; left: 60rpx; right: 60rpx; top: 50%; z-index: 220; padding: 34rpx; border-radius: 30rpx; background: #fff; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }
	.modal-title { font-size: 34rpx; font-weight: 900; }
	.modal-desc { margin-top: 12rpx; color: #81908a; font-size: 22rpx; line-height: 1.5; text-align: center; }
	.qr-image { width: 420rpx; height: 420rpx; margin-top: 24rpx; }
	.qr-code { margin-top: 10rpx; font-size: 25rpx; font-weight: 900; letter-spacing: 2rpx; }
	.modal-button { width: 100%; height: 72rpx; margin-top: 24rpx; display: flex; align-items: center; justify-content: center; border-radius: 37rpx; background: #35cda4; color: #fff; font-weight: 900; }
	.settlement-total { width: 100%; margin-top: 25rpx; padding: 24rpx; display: flex; align-items: center; justify-content: space-between; border-radius: 18rpx; background: #f4f7f6; box-sizing: border-box; }
	.settlement-total .settlement-value { color: #172e28; font-size: 31rpx; font-weight: 800; }
	.category-scroll { width: 750rpx; margin-bottom: 18rpx; white-space: nowrap; }
	.category-list { padding: 0 24rpx; display: inline-flex; gap: 14rpx; }
	.category-chip { height: 58rpx; padding: 0 26rpx; display: flex; align-items: center; border-radius: 30rpx; background: #eaf2ef; color: #64726d; font-size: 24rpx; font-weight: 800; }
	.category-chip.active { background: #30cda3; color: #f8fffc; }
	.room-order-actions { margin: 28rpx 24rpx 0; display: flex; gap: 16rpx; }
	.finish-button, .order-button { height: 82rpx; display: flex; align-items: center; justify-content: center; border-radius: 42rpx; font-size: 27rpx; font-weight: 900; }
	.finish-button { width: 210rpx; border: 2rpx solid #cbd7d3; color: #63716c; }
	.order-button { flex: 1; background: #30cda3; color: #f8fffc; }
	.order-button.disabled { opacity: .45; }
	.mint-box { background: #eafaf5; color: #20b98f; }
	.room-cart-bar{position:fixed;z-index:15;left:22rpx;right:22rpx;bottom:calc(20rpx + env(safe-area-inset-bottom));height:100rpx;padding:10rpx 12rpx 10rpx 18rpx;display:flex;align-items:center;gap:12rpx;border:1rpx solid #dcebe6;border-radius:52rpx;background:#fbfefd;box-shadow:0 12rpx 34rpx rgba(37,76,64,.15);box-sizing:border-box}.room-cart-summary{flex:1;min-width:0;display:flex;align-items:center}.room-cart-icon{position:relative;width:60rpx;height:60rpx;flex-shrink:0}.room-cart-icon image{width:60rpx;height:60rpx}.room-cart-icon>text{position:absolute;right:-5rpx;top:-7rpx;min-width:29rpx;height:29rpx;padding:0 5rpx;border-radius:15rpx;background:#f05f6c;color:#fff;text-align:center;line-height:29rpx;font-size:18rpx;font-weight:900;box-sizing:border-box}.room-cart-summary>view:last-child{margin-left:13rpx;display:flex;flex-direction:column}.room-cart-summary>view:last-child text:first-child{font-size:25rpx;font-weight:900}.room-cart-summary>view:last-child text:last-child{margin-top:5rpx;color:#72817c;font-size:19rpx}.room-finish-compact{height:66rpx;padding:0 18rpx;display:flex;align-items:center;border:1rpx solid #cbd8d4;border-radius:34rpx;color:#687771;font-size:22rpx;font-weight:800}.room-submit-fixed{height:72rpx;padding:0 28rpx;display:flex;align-items:center;border-radius:37rpx;background:#30cda3;color:#f8fffc;font-size:25rpx;font-weight:900}.room-submit-fixed.disabled,.cart-sheet-submit.disabled{opacity:.45}.cart-sheet{position:fixed;z-index:220;left:0;right:0;bottom:0;height:70vh;max-height:980rpx;padding:28rpx 24rpx calc(26rpx + env(safe-area-inset-bottom));border-radius:30rpx 30rpx 0 0;background:#fbfefd;display:flex;flex-direction:column;box-sizing:border-box}.cart-sheet-head{display:flex;align-items:center;justify-content:space-between;flex-shrink:0}.cart-sheet-head>view{display:flex;flex-direction:column}.cart-sheet-head>view text:first-child{font-size:34rpx;font-weight:900}.cart-sheet-head>view text:last-child{margin-top:7rpx;color:#7b8a85;font-size:21rpx}.cart-sheet-head>text{font-size:48rpx;color:#73817c}.cart-sheet-list{height:0;min-height:0;flex:1;margin-top:20rpx}.cart-sheet-row{min-height:108rpx;padding:12rpx 0;display:flex;align-items:center;border-bottom:1rpx solid #e8efec;box-sizing:border-box}.cart-sheet-row image{width:82rpx;height:82rpx;border-radius:13rpx;flex-shrink:0}.cart-sheet-row>view{flex:1;min-width:0;margin-left:15rpx;display:flex;flex-direction:column}.cart-sheet-row>view text:first-child{font-size:26rpx;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cart-sheet-row>view text:last-child{margin-top:7rpx;color:#83918c;font-size:20rpx}.cart-sheet-row>text:last-child{margin-left:12rpx;font-weight:900;flex-shrink:0}.cart-sheet-submit{height:82rpx;margin-top:22rpx;display:flex;align-items:center;justify-content:center;border-radius:42rpx;background:#30cda3;color:#f8fffc;font-size:28rpx;font-weight:900;flex-shrink:0}
</style>
