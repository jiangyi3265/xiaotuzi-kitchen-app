import { get, post, put, del } from '@/utils/request.js'
import config from '@/config/index.js'

const P = config.apiPrefix

// 菜品分类树
export function apiCategoryTree() {
	return get(P + '/category/tree')
}

// 分类管理列表，店主，含停用
export function apiCategoryManageList() {
	return get(P + '/category/manage/list')
}

// 新增分类
export function apiCategoryAdd(data) {
	return post(P + '/category', data)
}

// 修改分类
export function apiCategoryUpdate(data) {
	return put(P + '/category', data)
}

// 删除分类
export function apiCategoryDelete(id) {
	return del(P + '/category/' + id)
}
