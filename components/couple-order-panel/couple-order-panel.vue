<template>
	<view class="order-panel" :class="{ remote }">
		<view class="shared-cart" v-if="!remote">
			<view class="shared-head">
				<view><text>双方已点</text><text>{{ totalCount }}份 · ￥{{ totalAmount }}</text></view>
				<text>实时同步</text>
			</view>
			<scroll-view class="shared-scroll" scroll-x show-scrollbar="false" v-if="displaySharedItems.length">
				<view class="shared-list">
					<view class="shared-item" v-for="item in displaySharedItems" :key="item.userId+'-'+item.dishId">
						<image :src="item.cover||'/static/onion_chicken.png'" mode="aspectFill"/>
						<view><text>{{item.dishName}}</text><text>{{isMine(item)?'我':item.addedBy}} 点了 {{item.quantity}}份</text></view>
					</view>
				</view>
			</scroll-view>
			<view class="shared-empty" v-else>还没有人选菜，你先来点第一道吧</view>
		</view>

		<view class="feed-tip" v-else><text class="feed-tip-icon">投</text><view><text>给 TA 选一份今天的惊喜</text><text>完成下单后，对方会收到投喂通知</text></view></view>

		<scroll-view class="category-bar" scroll-x show-scrollbar="false">
			<view class="category-list">
				<view class="chip" :class="{active:activeCategoryId===''}" @tap="activeCategoryId=''">全部</view>
				<view class="chip" :class="{active:String(activeCategoryId)===String(cat.id)}" v-for="cat in categories" :key="cat.id" @tap="activeCategoryId=cat.id">{{cat.catName}}</view>
			</view>
		</scroll-view>

		<scroll-view class="dish-scroll" scroll-y>
			<view class="panel-loading" v-if="loading&&!dishes.length">正在加载菜单...</view>
			<view class="dish-list" v-else-if="filteredDishes.length">
				<view class="dish" v-for="dish in filteredDishes" :key="dish.id">
					<image :src="dish.cover||'/static/onion_chicken.png'" mode="aspectFill"/>
					<view class="dish-copy">
						<text class="dish-name">{{dish.dishName}}</text>
						<text class="dish-desc">{{dish.story||'家常好味，适合一起分享'}}</text>
						<text class="price">￥{{dish.virtualPrice||0}}</text>
						<text class="picked-by" v-if="!remote&&otherQuantity(dish.id)">TA 已选 {{otherQuantity(dish.id)}}份</text>
					</view>
					<view class="qty" :class="{disabled:loading}">
						<text v-if="quantity(dish.id)" @tap="change(dish.id,-1)">−</text>
						<text v-if="quantity(dish.id)" class="number">{{quantity(dish.id)}}</text>
						<text @tap="change(dish.id,1)">＋</text>
					</view>
				</view>
			</view>
			<view class="empty" v-else>该分类暂时没有菜品</view>
		</scroll-view>

		<view class="bottom">
			<view><text>{{remote?'我准备投喂':'双方合计'}} {{totalCount}} 份</text><text class="total">￥{{totalAmount}}</text></view>
			<view class="confirm" :class="{disabled:!totalCount||confirming}" @tap="confirm">{{confirming?'处理中...':(remote?'去填写投喂订单':'确认共同订单')}}</view>
		</view>
	</view>
</template>

