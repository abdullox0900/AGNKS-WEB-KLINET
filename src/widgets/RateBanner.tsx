import { Sparkles } from 'lucide-react'
import { usePromotions, useRate } from '@/shared/api/hooks'
import { formatDate, formatTime } from '@/shared/lib/format'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useI18n } from '@/app/providers/I18nProvider'

/**
 * The "Aksiyalar va narxlar" row on the home screen: one gradient card per promotion running now (with the stations it
 * applies to — an offer can be limited to some stations), then the everyday rate.
 */
export function RateBanner() {
  const { data, isLoading } = useRate()
  const { data: promos } = usePromotions()
  const { t, locale } = useI18n()

  if (isLoading) return <Skeleton className="h-[132px] w-[200px] shrink-0 rounded-[20px]" />
  if (!data) return null

  const running = (promos ?? []).filter((p) => p.active).sort((a, b) => b.percent - a.percent)

  return (
    <>
      {running.map((promo) => {
        const until = new Date(promo.endsAt)
        return (
          <div
            key={promo.id}
            className="grad-flow w-[230px] shrink-0 rounded-[20px] p-4 text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
          >
            <Sparkles size={22} />
            <p className="tnum mt-3 text-[20px] font-extrabold leading-none">{promo.percent}% bonus</p>
            <p className="mt-1.5 line-clamp-1 text-[12.5px] font-semibold text-white">{promo.name}</p>
            <p className="mt-0.5 line-clamp-2 text-[12px] text-white/85">{promo.stations.length ? promo.stations.join(', ') : t('promo.all_stations')}</p>
            <p className="mt-0.5 text-[12px] text-white/85">{t('promo.until', { date: `${formatDate(until, locale)}, ${formatTime(until)}` })}</p>
          </div>
        )
      })}
      <div className="w-[170px] shrink-0 rounded-[20px] bg-[var(--color-surface)] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <Sparkles size={22} className="text-[var(--color-primary)]" />
        <p className="mt-3 text-[12px] text-[var(--color-ink-tertiary)]">{t('home.rate_card')}</p>
        <p className="tnum text-[20px] font-extrabold leading-none">{data.basePercent}%</p>
      </div>
    </>
  )
}
