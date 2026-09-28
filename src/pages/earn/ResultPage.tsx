import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock } from 'lucide-react'
import { useSWRConfig } from 'swr'
import { Screen } from '@/shared/ui/Screen'
import { Button } from '@/shared/ui/Button'
import { useI18n } from '@/app/providers/I18nProvider'
import { formatMoney } from '@/shared/lib/format'
import { tgHaptic } from '@/shared/lib/telegram'
import type { SubmitReceiptResult } from '@/entities/receipt'

export function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, locale } = useI18n()
  const { mutate } = useSWRConfig()

  const result = (location.state as { result?: SubmitReceiptResult } | null)?.result
  const startBalance = result?.balanceAfter !== undefined ? result.balanceAfter - result.bonus : 0
  const [displayBalance, setDisplayBalance] = useState(startBalance)
  const ranRef = useRef(false)

  useEffect(() => {
    if (!result) {
      navigate('/', { replace: true })
      return
    }
    mutate('/me')
    mutate('/me/history?limit=3')

    if (result.status === 'applied' && result.balanceAfter !== undefined && !ranRef.current) {
      ranRef.current = true
      tgHaptic('success')
      const start = result.balanceAfter - result.bonus
      const end = result.balanceAfter
      const duration = 600
      const startTime = performance.now()
      function tick(now: number) {
        const progress = Math.min(1, (now - startTime) / duration)
        setDisplayBalance(Math.round(start + (end - start) * progress))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!result) return null

  const isApplied = result.status === 'applied'

  return (
    <Screen className="flex min-h-screen flex-col items-center justify-center text-center">
      <div
        className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
          isApplied ? 'bg-[var(--color-success-soft)]' : 'bg-[var(--color-warning-soft)]'
        }`}
      >
        {isApplied ? (
          <CheckCircle2 size={38} className="text-[var(--color-success)]" />
        ) : (
          <Clock size={34} className="text-[var(--color-amber)]" />
        )}
      </div>

      {isApplied ? (
        <>
          <p className="tnum text-[32px] font-bold text-[var(--color-money)]">+{formatMoney(result.bonus, locale)}</p>
          <p className="tnum mt-6 text-[15px] text-[var(--color-ink-secondary)]">
            {formatMoney(displayBalance, locale)}
          </p>
        </>
      ) : (
        <>
          <h1 className="mb-2 text-[19px] font-semibold text-[var(--color-ink)]">{t('result.pending.title')}</h1>
          <p className="max-w-[280px] text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">
            {t('result.pending.desc', { sum: formatMoney(result.bonus, locale) })}
          </p>
        </>
      )}

      <Button className="mt-10" onClick={() => navigate('/', { replace: true })}>
        {t('result.applied.cta')}
      </Button>
    </Screen>
  )
}
