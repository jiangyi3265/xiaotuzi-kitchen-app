<template>
	<view class="page">
		<view class="head">
			<text class="back" @tap="back">‹</text>
			<view><text class="title">申请成为{{ roleName }}</text><text class="subtitle">提交后由平台后台审核</text></view>
		</view>

		<view v-if="loadingStatus" class="loading">正在查询申请状态...</view>
		<view v-else-if="application && application.auditStatus !== '2'" class="status-panel">
			<view class="status-head">
				<text class="status-symbol">{{ application.auditStatus === '1' ? '✓' : '…' }}</text>
				<view><text class="status-title">{{ application.auditStatus === '1' ? '审核已通过' : '申请审核中' }}</text><text class="status-desc">{{ application.auditStatus === '1' ? `你已成为平台${roleName}` : '后台审核完成后，这里会同步显示结果' }}</text></view>
			</view>
			<view class="status-row"><text>申请身份</text><b>{{ roleName }}</b></view>
			<view class="status-row"><text>服务区域</text><b>{{ regionText }}</b></view>
			<view v-if="application.providerId" class="status-row"><text>人员编号</text><b>#{{ application.providerId }}</b></view>
		</view>

		<view v-else class="form-section">
			<view v-if="application && application.auditStatus === '2'" class="reject-note">
				<text class="reject-title">上次申请未通过</text>
				<text>{{ application.remark || '请核对资料后重新提交' }}</text>
			</view>
			<text class="section-title">基本信息</text>
			<input v-model="form.applicantName" placeholder="申请人姓名" />
			<input v-model="form.phone" type="number" maxlength="11" placeholder="联系电话" />
			<view class="region-line">
				<input v-model="form.province" placeholder="省" />
				<input v-model="form.city" placeholder="市" />
				<input v-model="form.district" placeholder="区/县" />
			</view>
			<input v-model="form.address" placeholder="详细地址" />

			<text class="section-title role-title">{{ type === '0' ? '配送能力' : '厨艺能力' }}</text>
			<input v-if="type === '0'" v-model="form.vehicleType" placeholder="交通工具，如电动车、汽车" />
			<input v-else v-model="form.skillTag" placeholder="擅长菜系，如家常菜、川湘菜" />
			<textarea v-model="form.experience" maxlength="500" :placeholder="type === '0' ? '配送经验、可服务时段等' : '从业经历、擅长菜品等'"></textarea>

			<view class="agreement"><text class="dot">✓</text><text>提交即表示资料真实有效，审核结果会同步到本页</text></view>
			<view class="submit" :class="{ disabled: submitting }" @tap="submit">{{ submitting ? '提交中...' : '提交审核' }}</view>
		</view>
	</view>
</template>

<script>
import { apiServiceApplicationMy, apiServiceApplicationApply } from '@/api/service-application.js'
import { ensureLogin } from '@/utils/login.js'

export default {
	data() {
		return {
			type: '0', loadingStatus: true, submitting: false, application: null,
			form: { applicantName: '', phone: '', province: '', city: '', district: '', address: '', experience: '', skillTag: '', vehicleType: '' }
		}
	},
	computed: {
		roleName() { return this.type === '0' ? '配送员' : '代炒厨师' },
		regionText() { const a = this.application || {}; return [a.province, a.city, a.district].filter(Boolean).join(' ') || '未填写' }
	},
	onLoad(options) {
		this.type = options.type === '1' ? '1' : '0'
		const region = uni.getStorageSync('currentRegion') || {}
		this.form.province = region.province || ''
		this.form.city = region.city || ''
		this.form.district = region.district || ''
		this.form.address = region.address || ''
		this.loadStatus()
	},
	methods: {
		async loadStatus() {
			try {
				await ensureLogin()
				const response = await apiServiceApplicationMy(this.type)
				this.application = response.data || null
			} catch (e) {} finally { this.loadingStatus = false }
		},
		async submit() {
			if (this.submitting) return
			const f = this.form
			if (!f.applicantName.trim() || !/^1\d{10}$/.test(f.phone) || !f.province.trim() || !f.city.trim() || !f.district.trim()) {
				uni.showToast({ title: '请完整填写姓名、手机号和服务区域', icon: 'none' }); return
			}
			if (this.type === '0' && !f.vehicleType.trim()) { uni.showToast({ title: '请填写配送交通工具', icon: 'none' }); return }
			if (this.type === '1' && !f.skillTag.trim()) { uni.showToast({ title: '请填写擅长菜系', icon: 'none' }); return }
			try {
				this.submitting = true
				await ensureLogin()
				await apiServiceApplicationApply({ ...f, applicationType: this.type })
				uni.setStorageSync('currentRegion', { province: f.province, city: f.city, district: f.district, address: f.address })
				uni.showToast({ title: '申请已提交', icon: 'success' })
				await this.loadStatus()
			} catch (e) {} finally { this.submitting = false }
		},
		back() { uni.navigateBack() }
	}
}
</script>