<script>
	import { apiCategoryTree } from '@/api/category.js'
	import { apiDishList } from '@/api/dish.js'
	import { apiCoupleDetail, apiCoupleSetItem } from '@/api/social.js'
	import { ensureLogin } from '@/utils/login.js'

	export default {
		name: 'CoupleOrderPanel',
		props: {
			remote: { type: Boolean, default: false }
		},
		data() {
			return {
				categories: [],
				dishes: [],
				activeCategoryId: '',
				quantities: {},
				sharedItems: [],
				currentUserId: null,
				loading: false,
				confirming: false
			}
		},
		computed: {
			filteredDishes() {
				if (this.activeCategoryId === '') return this.dishes
				return this.dishes.filter(dish => String(dish.categoryId) === String(this.activeCategoryId))
			},
			displaySharedItems() {
				if (this.remote) return this.localItems('我')
				const others = this.sharedItems.filter(item => String(item.userId) !== String(this.currentUserId))
				return others.concat(this.localItems('我'))
			},
			combinedItems() {
				const map = {}
				this.displaySharedItems.forEach(item => {
					const key = String(item.dishId)
					if (!map[key]) map[key] = { dishId: item.dishId, quantity: 0 }
					map[key].quantity += Number(item.quantity || 0)
				})
				return Object.values(map)
			},
			totalCount() {
				return this.combinedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
			},
			totalAmount() {
				const value = this.combinedItems.reduce((sum, item) => {
					const dish = this.dishes.find(row => String(row.id) === String(item.dishId))
					return sum + Number(dish && dish.virtualPrice || 0) * item.quantity
				}, 0)
				return value.toFixed(2)
			}
		},
		mounted() {
			this._syncQueues = {}
			this.load()
		},
		methods: {
			resume() {
				this.confirming = false
				this.loadShared()
			},
			async load() {
				if (this.loading) return
				this.loading = true
				try {
					await ensureLogin()
					const [catRes, dishRes, spaceRes] = await Promise.all([
						apiCategoryTree(),
						apiDishList({ pageNum: 1, pageSize: 100 }),
						apiCoupleDetail()
					])
					const flatten = rows => (rows || []).reduce((all, item) => all.concat(item, flatten(item.children)), [])
					this.categories = flatten((catRes && catRes.data) || [])
					this.dishes = (dishRes && dishRes.rows) || []
					const space = spaceRes && spaceRes.data
					if (!space) throw new Error('请先绑定情侣空间')
					this.currentUserId = space.currentUserId
					this.sharedItems = space.items || []
					if (!this.remote) this.syncMyQuantities()
				} catch (e) {
					uni.showToast({ title: e.message || '共同菜单加载失败', icon: 'none' })
				} finally {
					this.loading = false
				}
			},
			async loadShared() {
				try {
					const res = await apiCoupleDetail()
					const space = res && res.data
					this.currentUserId = space && space.currentUserId
					this.sharedItems = space && space.items || []
					if (!this.remote) this.syncMyQuantities()
				} catch (e) {}
			},
			syncMyQuantities() {
				const next = {}
				this.sharedItems.filter(item => String(item.userId) === String(this.currentUserId)).forEach(item => {
					next[String(item.dishId)] = Number(item.quantity || 0)
				})
				this.quantities = next
			},
			localItems(name) {
				return this.dishes.filter(dish => this.quantity(dish.id) > 0).map(dish => ({
					dishId: dish.id,
					dishName: dish.dishName,
					cover: dish.cover,
					userId: this.currentUserId,
					quantity: this.quantity(dish.id),
					price: dish.virtualPrice || 0,
					addedBy: name
				}))
			},
			quantity(id) {
				return Number(this.quantities[String(id)] || 0)
			},
			otherQuantity(id) {
				return this.sharedItems.filter(item => String(item.userId) !== String(this.currentUserId) && String(item.dishId) === String(id)).reduce((sum, item) => sum + Number(item.quantity || 0), 0)
			},
			isMine(item) {
				return String(item.userId) === String(this.currentUserId)
			},
			change(id, delta) {
				if (this.loading) return
				const key = String(id)
				const next = Math.max(0, Math.min(99, this.quantity(id) + delta))
				if (this.$set) this.$set(this.quantities, key, next)
				else this.quantities[key] = next
				if (!this.remote) this.queueSync(id, next)
			},
			queueSync(dishId, quantity) {
				const key = String(dishId)
				const previous = this._syncQueues[key] || Promise.resolve()
				const task = previous.catch(() => {}).then(() => apiCoupleSetItem({ dishId, quantity })).then(res => {
					this.sharedItems = res && res.data || this.sharedItems
				}).catch(async e => {
					uni.showToast({ title: e.message || '共同菜单同步失败', icon: 'none' })
					await this.loadShared()
				})
				this._syncQueues[key] = task
			},
			async confirm() {
				if (this.confirming) return
				if (!this.totalCount) {
					uni.showToast({ title: '请先选择菜品', icon: 'none' })
					return
				}
				this.confirming = true
				try {
					if (!this.remote) {
						await Promise.all(Object.values(this._syncQueues || {}))
						await this.loadShared()
					}
					const source = this.remote ? this.localItems('我').map(item => ({ dishId: item.dishId, quantity: item.quantity })) : this.combinedItems
					if (!source.length) {
						uni.showToast({ title: '共同菜单已更新，请重新选择', icon: 'none' })
						this.confirming = false
						return
					}
					const encoded = encodeURIComponent(JSON.stringify(source))
					uni.navigateTo({
						url: `/pages/submit-order/submit-order?coupleOrder=1&remote=${this.remote ? '1' : '0'}&items=${encoded}`,
						fail: () => { this.confirming = false }
					})
				} catch (e) {
					this.confirming = false
				}
			}
		}
	}
</script>

