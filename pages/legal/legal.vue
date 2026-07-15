<template>
	<view class="legal-page">
		<view class="legal-tabs">
			<view :class="['legal-tab', { active: type === 'service' }]" @tap="type = 'service'">用户服务协议</view>
			<view :class="['legal-tab', { active: type === 'privacy' }]" @tap="type = 'privacy'">隐私政策</view>
		</view>

		<view v-if="type === 'service'" class="legal-content">
			<text class="legal-title">用户服务协议</text>
			<text class="legal-date">更新日期：2026年7月14日</text>
			<text class="legal-heading">一、服务说明</text>
			<text class="legal-paragraph">本小程序为用户提供菜谱管理、共同点餐、采购清单、订单管理、附近菜市场信息、同城配送与厨师代炒申请等服务。具体可用功能和服务区域以页面实际展示及后台审核结果为准。</text>
			<text class="legal-heading">二、账号与使用规则</text>
			<text class="legal-paragraph">用户通过微信登录建立小程序账号，应妥善使用账号，不得发布违法违规、侵害他人权益、虚假、骚扰或广告垃圾信息，不得利用本小程序实施欺诈或其他违法行为。</text>
			<text class="legal-heading">三、点餐与履约</text>
			<text class="legal-paragraph">菜品价格、规格、服务区域、配送人员、厨师及商家信息以提交订单时页面展示为准。多人聚餐、情侣空间中的共同选菜由参与成员共同确认，提交订单前请核对菜品数量、收货信息和服务方式。</text>
			<text class="legal-heading">四、用户内容</text>
			<text class="legal-paragraph">用户上传的菜品、图片、评论和分享内容可能先进入审核。运营者有权对违法违规或不适宜展示的内容进行拦截、驳回或删除。</text>
			<text class="legal-heading">五、退出与账号处理</text>
			<text class="legal-paragraph">用户可在“我的”页面退出登录。如需注销账号和删除依法可删除的个人信息，可通过“我的－联系客服”或“反馈与建议”提交申请，运营者核验身份后处理；法律法规要求保留的交易记录将在法定期限内保存。</text>
			<text class="legal-heading">六、联系我们</text>
			<text class="legal-paragraph">如对本协议或服务有疑问，可通过小程序“我的－联系客服”或“反馈与建议”联系运营者。运营主体以微信公众平台公示信息为准。</text>
		</view>

		<view v-else class="legal-content">
			<text class="legal-title">隐私政策</text>
			<text class="legal-date">更新日期：2026年7月14日</text>
			<text class="legal-heading">一、我们处理的信息</text>
			<text class="legal-paragraph">为完成登录和识别订单，我们通过微信登录凭证获取用于识别账号的 OpenID；为完成点餐、配送、代炒、区域代理或人员申请，可能处理你主动填写的姓名、手机号码、收货地址、服务区域、申请说明和订单信息。</text>
			<text class="legal-paragraph">当你主动使用上传菜品、发布成品、反馈截图或扫码加入聚餐功能时，我们会在获得微信隐私授权后使用你选择的照片、相机或扫码能力。我们不会在未触发对应功能时调用这些能力。</text>
			<text class="legal-paragraph">情侣空间和多人聚餐会处理你主动创建或加入的房间、共同菜单、成员昵称、点餐数量、纪念日及投喂订单信息，以实现双方或多人协作。</text>
			<text class="legal-heading">二、使用目的</text>
			<text class="legal-paragraph">上述信息仅用于账号登录、展示和同步菜单、生成采购清单、创建及履行订单、审核服务申请、处理反馈、保障内容安全和维护系统正常运行。</text>
			<text class="legal-heading">三、信息共享与公开</text>
			<text class="legal-paragraph">除完成用户主动选择的配送、代炒、聚餐或投喂服务所必需，或法律法规另有要求外，我们不会出售个人信息。共同点餐成员仅能看到完成协作所必要的成员昵称、所选菜品和数量。</text>
			<text class="legal-heading">四、保存与保护</text>
			<text class="legal-paragraph">我们在实现服务所需的最短期限内保存相关信息，并采取访问控制、鉴权和后台权限管理等措施保护数据。订单等依法需要留存的信息按法定期限保存。</text>
			<text class="legal-heading">五、你的权利</text>
			<text class="legal-paragraph">你可停止使用相关功能、退出登录，或通过“我的－联系客服”“反馈与建议”申请查询、更正或删除个人信息及注销账号。你也可在微信的小程序设置中管理系统权限。</text>
			<text class="legal-heading">六、未成年人保护</text>
			<text class="legal-paragraph">未成年人应在监护人指导下使用本服务并提交个人信息。监护人如发现未成年人信息被不当处理，可通过客服或反馈入口联系我们。</text>
			<text class="legal-heading">七、联系我们</text>
			<text class="legal-paragraph">隐私问题可通过小程序“我的－联系客服”或“反馈与建议”联系运营者。运营主体以微信公众平台公示信息为准。</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return { type: 'service' }
		},
		onLoad(options = {}) {
			this.type = options.type === 'privacy' ? 'privacy' : 'service'
		}
	}
</script>

<style scoped>
	.legal-page { min-height: 100vh; box-sizing: border-box; padding: 28rpx 32rpx 64rpx; background: #f7faf8; color: #25352c; }
	.legal-tabs { display: flex; padding: 8rpx; border-radius: 18rpx; background: #eaf1ed; }
	.legal-tab { flex: 1; height: 72rpx; line-height: 72rpx; border-radius: 14rpx; text-align: center; font-size: 28rpx; color: #6f7b74; }
	.legal-tab.active { background: #fbfcfa; color: #157f5b; font-weight: 650; box-shadow: 0 6rpx 18rpx rgba(34, 80, 60, 0.08); }
	.legal-content { padding: 40rpx 8rpx 0; }
	.legal-title, .legal-date, .legal-heading, .legal-paragraph { display: block; }
	.legal-title { font-size: 42rpx; line-height: 1.25; font-weight: 700; }
	.legal-date { margin-top: 14rpx; font-size: 23rpx; color: #879189; }
	.legal-heading { margin-top: 38rpx; font-size: 30rpx; line-height: 1.4; font-weight: 650; }
	.legal-paragraph { margin-top: 14rpx; font-size: 27rpx; line-height: 1.85; color: #536159; text-align: justify; }
</style>