<style>
.page{min-height:100vh;background:#f4faf7;color:#20302b;padding-bottom:60rpx}.head{height:174rpx;padding:calc(36rpx + env(safe-area-inset-top)) 28rpx 24rpx;display:flex;align-items:flex-end;box-sizing:border-box;background:#def8ef}.back{width:68rpx;font-size:58rpx;line-height:1}.head>view{display:flex;flex-direction:column}.title{font-size:36rpx;font-weight:900}.subtitle{margin-top:7rpx;color:#75867f;font-size:23rpx}.loading{margin:30rpx;color:#789087;text-align:center}.form-section,.status-panel{margin:24rpx;padding:30rpx;border-radius:26rpx;background:#fbfefc;box-shadow:0 10rpx 28rpx rgba(36,104,84,.06)}.section-title{display:block;margin:2rpx 0 20rpx;font-size:29rpx;font-weight:900}.role-title{margin-top:30rpx}.form-section input{height:82rpx;margin-bottom:16rpx;padding:0 20rpx;border:1rpx solid #e5eeea;border-radius:15rpx;background:#f2f7f5;box-sizing:border-box}.region-line{display:flex;gap:12rpx}.region-line input{flex:1;min-width:0}.form-section textarea{width:100%;height:180rpx;padding:20rpx;border:1rpx solid #e5eeea;border-radius:15rpx;background:#f2f7f5;box-sizing:border-box}.agreement{display:flex;align-items:flex-start;gap:10rpx;margin:22rpx 4rpx;color:#73827c;font-size:22rpx;line-height:1.5}.dot{width:30rpx;height:30rpx;border-radius:50%;background:#35cda4;color:#f7fffc;text-align:center;line-height:30rpx;font-size:19rpx}.submit{height:84rpx;border-radius:44rpx;background:#35cda4;color:#f7fffc;display:flex;align-items:center;justify-content:center;font-size:30rpx;font-weight:900}.disabled{opacity:.55}.reject-note{display:flex;flex-direction:column;gap:8rpx;margin-bottom:26rpx;padding:20rpx;border-radius:16rpx;background:#fff3f0;color:#a8665c;font-size:23rpx}.reject-title{font-size:27rpx;font-weight:900}.status-head{display:flex;align-items:center;gap:20rpx;padding-bottom:28rpx}.status-symbol{width:78rpx;height:78rpx;border-radius:50%;background:#dff8ef;color:#20b98e;display:flex;align-items:center;justify-content:center;font-size:40rpx;font-weight:900}.status-head>view{display:flex;flex-direction:column}.status-title{font-size:33rpx;font-weight:900}.status-desc{margin-top:8rpx;color:#73847d;font-size:23rpx}.status-row{height:74rpx;border-top:1rpx solid #e9f0ed;display:flex;align-items:center;justify-content:space-between;color:#718079;font-size:24rpx}.status-row b{color:#25342f;font-size:25rpx}
</style>
