<template>
	<view class="submit-page">
		<view class="submit-header">
			<view class="status-bar"></view>
			<view class="submit-nav">
				<view class="nav-back" @tap="goBack">
					<image class="back-icon" src="/static/back_green.svg" mode="aspectFit"></image>
				</view>
				<text class="submit-title">提交订单</text>
				<view class="submit-capsule">
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

		<scroll-view class="submit-content" scroll-y>
			<view class="submit-card selected-card">
				<view class="selected-head"><text class="card-title">已选</text><text class="social-tag" v-if="groupRoomId">多人聚餐订单</text><text class="social-tag couple" v-else-if="coupleOrder">{{ remoteFeed ? '异地投喂' : '情侣共同订单' }}</text></view>
				<view class="selected-list">
					<view class="selected-row" v-for="dish in displaySelectedDishes" :key="dish.id">
						<image class="selected-img" :src="dish.image" mode="aspectFill"></image>
						<text class="selected-name">{{ dish.name }}</text>
						<text class="selected-count">x {{ dish.quantity }}</text>
					</view>
				</view>
			</view>

			<view class="submit-card service-card">
				<text class="card-title">用餐安排</text>
				<view class="region-status-row"><view><text class="region-status-title">当前区域服务</text><text class="region-status-desc">{{ regionOpened ? '同城配送与厨师代炒已开通' : '未开通，可申请区域代理' }}</text></view><text :class="regionOpened?'opened':'closed'">{{regionOpened?'已开通':'未开通'}}</text></view>
				<scroll-view class="opened-region-scroll" scroll-x show-scrollbar="false" v-if="openedRegions.length"><view class="opened-region-list"><text>已开通区域</text><text v-for="item in openedRegions" :key="item.id">{{item.province}}{{item.city}}{{item.district}}</text></view></scroll-view>
				<view class="service-row">
					<text class="service-label">用餐类型</text>
					<scroll-view class="service-options" scroll-x show-scrollbar="false">
						<view class="service-chip-list">
							<view
								class="service-chip"
								:class="{ active: selectedService === item.value, unavailable: item.regionRequired && !regionOpened }"
								v-for="item in serviceTypes"
								:key="item.value"
								@tap="selectService(item.value)"
							>
								<text class="service-dot">{{ item.icon }}</text>
								<text>{{ item.label }}</text>
								<text class="service-unavailable" v-if="item.regionRequired && !regionOpened">未开通</text>
							</view>
						</view>
					</scroll-view>
				</view>

				<view class="chef-section" v-if="selectedService === '同城配送' && deliveryStaff.length">
					<view class="chef-section-head">
						<text class="chef-section-title">配送员</text>
						<text class="chef-section-count">可不指定</text>
					</view>
					<view class="chef-list">
						<view class="chef-row" :class="{ active: selectedDeliveryId === '' }" @tap="selectDelivery('')">
							<view class="chef-info no-avatar">
								<text class="chef-name">商家安排</text>
								<text class="chef-desc">由平台或商家统一分配配送员</text>
							</view>
							<view class="chef-check">
								<text v-if="selectedDeliveryId === ''">✓</text>
							</view>
						</view>
						<view
							class="chef-row"
							:class="{ active: selectedDeliveryId === staff.id }"
							v-for="staff in deliveryStaff"
							:key="staff.id"
							@tap="selectDelivery(staff.id)"
						>
							<image class="chef-avatar" :src="staff.avatar" mode="aspectFill"></image>
							<view class="chef-info">
								<view class="chef-name-line">
									<text class="chef-name">{{ staff.name }}</text>
									<view class="chef-tag" v-if="staff.tag">
										<text>{{ staff.tag }}</text>
									</view>
								</view>
								<text class="chef-desc">{{ staff.desc || '配送服务' }}</text>
							</view>
							<view class="chef-side">
								<text class="chef-price">{{ staff.fee }}</text>
								<text class="chef-time">{{ staff.time }}</text>
							</view>
							<view class="chef-check">
								<text v-if="selectedDeliveryId === staff.id">✓</text>
							</view>
						</view>
					</view>
				</view>

				<view class="chef-section" v-if="selectedService === '厨师代炒'">
					<view class="chef-section-head">
						<text class="chef-section-title">选择厨师</text>
						<text class="chef-section-count">共 {{ chefList.length }} 位</text>
					</view>
					<view class="chef-list">
						<view
							class="chef-row"
							:class="{ active: selectedChefId === chef.id }"
							v-for="chef in chefList"
							:key="chef.id"
							@tap="selectChef(chef)"
						>
							<image class="chef-avatar" :src="chef.avatar" mode="aspectFill"></image>
							<view class="chef-info">
								<view class="chef-name-line">
									<text class="chef-name">{{ chef.name }}</text>
									<view class="chef-tag" v-if="chef.tag">
										<text>{{ chef.tag }}</text>
									</view>
								</view>
								<text class="chef-desc">{{ chef.desc || '厨师代炒服务' }}</text>
							</view>
							<view class="chef-side">
								<text class="chef-price">{{ chef.price }}</text>
								<text class="chef-time">{{ chef.time }}</text>
							</view>
							<view class="chef-check">
								<text v-if="selectedChefId === chef.id">✓</text>
							</view>
						</view>
					</view>
				</view>

				<view class="delivery-section" v-if="needDelivery">
					<text class="delivery-section-title">{{ selectedService === '厨师代炒' ? '送货地址' : '收货信息' }}</text>
					<view class="delivery-row">
						<text class="delivery-label">姓名</text>
						<input class="delivery-input" v-model="deliveryName" placeholder="收货人姓名" placeholder-class="delivery-placeholder" maxlength="20" />
					</view>
					<view class="delivery-row">
						<text class="delivery-label">手机号</text>
						<input class="delivery-input" v-model="deliveryPhone" type="number" placeholder="收货人手机号" placeholder-class="delivery-placeholder" maxlength="11" />
					</view>
					<view class="delivery-row">
						<text class="delivery-label">地址</text>
						<input class="delivery-input" v-model="deliveryAddress" placeholder="详细收货地址" placeholder-class="delivery-placeholder" maxlength="60" />
					</view>
				</view>

				<view class="pickup-section" v-if="selectedService === '附近的菜市场'">
					<view class="market-mode-tabs">
						<view :class="{active:marketMode==='nearby'}" @tap="marketMode='nearby'"><text>附近菜市场</text><small>查看地址</small></view>
						<view :class="{active:marketMode==='stockGroup'}" @tap="marketMode='stockGroup'"><text>商家提前备货群</text><small>扫码入群</small></view>
					</view>
					<view v-if="marketMode==='nearby'">
					<view class="pickup-head">
						<text class="pickup-title">附近的菜市场</text>
						<view class="pickup-copy" @tap="copyStoreAddress" v-if="storeInfo.address">
							<text>复制地址</text>
						</view>
					</view>
					<view class="pickup-box">
						<text class="pickup-store-name">{{ storeInfo.name || '我的厨房' }}</text>
						<text class="pickup-store-address">{{ storeInfo.address || '商家暂未配置门店地址' }}</text>
						<view class="pickup-meta">
							<text class="pickup-meta-item" v-if="storeInfo.hours">营业时间 {{ storeInfo.hours }}</text>
							<text class="pickup-meta-item" v-if="storeInfo.phone">电话 {{ storeInfo.phone }}</text>
						</view>
					</view>
					</view>
					<view class="stock-group-box" v-else>
						<image v-if="storeInfo.stockGroupQr" :src="storeInfo.stockGroupQr" mode="aspectFit" @tap="previewStockGroupQr"></image>
						<view class="stock-group-copy">
							<text class="stock-group-name">{{storeInfo.stockGroupName||'商家提前备货群'}}</text>
							<text class="stock-group-notice">{{storeInfo.stockGroupNotice||'商家暂未配置备货群，请联系客服。'}}</text>
							<text class="stock-group-action" v-if="storeInfo.stockGroupQr" @tap="previewStockGroupQr">查看大图，长按识别二维码</text>
						</view>
					</view>
				</view>
			</view>

			<view class="submit-card remark-card">
				<text class="card-title">备注信息</text>
				<textarea
					class="remark-input"
					v-model="remark"
					placeholder="有什么口味偏好或特殊要求吗?"
					placeholder-class="remark-placeholder"
					maxlength="120"
				/>
			</view>

			<view class="submit-card toggle-card">
				<view class="toggle-row">
					<view class="toggle-copy">
						<text class="toggle-title">分享到“餐桌妙想”</text>
						<text class="toggle-desc">公开后其他小伙伴也能看到你的美食搭配</text>
					</view>
					<switch :checked="shareEnabled" color="#35cda4" @change="shareEnabled = $event.detail.value" />
				</view>
				<view class="toggle-divider"></view>
				<view class="toggle-row">
					<view class="toggle-copy">
						<text class="toggle-title">加入厨房菜篮</text>
						<text class="toggle-desc">下单后保留已选菜品，方便继续采购</text>
					</view>
					<switch :checked="basketEnabled" color="#35cda4" @change="basketEnabled = $event.detail.value" />
				</view>
			</view>
		</scroll-view>

		<view class="region-mask" v-if="showRegionApply" @tap="showRegionApply=false"></view>
		<view class="region-sheet" v-if="showRegionApply">
			<view class="region-sheet-head"><text class="region-sheet-title">申请该区域代理</text><text class="region-close" @tap="showRegionApply=false">×</text></view>
			<text class="region-tip">当前区域尚未开通同城配送和厨师代炒，提交后由平台审核。</text>
			<input class="region-input" v-model="regionForm.applicantName" placeholder="申请人姓名" />
			<input class="region-input" v-model="regionForm.phone" type="number" maxlength="11" placeholder="联系电话" />
			<view class="region-line">
				<input class="region-input region-third" v-model="regionForm.province" placeholder="省" />
				<input class="region-input region-third" v-model="regionForm.city" placeholder="市" />
				<input class="region-input region-third" v-model="regionForm.district" placeholder="区/县" />
			</view>
			<input class="region-input" v-model="regionForm.address" placeholder="详细地址" />
			<textarea class="region-textarea" v-model="regionForm.experience" maxlength="300" placeholder="相关经验或申请说明"></textarea>
			<view class="region-submit" :class="{disabled:regionSubmitting}" @tap="submitRegionApplication">提交审核</view>
		</view>

		<view class="submit-bottom-bar">
			<text class="total-text">共 {{ totalDishCount }} 道</text>
			<view class="submit-btn" @tap="submitOrder">
				<text>提交订单</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { apiChefList } from '@/api/chef.js'
	import { apiRiderList } from '@/api/rider.js'
	import { apiSubmitOrder } from '@/api/order.js'
	import { apiShopInfo } from '@/api/shop.js'
	import { apiDishDetail } from '@/api/dish.js'
	import { ensureLogin } from '@/utils/login.js'
	import { apiRegionStatus, apiRegionApply, apiOpenedRegions } from '@/api/region.js'
	import config from '@/config/index.js'

	export default {
		data() {
			return {
				selectedCount: 1,
				selectedName: '菜品',
				selectedImage: '/static/onion_chicken.png',
				orderItems: [],
				selectedDishes: [],
				serviceTypes: [
					{ label: '附近的菜市场', value: '附近的菜市场', icon: '菜' },
					{ label: '同城配送', value: '同城配送', icon: '送', regionRequired: true },
					{ label: '厨师代炒', value: '厨师代炒', icon: '厨', regionRequired: true }
				],
				selectedService: '附近的菜市场',
				selectedChefId: '',
				chefList: [],
				selectedDeliveryId: '',
				deliveryStaff: [],
				deliveryName: '',
				deliveryPhone: '',
				deliveryAddress: '',
				storeInfo: {
					name: '',
					address: '',
					hours: '',
					phone: '',
					stockGroupQr: '',
					stockGroupName: '',
					stockGroupNotice: ''
				},
				marketMode: 'nearby',
				remark: '',
				shareEnabled: true,
				basketEnabled: false,
				regionOpened: false,
				openedRegions: [],
				groupRoomId: null,
				coupleOrder: false,
				remoteFeed: false,
				regionApplication: null,
				showRegionApply: false,
				regionSubmitting: false,
				regionForm: { applicantName:'', phone:'', province:'', city:'', district:'', address:'', experience:'' }
			}
		},
		computed: {
			needDelivery() {
				return this.selectedService === '同城配送' || this.selectedService === '厨师代炒';
			},
			serviceTypeCode() {
				return { '同城配送': '0', '厨师代炒': '1', '附近的菜市场': '2' }[this.selectedService] || '2';
			},
			displaySelectedDishes() {
				if (this.selectedDishes.length) return this.selectedDishes;
				return [{
					id: 'fallback',
					name: this.selectedName,
					image: this.selectedImage,
					quantity: this.selectedCount
				}];
			},
			totalDishCount() {
				return this.displaySelectedDishes.reduce((sum, dish) => sum + (Number(dish.quantity) || 1), 0);
			}
		},
		onLoad(options = {}) {
			this.groupRoomId = /^\d+$/.test(String(options.groupRoomId || '')) ? Number(options.groupRoomId) : null;
			this.coupleOrder = String(options.coupleOrder || '') === '1';
			this.remoteFeed = String(options.remote || '') === '1';
			const count = Number(options.count || 1);
			this.selectedCount = Number.isFinite(count) && count > 0 ? count : 1;
			this.selectedName = options.name ? decodeURIComponent(options.name) : '菜品';
			this.selectedImage = options.image ? decodeURIComponent(options.image) : '/static/onion_chicken.png';

			if (options.items) {
				try {
					const parsed = JSON.parse(decodeURIComponent(options.items));
					this.orderItems = Array.isArray(parsed)
						? parsed
							.filter(item => item && /^\d+$/.test(String(item.dishId)))
							.map(item => ({
								dishId: Number(item.dishId),
								quantity: Math.max(1, Math.min(Number(item.quantity) || 1, 99))
							}))
						: [];
				} catch (e) {
					this.orderItems = [];
				}
			}

			if (!this.orderItems.length && options.ids) {
				const quantities = uni.getStorageSync('selectedDishQuantities') || {};
				this.orderItems = String(options.ids)
					.split(',')
					.filter(id => /^\d+$/.test(id))
					.map(id => ({
						dishId: Number(id),
						quantity: Math.max(1, Math.min(Number(quantities[id]) || 1, 99))
					}));
			}

			this.loadChefs();
			this.loadRiders();
			this.loadStoreInfo();
			this.loadSelectedDishes();
			this.loadRegionStatus();
			this.loadOpenedRegions();
		},
		methods: {
			resolveAssetUrl(value) {
				const url = String(value || '');
				if (!url || /^https?:\/\//i.test(url)) return url;
				return config.baseUrl.replace(/\/$/, '') + (url.startsWith('/') ? url : '/' + url);
			},
			async loadOpenedRegions() {
				try { const res=await apiOpenedRegions(); this.openedRegions=(res&&res.data)||[]; } catch(e) {}
			},
			async loadRegionStatus() {
				const saved=uni.getStorageSync('currentRegion')||{};
				this.regionForm={...this.regionForm,...saved};
				try { const res=await apiRegionStatus({province:this.regionForm.province,city:this.regionForm.city,district:this.regionForm.district}); const data=(res&&res.data)||{}; this.regionOpened=!!data.opened; this.regionApplication=data.application||null; } catch(e) {}
			},
			async submitRegionApplication() {
				if(this.regionSubmitting)return;
				const f=this.regionForm;
				if(!f.applicantName.trim()||!/^1\d{10}$/.test(f.phone)||!f.province.trim()||!f.city.trim()||!f.district.trim()){uni.showToast({title:'请完整填写姓名、手机号和区域',icon:'none'});return;}
				try { this.regionSubmitting=true; await ensureLogin(); await apiRegionApply(f); uni.setStorageSync('currentRegion',{province:f.province,city:f.city,district:f.district,address:f.address}); this.showRegionApply=false; await this.loadRegionStatus(); uni.showToast({title:'申请已提交，等待审核',icon:'none'}); } catch(e) {} finally { this.regionSubmitting=false; }
			},
			async loadSelectedDishes() {
				if (!this.orderItems.length) {
					this.selectedDishes = [];
					return;
				}
				try {
					const result = await Promise.all(this.orderItems.map(item => {
						return apiDishDetail(item.dishId)
							.then(res => {
								const dish = res && res.data;
								return dish ? {
									id: item.dishId,
									name: dish.dishName || this.selectedName,
									image: dish.cover || this.selectedImage,
									quantity: item.quantity || 1
								} : null;
							})
							.catch(() => null);
					}));
					this.selectedDishes = result.filter(Boolean);
				} catch (e) {
					this.selectedDishes = [];
				}
			},
			async loadChefs() {
				try {
					const res = await apiChefList();
					const rows = (res && res.data) || [];
					this.chefList = rows.map(c => ({
						id: c.id,
						name: c.chefName,
						tag: c.skillTag || '',
						desc: c.intro || '',
						price: c.extraPrice ? '+' + c.extraPrice : '',
						time: c.estTime || '',
						avatar: c.avatar || '/static/kitchen_avatar.png'
					}));
					if (this.chefList.length) {
						this.selectedChefId = this.chefList[0].id;
					}
				} catch (e) {}
			},
			async loadRiders() {
				try {
					const res = await apiRiderList();
					const rows = (res && res.data) || [];
					this.deliveryStaff = rows.map(r => ({
						id: r.id,
						name: r.riderName,
						tag: r.tag || '',
						desc: r.intro || '',
						fee: r.deliveryFee != null ? '+' + r.deliveryFee : '',
						time: r.estTime || '',
						avatar: r.avatar || '/static/kitchen_avatar.png'
					}));
				} catch (e) {}
			},
			async loadStoreInfo() {
				try {
					const res = await apiShopInfo();
					const shop = res && res.data;
					if (shop) {
						this.storeInfo = {
							name: shop.storeName || shop.shopName || '',
							address: shop.storeAddress || shop.address || '',
							hours: shop.businessHours || '',
							phone: shop.storePhone || shop.phone || '',
							stockGroupQr: this.resolveAssetUrl(shop.stockGroupQr),
							stockGroupName: shop.stockGroupName || '',
							stockGroupNotice: shop.stockGroupNotice || ''
						};
					}
				} catch (e) {}
			},
			goBack() {
				uni.navigateBack();
			},
			selectService(value) {
				if ((value === '同城配送' || value === '厨师代炒') && !this.regionOpened) {
					if (this.regionApplication && this.regionApplication.auditStatus === '0') { uni.showToast({ title:'该区域申请正在审核中', icon:'none' }); return; }
					this.showRegionApply=true; return;
				}
				this.selectedService = value;
				if (value === '厨师代炒' && !this.selectedChefId && this.chefList.length > 0) {
					this.selectedChefId = this.chefList[0].id;
				}
			},
			selectChef(chef) {
				if (!chef) return;
				this.selectedChefId = chef.id;
			},
			selectDelivery(id) {
				this.selectedDeliveryId = id;
			},
			copyStoreAddress() {
				if (!this.storeInfo.address) return;
				uni.setClipboardData({
					data: `${this.storeInfo.name} ${this.storeInfo.address}`.trim(),
					success: () => {
						uni.showToast({ title: '地址已复制', icon: 'none' });
					}
				});
			},
			previewStockGroupQr() {
				if (!this.storeInfo.stockGroupQr) return;
				uni.previewImage({ current: this.storeInfo.stockGroupQr, urls: [this.storeInfo.stockGroupQr] });
			},
			async submitOrder() {
				if (this.needDelivery) {
					if (!this.deliveryName.trim()) {
						uni.showToast({ title: '请填写收货人姓名', icon: 'none' });
						return;
					}
					if (!/^1\d{10}$/.test(this.deliveryPhone.trim())) {
						uni.showToast({ title: '请填写正确的手机号', icon: 'none' });
						return;
					}
					if (!this.deliveryAddress.trim()) {
						uni.showToast({ title: '请填写收货地址', icon: 'none' });
						return;
					}
				}

				if (!this.orderItems.length) {
					uni.showToast({ title: '没有可下单的菜品', icon: 'none' });
					return;
				}

				try {
					await ensureLogin();
					const chefId = (this.selectedService === '厨师代炒' && /^\d+$/.test(String(this.selectedChefId)))
						? this.selectedChefId : null;
					const remarkParts = [];
					if (this.remark.trim()) remarkParts.push(this.remark.trim());
					remarkParts.push(`用餐类型：${this.selectedService}`);
					if (this.selectedService === '附近的菜市场') remarkParts.push(`菜市场方式：${this.marketMode === 'stockGroup' ? '商家提前备货群' : '附近菜市场'}`);
					const payload = {
						serviceType: this.serviceTypeCode,
						groupRoomId: this.groupRoomId,
						coupleOrder: this.coupleOrder ? '1' : '0',
						remoteFeed: this.remoteFeed || uni.getStorageSync('coupleRemoteFeed') === '1' ? '1' : '0',
						chefId,
						receiverName: this.needDelivery ? this.deliveryName.trim() : '',
						receiverPhone: this.needDelivery ? this.deliveryPhone.trim() : '',
						receiverAddress: this.needDelivery ? this.deliveryAddress.trim() : '',
						remark: remarkParts.join('\n'),
						shareFlag: this.shareEnabled ? '1' : '0',
						items: this.orderItems
					};
					if (this.selectedService === '同城配送' && /^\d+$/.test(String(this.selectedDeliveryId))) {
						payload.riderId = Number(this.selectedDeliveryId);
					}
					await apiSubmitOrder(payload);
					uni.removeStorageSync('coupleRemoteFeed');
					if (!this.basketEnabled) {
						uni.removeStorageSync('selectedDishIds');
						uni.removeStorageSync('selectedDishQuantities');
					}
					uni.setStorageSync('afterSubmitGoOrder', '1');
					uni.showToast({ title: '下单成功', icon: 'success' });
					setTimeout(() => uni.navigateBack(), 900);
				} catch (e) {}
			}
		}
	}
</script>

<style>
	.submit-page {
		width: 750rpx;
		min-height: 100vh;
		background:
			linear-gradient(180deg, rgba(224,248,240,.68) 0, rgba(247,251,249,.96) 330rpx, #f8fbfa 520rpx),
			url('/static/kitchen_banner.png') top center / 750rpx auto no-repeat;
		padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
		color: #202725;
		font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
	}

	.submit-header {
		width: 750rpx;
		height: 150rpx;
		box-sizing: border-box;
	}

	.status-bar {
		height: var(--status-bar-height);
	}

	.submit-nav {
		height: 104rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.nav-back {
		position: absolute;
		left: 22rpx;
		top: 22rpx;
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(251, 254, 253, 0.86);
	}

	.back-icon {
		width: 40rpx;
		height: 40rpx;
	}

	.submit-title {
		font-size: 36rpx;
		line-height: 1;
		font-weight: 900;
		color: #1b2428;
	}

	.submit-capsule {
		position: absolute;
		right: 24rpx;
		top: 20rpx;
		width: 204rpx;
		height: 64rpx;
		border-radius: 34rpx;
		background: rgba(251, 254, 253, 0.78);
		border: 1rpx solid rgba(34, 46, 43, 0.08);
		display: flex;
		align-items: center;
		justify-content: space-around;
		padding: 0 18rpx;
		box-sizing: border-box;
	}

	.capsule-dots {
		width: 42rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.dot {
		width: 9rpx;
		height: 9rpx;
		border-radius: 50%;
		background: #17201d;
	}

	.capsule-divider {
		width: 1rpx;
		height: 36rpx;
		background: rgba(23, 32, 29, 0.12);
	}

	.capsule-minus {
		width: 28rpx;
		height: 5rpx;
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
		background: #17201d;
	}

	.submit-content {
		height: calc(100vh - 278rpx - env(safe-area-inset-bottom));
		padding: 0 18rpx 28rpx;
		box-sizing: border-box;
	}

	.submit-card {
		width: 714rpx;
		margin-bottom: 22rpx;
		padding: 28rpx 28rpx;
		border-radius: 28rpx;
		background: rgba(251, 254, 253, 0.98);
		box-shadow: 0 10rpx 34rpx rgba(31, 50, 45, 0.035);
		box-sizing: border-box;
	}

	.card-title {
		display: block;
		font-size: 34rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
	}
	.selected-head { display:flex; align-items:center; justify-content:space-between; }
	.social-tag { padding:9rpx 16rpx; border-radius:22rpx; background:#e7f8f2; color:#28b990; font-size:21rpx; font-weight:800; }
	.social-tag.couple { background:#fff0f2; color:#cf667c; }
	.region-status-row { margin-top:24rpx; padding:20rpx; display:flex; align-items:center; justify-content:space-between; border-radius:18rpx; background:#f3f7f5; }
	.region-status-row>view { display:flex; flex-direction:column; }
	.region-status-title { font-size:26rpx; font-weight:900; }
	.region-status-desc { margin-top:7rpx; color:#84908c; font-size:21rpx; }
	.region-status-row>text { padding:8rpx 14rpx; border-radius:18rpx; font-size:21rpx; font-weight:900; }
	.region-status-row .opened { background:#e4f8f0; color:#24ad86; }
	.region-status-row .closed { background:#fff0eb; color:#d7765e; }
	.opened-region-scroll { margin-top:14rpx; white-space:nowrap; }
	.opened-region-list { display:inline-flex; align-items:center; gap:10rpx; }
	.opened-region-list text { padding:8rpx 13rpx; border-radius:17rpx; background:#eef4f2; color:#687570; font-size:20rpx; }
	.opened-region-list text:first-child { padding-left:0; background:transparent; color:#8b9692; }

	.selected-list {
		margin-top: 26rpx;
		display: flex;
		flex-direction: column;
		gap: 18rpx;
	}

	.selected-row {
		min-height: 128rpx;
		display: flex;
		align-items: center;
	}

	.selected-img {
		width: 132rpx;
		height: 132rpx;
		border-radius: 16rpx;
		background: #f0f3f2;
		flex-shrink: 0;
	}

	.selected-name {
		margin-left: 26rpx;
		font-size: 32rpx;
		line-height: 1;
		font-weight: 800;
		color: #2b3331;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.selected-count {
		font-size: 30rpx;
		line-height: 1;
		font-weight: 700;
		color: #4e5653;
	}

	.service-row {
		margin-top: 28rpx;
		display: flex;
		align-items: center;
	}

	.service-label {
		font-size: 30rpx;
		line-height: 1;
		font-weight: 700;
		color: #2d3633;
		flex-shrink: 0;
	}

	.service-options {
		flex: 1;
		min-width: 0;
		height: 62rpx;
		margin-left: 22rpx;
		white-space: nowrap;
	}

	.service-chip-list {
		height: 62rpx;
		display: inline-flex;
		align-items: center;
		gap: 14rpx;
	}

	.service-chip {
		height: 58rpx;
		padding: 0 22rpx;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		border-radius: 30rpx;
		background: #f3f6f5;
		font-size: 26rpx;
		line-height: 1;
		font-weight: 800;
		color: #59625f;
		flex-shrink: 0;
		box-sizing: border-box;
	}

	.service-chip.active {
		background: #35cda4;
		color: #fbfefd;
		box-shadow: 0 8rpx 18rpx rgba(53, 205, 164, 0.18);
	}

	.service-dot {
		font-size: 20rpx;
	}

	.delivery-section,
	.chef-section,
	.pickup-section {
		margin-top: 26rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid #eef2f1;
	}

	.delivery-section {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.delivery-section-title,
	.chef-section-title,
	.pickup-title {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
	}

	.delivery-row {
		display: flex;
		align-items: center;
	}

	.delivery-label {
		width: 124rpx;
		font-size: 28rpx;
		line-height: 1;
		font-weight: 700;
		color: #2d3633;
		flex-shrink: 0;
	}

	.delivery-input {
		flex: 1;
		height: 76rpx;
		padding: 0 24rpx;
		border-radius: 14rpx;
		background: #f6f7f8;
		font-size: 28rpx;
		color: #2b3331;
		box-sizing: border-box;
	}

	.delivery-placeholder,
	.remark-placeholder {
		color: #b7bdba;
	}

	.chef-section-head,
	.pickup-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16rpx;
	}

	.chef-section-count {
		font-size: 23rpx;
		line-height: 1;
		font-weight: 700;
		color: #9aa2a0;
	}

	.chef-list {
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}

	.chef-row {
		min-height: 116rpx;
		padding: 16rpx;
		display: flex;
		align-items: center;
		border-radius: 18rpx;
		background: #f6f8f7;
		border: 2rpx solid transparent;
		box-sizing: border-box;
	}

	.chef-row.active {
		background: #f1fffb;
		border-color: rgba(53, 205, 164, 0.68);
	}

	.chef-avatar {
		width: 74rpx;
		height: 74rpx;
		border-radius: 50%;
		background: #eef5f2;
		flex-shrink: 0;
	}

	.chef-info {
		flex: 1;
		min-width: 0;
		margin-left: 18rpx;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.chef-info.no-avatar {
		margin-left: 0;
	}

	.chef-name-line {
		display: flex;
		align-items: center;
		gap: 12rpx;
		min-width: 0;
	}

	.chef-name {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: #24302d;
		white-space: nowrap;
	}

	.chef-tag {
		max-width: 128rpx;
		height: 34rpx;
		padding: 0 12rpx;
		display: flex;
		align-items: center;
		border-radius: 17rpx;
		background: #e7f8f2;
		font-size: 20rpx;
		line-height: 34rpx;
		font-weight: 800;
		color: #28b990;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		box-sizing: border-box;
	}

	.chef-desc {
		font-size: 22rpx;
		line-height: 1;
		font-weight: 700;
		color: #8f9794;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chef-side {
		width: 96rpx;
		margin-left: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 12rpx;
		flex-shrink: 0;
	}

	.chef-price {
		font-size: 26rpx;
		line-height: 1;
		font-weight: 900;
		color: #35cda4;
	}

	.chef-time {
		font-size: 20rpx;
		line-height: 1;
		font-weight: 700;
		color: #9aa2a0;
		white-space: nowrap;
	}

	.chef-check {
		width: 42rpx;
		height: 42rpx;
		margin-left: 14rpx;
		border-radius: 50%;
		border: 2rpx solid #d7ddda;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fbfefd;
		font-size: 24rpx;
		line-height: 1;
		font-weight: 900;
		box-sizing: border-box;
		flex-shrink: 0;
	}

	.chef-row.active .chef-check {
		border-color: #35cda4;
		background: #35cda4;
	}

	.pickup-copy {
		height: 46rpx;
		padding: 0 22rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 23rpx;
		background: #e7f8f2;
		font-size: 23rpx;
		line-height: 1;
		font-weight: 800;
		color: #28b990;
		box-sizing: border-box;
	}

	.pickup-box {
		padding: 22rpx 24rpx;
		border-radius: 18rpx;
		background: #f6f8f7;
		display: flex;
		flex-direction: column;
		gap: 14rpx;
		box-sizing: border-box;
	}

	.pickup-store-name {
		font-size: 28rpx;
		line-height: 1;
		font-weight: 900;
		color: #24302d;
	}

	.pickup-store-address {
		font-size: 26rpx;
		line-height: 1.45;
		font-weight: 700;
		color: #4e5653;
	}

	.pickup-meta {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}

	.pickup-meta-item {
		font-size: 22rpx;
		line-height: 1;
		font-weight: 700;
		color: #8f9794;
	}

	.remark-input {
		width: 100%;
		height: 112rpx;
		margin-top: 24rpx;
		padding: 24rpx;
		border-radius: 10rpx;
		background: #f6f7f8;
		font-size: 28rpx;
		line-height: 1.4;
		color: #2b3331;
		box-sizing: border-box;
	}

	.toggle-card {
		padding-top: 22rpx;
		padding-bottom: 22rpx;
	}

	.toggle-row {
		min-height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18rpx;
	}

	.toggle-copy {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.toggle-title {
		font-size: 32rpx;
		line-height: 1;
		font-weight: 900;
		color: #202725;
	}

	.toggle-desc {
		font-size: 24rpx;
		line-height: 1;
		font-weight: 700;
		color: #8f9794;
	}

	.toggle-divider {
		height: 1rpx;
		margin: 22rpx 0;
		background: #edf1ef;
	}

	.submit-bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		width: 750rpx;
		height: calc(112rpx + env(safe-area-inset-bottom));
		padding: 0 24rpx env(safe-area-inset-bottom);
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(251, 254, 253, 0.98);
		box-shadow: 0 -12rpx 30rpx rgba(28, 45, 40, 0.04);
		box-sizing: border-box;
	}

	.total-text {
		font-size: 30rpx;
		line-height: 1;
		font-weight: 800;
		color: #2b3331;
	}

	.submit-btn {
		width: 238rpx;
		height: 72rpx;
		border-radius: 38rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #35cda4;
		color: #fbfefd;
		font-size: 30rpx;
		line-height: 1;
		font-weight: 900;
	}
	.service-chip.unavailable { background:#f2f4f3; color:#9aa3a0; border-color:#e6e9e8; }
	.market-mode-tabs { display:grid; grid-template-columns:1fr 1fr; gap:12rpx; margin-bottom:20rpx; }
	.market-mode-tabs>view { min-height:78rpx; padding:14rpx 18rpx; border:1rpx solid #e3ebe8; border-radius:17rpx; background:#f2f6f4; display:flex; flex-direction:column; justify-content:center; box-sizing:border-box; }
	.market-mode-tabs>view.active { border-color:#7bd9bd; background:#e8faf4; color:#22a982; }
	.market-mode-tabs text { font-size:25rpx; font-weight:900; }
	.market-mode-tabs small { margin-top:5rpx; color:#89958f; font-size:19rpx; }
	.stock-group-box { min-height:210rpx; padding:20rpx; border-radius:18rpx; background:#f3f8f6; display:flex; gap:20rpx; box-sizing:border-box; }
	.stock-group-box image { width:170rpx; height:170rpx; flex:none; border-radius:13rpx; background:#fbfefd; }
	.stock-group-copy { flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; }
	.stock-group-name { font-size:28rpx; font-weight:900; }
	.stock-group-notice { margin-top:10rpx; color:#77847f; font-size:22rpx; line-height:1.5; }
	.stock-group-action { margin-top:13rpx; color:#22b58d; font-size:21rpx; font-weight:800; }
	.service-unavailable { margin-left:6rpx; font-size:20rpx; color:#f08b70; }
	.region-mask { position:fixed; inset:0; z-index:80; background:rgba(25,31,29,.48); }
	.region-sheet { position:fixed; left:0; right:0; bottom:0; z-index:81; padding:30rpx 28rpx calc(30rpx + env(safe-area-inset-bottom)); border-radius:30rpx 30rpx 0 0; background:#fbfefd; box-sizing:border-box; }
	.region-sheet-head { display:flex; align-items:center; justify-content:space-between; }
	.region-sheet-title { font-size:34rpx; font-weight:900; color:#202725; }
	.region-close { width:56rpx; height:56rpx; text-align:center; font-size:46rpx; line-height:50rpx; color:#8f9895; }
	.region-tip { display:block; margin:12rpx 0 24rpx; font-size:24rpx; line-height:1.5; color:#8f9895; }
	.region-line { display:flex; gap:14rpx; }
	.region-input { height:76rpx; margin-bottom:16rpx; padding:0 22rpx; border-radius:14rpx; background:#f3f6f5; font-size:27rpx; box-sizing:border-box; }
	.region-third { flex:1; min-width:0; }
	.region-textarea { width:100%; height:130rpx; margin-bottom:22rpx; padding:20rpx 22rpx; border-radius:14rpx; background:#f3f6f5; font-size:27rpx; box-sizing:border-box; }
	.region-submit { height:78rpx; display:flex; align-items:center; justify-content:center; border-radius:40rpx; background:#35cda4; color:#fff; font-size:30rpx; font-weight:900; }
	.region-submit.disabled { opacity:.55; }
</style>
