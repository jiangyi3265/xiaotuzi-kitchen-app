<template>
	<view class="grocery-page">
		<view class="grocery-header">
			<view class="back-btn" @tap="goBack">‹</view>
			<view class="header-copy"><text class="header-title">采购清单</text><text class="header-sub">订单 {{ orderNo ? '#' + orderNo : '' }}</text></view>
			<view class="header-progress">{{ checkedCount }}/{{ groceries.length }}</view>
		</view>
		<view class="progress-track"><view class="progress-value" :style="{width: progress + '%'}"></view></view>
		<scroll-view class="grocery-scroll" scroll-y>
			<view class="summary-card">
				<text class="summary-title">{{ summaryTitle }}</text>
				<text class="summary-desc">{{ dishes.length }} 道菜 · {{ groceries.length }} 种食材</text>
				<view class="copy-list-button" @tap="copyList">复制采购清单</view>
			</view>
			<view class="section-head"><text>要买的食材</text><text class="check-all" @tap="toggleAll">{{ progress === 100 ? '取消全选' : '全部买齐' }}</text></view>
			<view class="grocery-list" v-if="groceries.length">
				<view class="grocery-row" :class="{done:item.checked}" v-for="item in groceries" :key="item.key" @tap="toggle(item)">
					<view class="check-circle"><text v-if="item.checked">✓</text></view>
					<view class="grocery-copy"><text class="grocery-name">{{ item.name }}</text><text class="grocery-source">用于 {{ item.dishNames.join('、') }}<text v-if="item.quantity > 1"> · ×{{ item.quantity }}</text></text></view>
				</view>
			</view>
			<view class="empty-card" v-else-if="!loading"><text>这些菜还没有配置用料</text></view>
			<view class="section-head dish-head"><text>对应菜品与做法</text><text>点击查看步骤</text></view>
			<view class="dish-list">
				<view class="dish-row" v-for="dish in dishes" :key="dish.id" @tap="openDish(dish.id)">
					<image class="dish-img" :src="dish.cover || '/static/onion_chicken.png'" mode="aspectFill"></image>
					<view class="dish-copy"><text class="dish-name">{{ dish.name }}</text><text class="dish-meta">{{ dish.ingredientCount }} 种用料 · {{ dish.stepCount }} 个步骤</text></view>
					<text class="dish-arrow">›</text>
				</view>
			</view>
			<view class="safe-space"></view>
		</scroll-view>
		<view class="loading-mask" v-if="loading"><text>正在整理采购清单...</text></view>
	</view>
