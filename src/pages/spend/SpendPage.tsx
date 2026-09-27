import { useEffect, useRef } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { SpendQr } from '@/widgets/SpendQr'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Button } from '@/shared/ui/Button'
import { useI18n } from '@/app/providers/I18nProvider'
import { useSpendToken } from '@/features/spend-token/useSpendToken'
import { useOnline } from '@/shared/lib/useOnline'
import { formatMoney, formatSignedMoney } from '@/shared/lib/format'
import { apiGetMe } from '@/shared/api/client'
import { useToast } from '@/shared/ui/Toast'

export function SpendPage() {
  const { t, locale } = useI18n()
  const online = useOnline()
  const token = useSpendToken()
  const { show } = useToast()
  const { mutate: globalMutate } = useSWRConfig()
  const lastBalanceRef = useRef<number | null>(null)

  const { data: me } = useSWR(online ? '/me/spend-watch' : null, apiGetMe, {
    refreshInterval: 3000,
    revalidateOnFocus: false,
  })

  useEffect(() => {
    if (!me) return
    if (lastBalanceRef.current === null) {
      lastBalanceRef.current = me.balance
      return
    }
    if (me.balance < lastBalanceRef.current) {
      const deducted = lastBalanceRef.current - me.balance
      show(t('spend.deducted', { sum: formatSignedMoney(-deducted, locale), balance: formatMoney(me.balance, locale) }))
      globalMutate('/me')
      globalMutate('/me/history?limit=3')
    }
    lastBalanceRef.current = me.balance
  }, [me, show, t, locale, globalMutate])

  return (
    <Screen>
      <PageHeader title={t('spend.title')} back={false} />
      <div className="flex flex-col items-center pt-6 text-center">
        {!online ? (
          <div className="flex h-[240px] w-[240px] items-center justify-center rounded-3xl bg-[var(--color-surface)] px-8">
            <p className="text-[14px] text-[var(--color-ink-secondary)]">{t('spend.offline')}</p>
          </div>
        ) : token.error ? (
          <div className="flex h-[240px] w-[240px] flex-col items-center justify-center gap-3 rounded-3xl bg-[var(--color-surface)] px-8">
            <p className="text-[14px] text-[var(--color-ink-secondary)]">{t('spend.refresh_error')}</p>
            <button onClick={token.retry} className="text-[14px] font-semibold text-[var(--color-primary)]">
              {t('spend.retry')}
            </button>
          </div>
        ) : token.loading && !token.qrText ? (
          <Skeleton className="h-[240px] w-[240px] rounded-3xl" />
        ) : (
          <SpendQr value={token.qrText ?? ''} dim={token.secondsLeft <= 3} />
        )}

        {token.qrText && online && !token.error && (
          <>
            <p className="tnum mt-5 text-[32px] font-bold tracking-[0.1em] text-[var(--color-ink)]">
              {token.code?.slice(0, 3)} {token.code?.slice(3)}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <circle cx="9" cy="9" r="7.5" stroke="var(--color-border)" strokeWidth="2" fill="none" />
                <circle
                  cx="9"
                  cy="9"
                  r="7.5"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 7.5}
                  strokeDashoffset={2 * Math.PI * 7.5 * (1 - token.secondsLeft / 60)}
                  strokeLinecap="round"
                  transform="rotate(-90 9 9)"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span className="tnum text-[13px] font-medium text-[var(--color-ink-tertiary)]">{token.secondsLeft}s</span>
            </div>
          </>
        )}

        {token.stopped && (
          <div className="mt-5 flex flex-col items-center gap-2">
            <p className="text-[13px] font-medium text-[var(--color-ink-secondary)]">{t('spend.stopped')}</p>
            <Button variant="secondary" onClick={token.retry} fullWidth={false} className="px-8">
              {t('spend.refresh')}
            </Button>
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-[var(--color-surface)] px-6 py-4">
          <p className="text-[13px] font-medium text-[var(--color-ink-secondary)]">{t('spend.balance')}</p>
          <p className="tnum mt-1 text-[22px] font-bold text-[var(--color-amber)]">
            {me ? formatMoney(me.balance, locale) : '—'}
          </p>
        </div>
      </div>
    </Screen>
  )
}
