import request from '../request'

/** 秒杀活动列表 */
export function getActivityList(params) {
  return request({ url: '/seckill/activity', method: 'get', params })
}

/** 秒杀活动详情 */
export function getActivity(id) {
  return request({ url: `/seckill/activity/${id}`, method: 'get' })
}

/** 秒杀活动新增 */
export function createActivity(data) {
  return request({ url: '/seckill/activity', method: 'post', data })
}

/** 秒杀活动修改 */
export function updateActivity(id, data) {
  return request({ url: `/seckill/activity/${id}`, method: 'put', data })
}

/** 秒杀活动删除 */
export function deleteActivity(id) {
  return request({ url: `/seckill/activity/${id}`, method: 'delete' })
}