</template>
<script>
import { apiOrderDetail } from '@/api/order.js'
import { apiDishDetail } from '@/api/dish.js'
import { ensureLogin } from '@/utils/login.js'
export default {
	data(){return {orderId:'',orderNo:'',stockGroup:false,loading:true,dishes:[],groceries:[]}},
	computed:{
		checkedCount(){return this.groceries.filter(i=>i.checked).length},
		progress(){return this.groceries.length?Math.round(this.checkedCount/this.groceries.length*100):0},
		summaryTitle(){if(this.progress===100&&this.groceries.length)return'食材已经买齐';return this.stockGroup?'采购清单已生成，可发给商家备货':'按清单采购，回家就能开做'}
	},
	onLoad(options){this.orderId=String(options.orderId||'');this.stockGroup=String(options.stockGroup||'')==='1';this.load()},
	methods:{
		async load(){if(!/^\d+$/.test(this.orderId)){this.loading=false;return}try{await ensureLogin();const res=await apiOrderDetail(this.orderId);const order=(res&&res.data)||{};this.orderNo=order.orderNo||'';const items=Array.isArray(order.items)?order.items:[];const details=await Promise.all(items.map(item=>apiDishDetail(item.dishId).then(r=>({item,data:r&&r.data})).catch(()=>({item,data:null}))));const map={};this.dishes=details.filter(x=>x.data).map(({item,data})=>{const ingredients=this.parseIngredients(data.ingredients);ingredients.forEach(name=>{const key=this.normalizeKey(name);if(!map[key])map[key]={key,name,quantity:0,dishNames:[],checked:false};map[key].quantity+=Number(item.quantity)||1;if(!map[key].dishNames.includes(data.dishName))map[key].dishNames.push(data.dishName)});return{id:data.id,name:data.dishName,cover:data.cover,ingredientCount:ingredients.length,stepCount:(data.steps||[]).length}});const saved=uni.getStorageSync('groceryProgress:'+this.orderId)||{};this.groceries=Object.values(map).map(i=>({...i,checked:!!saved[i.key]}))}catch(e){uni.showToast({title:'采购清单读取失败',icon:'none'})}finally{this.loading=false}},
		parseIngredients(text){return String(text||'').split(/[\n\r,，、;；]+/).map(v=>v.trim()).filter(Boolean)},
		normalizeKey(v){return String(v).replace(/\s+/g,'').toLowerCase()},
		persist(){const value={};this.groceries.forEach(i=>{if(i.checked)value[i.key]=1});uni.setStorageSync('groceryProgress:'+this.orderId,value)},
		toggle(item){item.checked=!item.checked;this.persist()},toggleAll(){const done=this.progress===100;this.groceries.forEach(i=>i.checked=!done);this.persist()},
		copyList(){if(!this.groceries.length){uni.showToast({title:'暂无可复制的食材',icon:'none'});return}const lines=['【采购清单】'];if(this.orderNo)lines.push('订单：#'+this.orderNo);lines.push('','要买的食材：');this.groceries.forEach((item,index)=>lines.push(`${index+1}. ${item.name}${item.quantity>1?' ×'+item.quantity:''}（用于${item.dishNames.join('、')}）`));if(this.dishes.length)lines.push('','对应菜品：'+this.dishes.map(item=>item.name).join('、'));uni.setClipboardData({data:lines.join('\n'),success:()=>uni.showToast({title:'采购清单已复制',icon:'success'})})},
		openDish(id){uni.navigateTo({url:'/pages/dish-detail/dish-detail?id='+id+'&from=grocery&orderId='+this.orderId})},goBack(){uni.navigateBack()}
	}
}
</script>
<style>
.grocery-page{min-height:100vh;background:#f5faf8;color:#202725}.grocery-header{height:176rpx;padding:calc(34rpx + env(safe-area-inset-top)) 28rpx 20rpx;display:flex;align-items:flex-end;background:linear-gradient(145deg,#dffaf2,#f8fffc);box-sizing:border-box}.back-btn{width:68rpx;height:68rpx;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff;font-size:58rpx;line-height:1;color:#26302d}.header-copy{flex:1;margin-left:20rpx;display:flex;flex-direction:column}.header-title{font-size:38rpx;font-weight:900}.header-sub{margin-top:6rpx;font-size:22rpx;color:#89948f}.header-progress{font-size:30rpx;font-weight:900;color:#22bf91}.progress-track{height:8rpx;background:#dfeae6}.progress-value{height:8rpx;background:#35cda4;transition:width .25s}.grocery-scroll{height:calc(100vh - 184rpx)}.summary-card{margin:24rpx 24rpx 16rpx;padding:30rpx;border-radius:24rpx;background:#24342f;color:#fff;display:flex;flex-direction:column;box-shadow:0 12rpx 28rpx rgba(36,52,47,.13)}.summary-title{font-size:31rpx;font-weight:900}.summary-desc{margin-top:10rpx;font-size:23rpx;color:#bcd2ca}.copy-list-button{width:230rpx;height:62rpx;margin-top:22rpx;display:flex;align-items:center;justify-content:center;border-radius:32rpx;background:#35cda4;color:#f8fffc;font-size:23rpx;font-weight:900}.section-head{height:72rpx;padding:0 30rpx;display:flex;align-items:center;justify-content:space-between;font-size:29rpx;font-weight:900}.section-head>text:last-child{font-size:23rpx;color:#35cda4}.grocery-list,.dish-list{margin:0 24rpx;border-radius:22rpx;background:#fff;overflow:hidden}.grocery-row{min-height:100rpx;padding:18rpx 22rpx;display:flex;align-items:center;border-bottom:1rpx solid #edf2f0;box-sizing:border-box}.grocery-row:last-child{border-bottom:0}.check-circle{width:42rpx;height:42rpx;border:3rpx solid #b9c5c1;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;box-sizing:border-box}.grocery-row.done .check-circle{border-color:#35cda4;background:#35cda4}.grocery-copy{flex:1;margin-left:20rpx;display:flex;flex-direction:column}.grocery-name{font-size:28rpx;font-weight:850}.grocery-source{margin-top:7rpx;font-size:21rpx;color:#97a19d}.grocery-row.done .grocery-name{text-decoration:line-through;color:#9ba5a1}.dish-head{margin-top:18rpx}.dish-row{height:132rpx;padding:16rpx 20rpx;display:flex;align-items:center;border-bottom:1rpx solid #edf2f0}.dish-img{width:96rpx;height:96rpx;border-radius:13rpx}.dish-copy{flex:1;margin-left:18rpx;display:flex;flex-direction:column}.dish-name{font-size:28rpx;font-weight:900}.dish-meta{margin-top:10rpx;font-size:22rpx;color:#95a09b}.dish-arrow{font-size:46rpx;color:#93a09b}.empty-card{margin:0 24rpx;padding:70rpx 20rpx;border-radius:22rpx;background:#fff;text-align:center;color:#9ba5a1}.safe-space{height:80rpx}.loading-mask{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(245,250,248,.86);color:#6f7c77;font-size:27rpx}
</style>
