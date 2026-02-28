/**
 * 工具函数
 */

/** 格式化价格 */
export function formatPrice(price) {
  if (price == null) return '0.00'
  return Number(price).toFixed(2)
}

/** 防抖 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
