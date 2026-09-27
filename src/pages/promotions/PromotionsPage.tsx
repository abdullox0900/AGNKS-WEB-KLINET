import { Sparkles, MapPin, CalendarClock, BellRing } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { Toggle } from '@/shared/ui/Toggle'
import { useI18n } from '@/app/providers/I18nProvider'
import { useAppStore } from '@/shared/config/appStore'
import { usePromotions, useRate } from '@/shared/api/hooks'
import { apiSetMarketingOptIn, type Promotion } from '@/shared/api/client'
import { formatDate, formatTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'

function PromoCard({ promo }: { promo: Promotion }) {
  const { t, locale } = useI18n()
  const date = (iso: string) => {
    const d = new Date(iso)
    return `${formatDate(d, locale)}, ${formatTime(d)}`
  }

  return (
    <div className="flex gap-4 rounded-2xl bg-[var(--color-surface)] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div
        className={cn(
          'flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl',
          promo.active ? 'bg-[var(--color-amber-soft)] text-[var(--color-amber)]' : 'bg-[var(--color-bg)] text-[var(--color-ink-secondary)]',
        )}
      >
        <span className="tnum text-[20px] font-bold leading-none">{promo.percent}%</span>
        <span className="mt-1 text-[11px] font-medium leading-none">{t('promo.bonus')}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-[var(--color-ink)]">{promo.name}</p>
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[var(--color-ink-secondary)]">
          <CalendarClock size={14} className="shrink-0 text-[var(--color-ink-tertiary)]" />
          {promo.active ? t('promo.until', { date: date(promo.endsAt) }) : t('promo.from', { date: date(promo.startsAt) })}
        </p>
        <p className="mt-1 flex items-start gap-1.5 text-[13px] text-[var(--color-ink-secondary)]">
          <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--color-ink-tertiary)]" />
          <span>{promo.stations.length ? promo.stations.join(', ') : t('promo.all_stations')}</span>
        </p>
      </div>
    </div>
  )
}

export function PromotionsPage() {
  const { t } = useI18n()
  const { data, isLoading, error, mutate } = usePromotions()
  const { data: rate } = useRate()
  const marketingOptIn = useAppStore((s) => s.marketingOptIn)
  const setMarketingOptIn = useAppStore((s) => s.setMarketingOptIn)

  async function handleNotifyChange(value: boolean) {
    setMarketingOptIn(value)
    try {
      await apiSetMarketingOptIn(value)
    } catch {
      setMarketingOptIn(!value)
    }
  }

  const active = data?.filter((p) => p.active) ?? []
  const upcoming = data?.filter((p) => !p.active) ?? []

  return (
    <Screen padded={false}>
      <PageHeader title={t('promo.title')} />
      <div className="space-y-6 px-4 pb-8">
        <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface)] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <BellRing size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium text-[var(--color-ink)]">{t('promo.notify')}</p>
            <p className="text-[12.5px] text-[var(--color-ink-tertiary)]">{t('promo.notify_hint')}</p>
          </div>
          <Toggle checked={marketingOptIn} onChange={handleNotifyChange} />
        </div>

        {isLoading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : error ? (
          <ErrorState message={t('common.error_generic')} onRetry={() => mutate()} />
        ) : !data?.length ? (
          <EmptyState
            icon={<Sparkles size={28} />}
            title={t('promo.empty')}
            action={<p className="max-w-[260px] text-[13px] text-[var(--color-ink-tertiary)]">{t('promo.empty_hint')}</p>}
          />
        ) : (
          <>
            {active.length > 0 && (
              <section>
                <h2 className="mb-2.5 text-[15px] font-semibold text-[var(--color-ink)]">{t('promo.active')}</h2>
                <div className="space-y-2.5">
                  {active.map((p) => (
                    <PromoCard key={p.id} promo={p} />
                  ))}
                </div>
              </section>
            )}
            {upcoming.length > 0 && (
              <section>
                <h2 className="mb-2.5 text-[15px] font-semibold text-[var(--color-ink)]">{t('promo.upcoming')}</h2>
                <div className="space-y-2.5">
                  {upcoming.map((p) => (
                    <PromoCard key={p.id} promo={p} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {rate && (
          <p className="text-center text-[12.5px] text-[var(--color-ink-tertiary)]">{t('promo.base', { rate: rate.basePercent })}</p>
        )}
      </div>
    </Screen>
  )
}
