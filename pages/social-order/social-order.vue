<template>
	<view class="page" :class="{ remote }">
		<view class="header">
			<text class="back" @tap="back">‹</text>
			<view><text class="title">{{ remote ? '异地投喂' : '情侣共同点餐' }}</text><text class="subtitle">{{ remote ? '下单后，TA 会收到投喂通知' : '双方选择实时汇总，并标明是谁点的' }}</text></view>
		</view>
		<couple-order-panel ref="orderPanel" class="panel" :remote="remote"/>
	</view>
</template>

<script>
	import CoupleOrderPanel from '@/components/couple-order-panel/couple-order-panel.vue'
	import { guardFeatureOrRedirect } from '@/utils/feature.js'

	export default {
		components: { CoupleOrderPanel },
		data() {
			return { remote: false }
		},
		async onLoad(options = {}) {
			if (await guardFeatureOrRedirect()) return
			this.remote = String(options.remote || '') === '1'
		},
		onShow() {
			this.$nextTick(() => {
				if (this.$refs.orderPanel) this.$refs.orderPanel.resume()
			})
		},
		methods: {
			back() { uni.navigateBack() }
		}
	}
</script>

<style>
	.page{height:100vh;display:flex;flex-direction:column;background:#f4faf7;color:#1f2926;overflow:hidden}.header{flex:none;height:190rpx;padding:calc(44rpx + env(safe-area-inset-top)) 28rpx 24rpx;display:flex;align-items:flex-end;background:linear-gradient(145deg,#28cfa3,#77dfbf);color:#f8fffc;box-sizing:border-box}.back{width:66rpx;font-size:54rpx}.header>view{display:flex;flex-direction:column}.title{font-size:38rpx;font-weight:900}.subtitle{margin-top:8rpx;font-size:22rpx;opacity:.88}.panel{flex:1;min-height:0}
</style>
