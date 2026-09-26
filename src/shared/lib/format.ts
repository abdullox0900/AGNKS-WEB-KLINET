export function formatMoney(sum: number, locale: 'uz' | 'ru' = 'uz'): string {
  const abs = Math.round(Math.abs(sum))
  const grouped = abs.toLocaleString('ru-RU').replace(/,/g, ' ')
  const sign = sum < 0 ? '−' : ''
  const unit = locale === 'ru' ? 'сум' : "so'm"
  return `${sign}${grouped} ${unit}`
}

export function formatSignedMoney(sum: number, locale: 'uz' | 'ru' = 'uz'): string {
  const sign = sum > 0 ? '+' : sum < 0 ? '−' : ''
  const abs = Math.round(Math.abs(sum)).toLocaleString('ru-RU').replace(/,/g, ' ')
  const unit = locale === 'ru' ? 'сум' : "so'm"
  return `${sign}${abs} ${unit}`
}

const MONTHS_UZ = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek']
const MONTHS_RU = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

export function formatDate(date: Date, locale: 'uz' | 'ru' = 'uz'): string {
  const months = locale === 'ru' ? MONTHS_RU : MONTHS_UZ
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateGroup(date: Date, locale: 'uz' | 'ru' = 'uz'): string {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  if (sameDay(date, today)) return locale === 'ru' ? 'Сегодня' : 'Bugun'
  if (sameDay(date, yesterday)) return locale === 'ru' ? 'Вчера' : 'Kecha'
  return formatDate(date, locale)
}
