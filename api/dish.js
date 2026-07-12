import { get, post, put, del } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 菜品列表，可按分类过滤，分页，仅上架
export function apiDishList(params) {
	return get(P + '/dish/list', params)
}

// 菜品管理列表，店主，含下架
export function apiDishManageList(params) {
	return get(P + '/dish/manage/list', params)
}

// 菜品详情，含规格和步骤
export function apiDishDetail(id) {
	return get(P + '/dish/detail/' + id)
}

// 新增菜品
export function apiDishAdd(data) {
	return post(P + '/dish', data)
}

// 修改菜品
export function apiDishUpdate(data) {
	return put(P + '/dish', data)
}

// 上下架
export function apiDishChangeStatus(id, status) {
	return put(P + '/dish/status', { id, status })
}

// 删除菜品
export function apiDishDelete(id) {
	return del(P + '/dish/' + id)
}
