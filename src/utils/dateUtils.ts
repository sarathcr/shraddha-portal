export function formatDateForAPI(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${dd}-${mm}-${yyyy}`
}
export function parseDDMMYYYY(dateStr: string | undefined): Date | null {
  if (!dateStr) return null

  const [dayStr, monthStr, yearStr] = dateStr.split('-')
  if (!dayStr || !monthStr || !yearStr) return null

  const day = Number(dayStr)
  const month = Number(monthStr) - 1
  const year = Number(yearStr)

  const date = new Date(year, month, day)
  return isNaN(date.getTime()) ? null : date
}
