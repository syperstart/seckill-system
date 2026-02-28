/**
 * Excel/CSV 导出工具（模拟企业级导出）
 */
export function exportToCSV(data, columns, filename = 'export.csv') {
  if (!data || !data.length) return
  const headers = columns.map(c => (typeof c === 'string' ? c : c.label)).join(',')
  const rows = data.map(row =>
    columns.map(c => {
      const key = typeof c === 'string' ? c : c.key
      let val = row[key]
      if (val == null) return ''
      val = String(val).replace(/"/g, '""')
      return `"${val}"`
    }).join(',')
  )
  const csv = '\uFEFF' + [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
