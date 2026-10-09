import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'
import { useMe } from '@/shared/api/hooks'
import { formatMoney } from '@/shared/lib/format'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useI18n } from '@/app/providers/I18nProvider'

const ARC_LEN = Math.PI * 100

/** Semicircle "Bonus bosimi" gauge — fills toward the minimum spend amount, needle
 * and arc sweep in from empty once the balance is known. */
export function BonusGauge() {
  const { data, error, isLoading, mutate } = useMe()
  const { t, locale } = useI18n()

  const ratio = data && data.spendMinAmount > 0 ? Math.min(1, data.balance / data.spendMinAmount) : 0
  const ready = !!data && data.balance >= data.spendMinAmount
  const [displayRatio, setDisplayRatio] = useState(0)

  useEffect(() => {
    if (!data) return
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setDisplayRatio(ratio))
      return () => cancelAnimationFrame(raf2)
    })
    return () => cancelAnimationFrame(raf1)
  }, [data, ratio])

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-secondary)]">
          <Flame size={16} className="text-[var(--color-primary)]" /> {t('home.gauge_title')}
        </span>
        {data && (
          <span className="rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-[11.5px] font-bold text-[var(--color-primary)]">
            {Math.round(displayRatio * 100)}%
          </span>
        )}
      </div>

      <svg viewBox="0 0 240 140" className="mx-auto mt-1 w-full max-w-[280px]">
        <defs>
          <linearGradient id="bonusGaugeGradient" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
        {Array.from({ length: 11 }).map((_, i) => {
          const a = Math.PI * (1 - i / 10)
          return (
            <line
              key={i}
              x1={120 + 112 * Math.cos(a)}
              y1={120 - 112 * Math.sin(a)}
              x2={120 + (i % 5 === 0 ? 102 : 106) * Math.cos(a)}
              y2={120 - (i % 5 === 0 ? 102 : 106) * Math.sin(a)}
              stroke="var(--color-ink-tertiary)"
              strokeWidth={i % 5 === 0 ? 2 : 1}
              strokeLinecap="round"
            />
          )
        })}
        <path d="M20 120 A100 100 0 0 1 220 120" fill="none" stroke="var(--color-track)" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M20 120 A100 100 0 0 1 220 120"
          fill="none"
          className="gauge-arc"
          stroke="url(#bonusGaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${ARC_LEN * displayRatio} ${ARC_LEN}`}
          style={{ transition: 'stroke-dasharray 900ms cubic-bezier(.22,1,.36,1)' }}
        />
        <g style={{ transform: `rotate(${180 * displayRatio - 180}deg)`, transformOrigin: '120px 120px', transition: 'transform 900ms cubic-bezier(.22,1,.36,1)' }}>
          <line x1="120" y1="120" x2="198" y2="120" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="120" cy="120" r="7" fill="var(--color-ink)" />
        <circle cx="120" cy="120" r="3" fill="var(--color-surface)" />
      </svg>

      {isLoading ? (
        <Skeleton className="mx-auto -mt-3 h-10 w-40" />
      ) : error || !data ? (
        <div className="-mt-3 flex items-center justify-center gap-3">
          <span className="tnum text-[34px] font-bold leading-none text-[var(--color-ink)]">—</span>
          <button onClick={() => mutate()} className="text-[14px] font-semibold text-[var(--color-primary)] active:opacity-70">
            {t('home.balance_error')}
          </button>
        </div>
      ) : (
        <>
          <p className="tnum -mt-3 text-center text-[34px] font-bold leading-none text-[var(--color-ink)]">
            {formatMoney(data.balance, locale)}
          </p>
          <p className="mt-1.5 text-center text-[12.5px] text-[var(--color-ink-tertiary)]">
            {ready ? t('home.gauge_ready') : t('home.gauge_left', { left: formatMoney(data.spendMinAmount - data.balance, locale) })}
          </p>
        </>
      )}
      {data && data.pending > 0 && (
        <p className="tnum mt-1 text-center text-[13px] font-medium text-[var(--color-ink-tertiary)]">
          +{formatMoney(data.pending, locale)} {t('home.pending')}
        </p>
      )}
    </div>
  )
}
