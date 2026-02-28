/**
 * 时间格式化工具
 */
export function formatDateTime(val) {
  if (!val) return '-'
  const s = String(val).replace('T', ' ').slice(0, 19)
  return s || '-'
}

export function formatDate(val) {
  if (!val) return '-'
  return String(val).slice(0, 10)
}

/**
 * 转成本地 datetime-local 输入格式
 */
export function toLocalDatetime(val) {
  if (!val) return ''
  const s = String(val).replace('T', ' ').slice(0, 19)
  return s.length >= 16 ? s.slice(0, 16) : s
}
