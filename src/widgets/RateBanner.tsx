import { Sparkles } from 'lucide-react'
import { useRate } from '@/shared/api/hooks'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useI18n } from '@/app/providers/I18nProvider'

/** Fixed-width card for the horizontal "Aksiyalar va narxlar" row on the home screen. */
export function RateBanner() {
  const { data, isLoading } = useRate()
  const { t, locale } = useI18n()

  if (isLoading) return <Skeleton className="h-[132px] w-[200px] shrink-0 rounded-[20px]" />
  if (!data) return null

  if (data.promo) {
    const endsAt = new Date(data.promo.endsAt)
    const time = endsAt.toLocaleTimeString(locale === 'ru' ? 'ru-RU' : 'uz-UZ', { hour: '2-digit', minute: '2-digit' })
    return (
      <div
        className="grad-flow w-[220px] shrink-0 rounded-[20px] p-4 text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
      >
        <Sparkles size={22} />
        <p className="tnum mt-3 text-[20px] font-extrabold leading-none">{data.promo.percent}% bonus</p>
        <p className="mt-1.5 text-[12.5px] text-white/85">
          {data.promo.label} · {t('home.promo_until', { time })}
        </p>
      </div>
    )
  }

  return (
    <div className="w-[170px] shrink-0 rounded-[20px] bg-[var(--color-surface)] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <Sparkles size={22} className="text-[var(--color-primary)]" />
      <p className="mt-3 text-[12px] text-[var(--color-ink-tertiary)]">{t('home.rate_card')}</p>
      <p className="tnum text-[20px] font-extrabold leading-none">{data.basePercent}%</p>
    </div>
  )
}
