import request from '../request'

/** 商品列表分页 */
export function getProductList(params) {
  return request({ url: '/products', method: 'get', params })
}

/** 商品详情 */
export function getProduct(id) {
  return request({ url: `/products/${id}`, method: 'get' })
}

/** 商品新增 */
export function createProduct(data) {
  return request({ url: '/products', method: 'post', data })
}

/** 商品修改 */
export function updateProduct(id, data) {
  return request({ url: `/products/${id}`, method: 'put', data })
}

/** 商品删除 */
export function deleteProduct(id) {
  return request({ url: `/products/${id}`, method: 'delete' })
}
