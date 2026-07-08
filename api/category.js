// 菜品分类接口
import { get, post, put, del } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 分类树（三级，公开）
export function apiCategoryTree() {
	return get(P + '/category/tree')
}

// 分类管理列表（店主，含停用）
export function apiCategoryManageList() {
	return get(P + '/category/manage/list')
}

// 新增分类（店主）
export function apiCategoryAdd(data) {
	return post(P + '/category', data)
}

// 修改分类（店主）
export function apiCategoryUpdate(data) {
	return put(P + '/category', data)
}

// 删除分类（店主）
export function apiCategoryDelete(id) {
	return del(P + '/category/' + id)
}
