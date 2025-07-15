export function formatDate(value: unknown, format: 'dd/mm/yy' | 'yyyy-mm-dd' = 'dd/mm/yy'): string {
  if (!value) return ''

  const date = new Date(value as string)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  switch (format) {
    case 'dd/mm/yy':
      return `${day}/${month}/${String(year).slice(-2)}`
    case 'yyyy-mm-dd':
      return `${year}-${month}-${day}`
    default:
      return `${day}/${month}/${year}`
  }
}
