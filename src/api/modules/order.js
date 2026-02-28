import request from '../request'

/** 订单列表（当前用户） */
export function getOrderList(params) {
  return request({ url: '/orders', method: 'get', params })
}

/** 按订单号查询 */
export function getOrderByNo(orderNo) {
  return request({ url: `/orders/no/${orderNo}`, method: 'get' })
}

/** 更新订单状态 */
export function updateOrderStatus(id, status) {
  return request({ url: `/orders/${id}/status`, method: 'put', data: { status } })
}