<style>
	.order-panel{height:100%;min-height:0;position:relative;display:flex;flex-direction:column;background:#f4faf7;color:#1f2926;overflow:hidden}.shared-cart{flex:none;padding:18rpx 0 16rpx;background:#e8faf4}.shared-head{padding:0 24rpx 13rpx;display:flex;align-items:center;justify-content:space-between}.shared-head>view{display:flex;align-items:baseline;gap:14rpx}.shared-head>view text:first-child{font-size:28rpx;font-weight:900}.shared-head>view text:last-child{color:#5f7770;font-size:21rpx}.shared-head>text{padding:7rpx 14rpx;border-radius:22rpx;background:#d7f5eb;color:#20a982;font-size:20rpx;font-weight:800}.shared-scroll{white-space:nowrap}.shared-list{padding:0 24rpx;display:inline-flex;gap:12rpx}.shared-item{min-width:250rpx;padding:12rpx;display:flex;align-items:center;border:1rpx solid #cdebe1;border-radius:18rpx;background:#f8fffc;box-sizing:border-box}.shared-item image{width:66rpx;height:66rpx;border-radius:12rpx}.shared-item>view{margin-left:12rpx;display:flex;flex-direction:column}.shared-item>view text:first-child{font-size:23rpx;font-weight:900}.shared-item>view text:last-child{margin-top:7rpx;color:#6f817b;font-size:19rpx}.shared-empty{padding:12rpx 24rpx;color:#71857e;font-size:22rpx}.feed-tip{flex:none;margin:16rpx 24rpx 8rpx;padding:17rpx 20rpx;display:flex;align-items:center;border-radius:20rpx;background:#fff0f3;color:#31282a}.feed-tip-icon{width:54rpx;height:54rpx;display:flex;align-items:center;justify-content:center;border-radius:18rpx;background:#e9788f;color:#fbfffd;font-weight:900}.feed-tip>view{margin-left:14rpx;display:flex;flex-direction:column}.feed-tip>view text:first-child{font-size:24rpx;font-weight:900}.feed-tip>view text:last-child{margin-top:5rpx;color:#967f84;font-size:19rpx}.category-bar{flex:none;height:94rpx;background:#f8fffc;white-space:nowrap}.category-list{height:94rpx;padding:0 24rpx;display:inline-flex;align-items:center;gap:14rpx}.chip{height:56rpx;padding:0 25rpx;display:flex;align-items:center;border-radius:30rpx;background:#eaf2ef;color:#61706b;font-size:24rpx;font-weight:800}.chip.active{background:#30cda3;color:#f8fffc}.dish-scroll{flex:1;min-height:0;height:0}.dish-list{padding:16rpx 24rpx}.dish{min-height:150rpx;margin-bottom:14rpx;padding:15rpx;display:flex;align-items:center;border-radius:22rpx;background:#fbfefd;box-sizing:border-box}.dish image{width:122rpx;height:122rpx;border-radius:17rpx}.dish-copy{flex:1;min-width:0;margin-left:17rpx;display:flex;flex-direction:column}.dish-name{font-size:28rpx;font-weight:900}.dish-desc{margin-top:7rpx;color:#8a9792;font-size:20rpx;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.price{margin-top:9rpx;color:#24b98f;font-size:26rpx;font-weight:900}.picked-by{margin-top:5rpx;color:#d16d7f;font-size:19rpx}.qty{display:flex;align-items:center;gap:9rpx}.qty.disabled{opacity:.5;pointer-events:none}.qty>text:not(.number){width:48rpx;height:48rpx;border-radius:50%;background:#30cda3;color:#f8fffc;text-align:center;line-height:46rpx;font-weight:900}.number{min-width:28rpx;text-align:center;font-weight:900}.panel-loading,.empty{padding:90rpx 20rpx;text-align:center;color:#8b9893}.bottom{flex:none;height:calc(108rpx + env(safe-area-inset-bottom));padding:0 24rpx env(safe-area-inset-bottom);display:flex;align-items:center;justify-content:space-between;background:#fbfefd;box-shadow:0 -8rpx 24rpx rgba(45,87,74,.08);box-sizing:border-box}.bottom>view:first-child{display:flex;flex-direction:column;color:#71807a;font-size:22rpx}.total{margin-top:5rpx;color:#1f2926;font-size:30rpx;font-weight:900}.confirm{min-width:280rpx;height:72rpx;padding:0 24rpx;border-radius:38rpx;background:#30cda3;color:#f8fffc;display:flex;align-items:center;justify-content:center;font-size:25rpx;font-weight:900;box-sizing:border-box}.confirm.disabled{opacity:.45}
</style>
