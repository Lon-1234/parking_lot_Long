export const formatMoney = (value: number) => `¥${value.toFixed(2)}`
export const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '--'
export const today = () => new Date().toISOString().slice(0, 10)
export const addMonths = (date: string, months: number) => {
  const result = new Date(`${date}T00:00:00`)
  result.setMonth(result.getMonth() + months)
  result.setDate(result.getDate() - 1)
  return result.toISOString().slice(0, 10)
}
