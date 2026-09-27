import { Sparkles } from 'lucide-react'
import { useRate } from '@/shared/api/hooks'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useI18n } from '@/app/providers/I18nProvider'

export function RateBanner() {
  const { data, isLoading } = useRate()
  const { t, locale } = useI18n()

  if (isLoading) return <Skeleton className="h-11 w-full rounded-2xl" />
  if (!data) return null

  if (data.promo) {
    const endsAt = new Date(data.promo.endsAt)
    const time = endsAt.toLocaleTimeString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', { hour: '2-digit', minute: '2-digit' })
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-amber-soft)] px-4 py-3">
        <Sparkles size={16} className="shrink-0 text-[var(--color-amber)]" />
        <p className="text-[13px] font-medium text-[var(--color-amber-strong)]">
          {data.promo.label} · {data.promo.percent}% · {t('home.promo_until', { time })}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] px-4 py-3">
      <p className="text-[13px] font-medium text-[var(--color-ink-secondary)]">
        {t('home.rate_default', { rate: data.basePercent })}
      </p>
    </div>
  )
}
