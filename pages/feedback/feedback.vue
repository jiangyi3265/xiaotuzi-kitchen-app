<template>
	<view class="page">
		<view class="header"><text class="back" @tap="back">‹</text><view><text class="title">反馈与建议</text><text class="subtitle">每一条意见都会进入后台处理</text></view></view>
		<view class="form-section">
			<text class="section-title">你想告诉我们什么？</text>
			<scroll-view class="type-scroll" scroll-x show-scrollbar="false"><view class="types"><text v-for="item in types" :key="item.value" :class="{active:form.feedbackType===item.value}" @tap="form.feedbackType=item.value">{{item.label}}</text></view></scroll-view>
			<view class="content-box"><textarea v-model="form.content" maxlength="1000" placeholder="请详细描述你的建议或遇到的问题"/><text>{{form.content.length}}/1000</text></view>
			<view class="images"><view class="image-item" v-for="(url,index) in imageUrls" :key="url"><image :src="url" mode="aspectFill" @tap="preview(index)"/><text @tap="removeImage(index)">×</text></view><view class="add-image" v-if="imageUrls.length<3" @tap="chooseImages"><b>＋</b><text>添加截图</text></view></view>
			<input class="contact" v-model="form.contact" maxlength="100" placeholder="联系方式（选填，微信号或手机号）"/>
			<view class="submit" :class="{disabled:submitting}" @tap="submit">{{submitting?'提交中...':'提交反馈'}}</view>
		</view>

		<view class="history" v-if="history.length">
			<text class="section-title">处理进度</text>
			<view class="history-row" v-for="item in history" :key="item.id">
				<view class="history-head"><text>{{typeText(item.feedbackType)}}</text><b :class="'status-'+item.handleStatus">{{statusText(item.handleStatus)}}</b></view>
				<text class="history-content">{{item.content}}</text>
				<view class="reply" v-if="item.reply"><b>平台回复</b><text>{{item.reply}}</text></view>
				<text class="time">{{item.createTime}}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { apiFeedbackMy, apiFeedbackSubmit } from '@/api/feedback.js'
import { uploadFile } from '@/utils/request.js'
import { ensureLogin } from '@/utils/login.js'

export default {
	data(){return{types:[{value:'0',label:'功能建议'},{value:'1',label:'问题反馈'},{value:'2',label:'服务投诉'},{value:'3',label:'其他'}],form:{feedbackType:'0',content:'',contact:''},imageUrls:[],history:[],submitting:false}},
	onLoad(){this.loadHistory()},
	methods:{
		async loadHistory(){try{await ensureLogin();const r=await apiFeedbackMy();this.history=(r&&r.data)||[]}catch(e){}},
		typeText(v){return(this.types.find(x=>x.value===v)||{}).label||'其他'},
		statusText(v){return{'0':'待处理','1':'处理中','2':'已回复'}[v]||'待处理'},
		chooseImages(){uni.chooseImage({count:3-this.imageUrls.length,sizeType:['compressed'],success:async res=>{for(const path of res.tempFilePaths||[]){try{const uploaded=await uploadFile(path);if(uploaded&&uploaded.url)this.imageUrls.push(uploaded.url)}catch(e){}}}})},
		preview(index){uni.previewImage({current:index,urls:this.imageUrls})},
		removeImage(index){this.imageUrls.splice(index,1)},
		async submit(){if(this.submitting)return;if(this.form.content.trim().length<5){uni.showToast({title:'请至少填写5个字',icon:'none'});return}try{this.submitting=true;await ensureLogin();await apiFeedbackSubmit({...this.form,content:this.form.content.trim(),images:this.imageUrls.join(',')});uni.showToast({title:'感谢你的反馈',icon:'success'});this.form.content='';this.form.contact='';this.imageUrls=[];await this.loadHistory()}catch(e){}finally{this.submitting=false}},
		back(){uni.navigateBack()}
	}
}
</script>

<style>
.page{min-height:100vh;padding-bottom:60rpx;background:#f4faf7;color:#20302b}.header{height:174rpx;padding:calc(36rpx + env(safe-area-inset-top)) 28rpx 24rpx;display:flex;align-items:flex-end;box-sizing:border-box;background:#def8ef}.back{width:68rpx;font-size:58rpx;line-height:1}.header>view{display:flex;flex-direction:column}.title{font-size:36rpx;font-weight:900}.subtitle{margin-top:7rpx;color:#75867f;font-size:23rpx}.form-section,.history{margin:24rpx;padding:28rpx;border-radius:26rpx;background:#fbfefc;box-shadow:0 10rpx 28rpx rgba(36,104,84,.06)}.section-title{display:block;margin-bottom:20rpx;font-size:29rpx;font-weight:900}.type-scroll{white-space:nowrap}.types{display:inline-flex;gap:12rpx;padding-bottom:20rpx}.types text{height:58rpx;padding:0 24rpx;border-radius:30rpx;background:#edf3f1;color:#697872;line-height:58rpx;font-size:23rpx;font-weight:800}.types text.active{background:#35cda4;color:#f7fffc}.content-box{position:relative;padding:18rpx 18rpx 42rpx;border:1rpx solid #e3ece8;border-radius:17rpx;background:#f3f7f5}.content-box textarea{width:100%;height:230rpx;font-size:27rpx;line-height:1.6}.content-box>text{position:absolute;right:18rpx;bottom:13rpx;color:#96a19d;font-size:20rpx}.images{display:flex;gap:14rpx;margin-top:18rpx}.image-item,.add-image{position:relative;width:142rpx;height:142rpx;border-radius:16rpx;overflow:hidden}.image-item image{width:100%;height:100%}.image-item>text{position:absolute;right:5rpx;top:5rpx;width:38rpx;height:38rpx;border-radius:50%;background:rgba(29,39,35,.68);color:#fff;text-align:center;line-height:35rpx}.add-image{border:1rpx dashed #9ccfbe;background:#eff8f5;color:#54a98e;display:flex;flex-direction:column;align-items:center;justify-content:center}.add-image b{font-size:38rpx}.add-image text{margin-top:7rpx;font-size:20rpx}.contact{height:80rpx;margin-top:20rpx;padding:0 20rpx;border-radius:15rpx;background:#f2f7f5;box-sizing:border-box}.submit{height:84rpx;margin-top:22rpx;border-radius:44rpx;background:#35cda4;color:#f7fffc;display:flex;align-items:center;justify-content:center;font-size:29rpx;font-weight:900}.disabled{opacity:.5}.history-row{padding:22rpx 0;border-top:1rpx solid #e7eeeb}.history-row:first-of-type{border-top:0}.history-head{display:flex;justify-content:space-between;align-items:center}.history-head>text{font-size:26rpx;font-weight:900}.history-head b{padding:7rpx 14rpx;border-radius:18rpx;background:#fff1d9;color:#b98227;font-size:20rpx}.history-head .status-1{background:#e8f4ff;color:#4384a9}.history-head .status-2{background:#e3f8f0;color:#20a981}.history-content{display:block;margin-top:12rpx;color:#596963;font-size:24rpx;line-height:1.55}.reply{margin-top:15rpx;padding:16rpx;border-radius:14rpx;background:#edf9f5;display:flex;flex-direction:column;gap:7rpx}.reply b{color:#20a982;font-size:22rpx}.reply text{font-size:23rpx;line-height:1.5}.time{display:block;margin-top:12rpx;color:#9aa5a0;font-size:20rpx}
</style>
