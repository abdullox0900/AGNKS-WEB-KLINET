import { useMe } from '@/shared/api/hooks'
import { formatMoney } from '@/shared/lib/format'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useI18n } from '@/app/providers/I18nProvider'

export function BalanceBlock() {
  const { data, error, isLoading, mutate } = useMe()
  const { t, locale } = useI18n()

  return (
    <div>
      <p className="text-[13px] font-medium text-[var(--color-ink-secondary)]">{t('home.balance')}</p>
      {isLoading ? (
        <Skeleton className="mt-1 h-10 w-40" />
      ) : error || !data ? (
        <div className="mt-1 flex items-baseline gap-3">
          <span className="tnum text-[34px] font-bold leading-none text-[var(--color-ink)]">—</span>
          <button
            onClick={() => mutate()}
            className="text-[14px] font-semibold text-[var(--color-primary)] active:opacity-70"
          >
            {t('home.balance_error')}
          </button>
        </div>
      ) : (
        <p className="tnum text-[34px] font-bold leading-none text-[var(--color-amber)]">
          {formatMoney(data.balance, locale)}
        </p>
      )}
      {data && data.pending > 0 && (
        <p className="tnum mt-1.5 text-[13px] font-medium text-[var(--color-ink-tertiary)]">
          +{formatMoney(data.pending, locale)} {t('home.pending')}
        </p>
      )}
    </div>
  )
}
