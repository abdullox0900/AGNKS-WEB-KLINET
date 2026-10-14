const UZ_MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek']

/** "13 okt, 18:53" / "13 окт., 18:53". (The browser's own Uzbek month names come out as "M10", so Uzbek is spelled out here.) */
export function formatWhen(iso: string, locale: 'uz' | 'ru'): string {
  const d = new Date(iso)
  if (locale === 'ru') return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]}, ${formatClock(iso, locale)}`
}

export function formatClock(iso: string, locale: 'uz' | 'ru'): string {
  return new Date(iso).toLocaleTimeString(locale === 'ru' ? 'ru-RU' : 'en-GB', { hour: '2-digit', minute: '2-digit' })
}
