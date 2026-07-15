import { get, post } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 提交订单
// data: { serviceType, chefId?, receiverName?, receiverPhone?, receiverAddress?, remark?, shareFlag?, items:[{dishId, quantity, specJson?}] }
export function apiSubmitOrder(data) {
	return post(P + '/order/submit', data)
}

// 我的订单列表（分页）
export function apiMyOrders(params) {
	return get(P + '/order/my', params)
}

// 订单详情
export function apiOrderDetail(id) {
	return get(P + '/order/detail/' + id)
}

// 保存订单采购清单中的食材规格和采购进度
export function apiSaveGroceryList(id, items) {
	return post(P + '/order/grocery/' + id, { items })
}

// 申请退款
export function apiOrderRefund(id, data = {}) {
	return post(P + '/order/refund/' + id, data)
}

// 用户确认完成订单
export function apiOrderComplete(id) {
	return post(P + '/order/complete/' + id)
}
