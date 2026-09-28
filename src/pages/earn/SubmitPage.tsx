import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check, Home, ReceiptText, ScanLine, SearchX } from 'lucide-react'
import { Screen } from '@/shared/ui/Screen'
import { Button } from '@/shared/ui/Button'
import { useI18n } from '@/app/providers/I18nProvider'
import { useBackButton } from '@/shared/lib/useBackButton'
import { tgHaptic } from '@/shared/lib/telegram'
import { apiSubmitReceipt } from '@/shared/api/client'
import { ApiError } from '@/shared/api/errors'
import { useStartScan } from '@/features/scan-receipt/useStartScan'
import { getErrorCopy } from '@/features/scan-receipt/errorCopy'
import { cn } from '@/shared/lib/cn'
import type { ReceiptErrorCode } from '@/entities/receipt'
import type { DictKey } from '@/shared/config/dictionaries'

const STEPS: DictKey[] = ['scan.step_read', 'scan.step_soliq', 'scan.step_bonus']
const STEP_MS = 900

type Failure = { code: ReceiptErrorCode; meta?: Record<string, string | number> }

/**
 * Full-screen "checking the receipt" step between a scanned QR and its result.
 * Both entry points land here — Telegram's native scan popup and the in-app camera —
 * so the client always sees progress, and a failure is a full page with a clear way
 * forward (scan again / go home) instead of a dismissible sheet over a blank screen.
 */
export function SubmitPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, locale } = useI18n()
  const startScan = useStartScan()
  const qrText = (location.state as { qrText?: string } | null)?.qrText

  const [step, setStep] = useState(0)
  const [failure, setFailure] = useState<Failure | null>(null)
  // Refs survive StrictMode's double effect run, so the receipt is submitted once and
  // a retry of the same request reuses the idempotency key.
  const startedRef = useRef(false)
  const keyRef = useRef((crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`).replace(/-/g, '').slice(0, 20))

  const goHome = () => navigate('/', { replace: true })
  useBackButton(goHome)

  useEffect(() => {
    if (!qrText) {
      goHome()
      return
    }
    if (startedRef.current) return
    startedRef.current = true

    const timer = window.setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), STEP_MS)
    void (async () => {
      try {
        const result = await apiSubmitReceipt({ source: { qrText }, idempotencyKey: keyRef.current })
        tgHaptic('success')
        navigate(`/earn/result/${result.id}`, { state: { result }, replace: true })
      } catch (err) {
        tgHaptic('error')
        setFailure({
          code: err instanceof ApiError ? (err.code as ReceiptErrorCode) : 'INTERNAL_ERROR',
          meta: err instanceof ApiError ? err.meta : undefined,
        })
      } finally {
        window.clearInterval(timer)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (failure) {
    const copy = getErrorCopy(failure.code, locale, failure.meta)
    return (
      <Screen className="flex min-h-[calc(100dvh-var(--app-inset-top))] flex-col pb-[max(24px,var(--app-inset-bottom))]">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-[var(--color-danger-soft)]" />
            <span className="absolute inset-5 rounded-full bg-[var(--color-danger-soft)] opacity-80" />
            <SearchX size={60} strokeWidth={1.7} className="relative text-[var(--color-danger)]" />
          </div>
          <h1 className="mb-2.5 text-[26px] font-bold leading-tight text-[var(--color-ink)]">{copy.title}</h1>
          <p className="max-w-[300px] text-[15.5px] leading-relaxed text-[var(--color-ink-secondary)]">{copy.message}</p>
        </div>
        <div className="space-y-2.5">
          <Button onClick={startScan} className="flex items-center justify-center gap-2">
            <ScanLine size={20} />
            {t('scan.rescan')}
          </Button>
          <Button variant="ghost" onClick={goHome} className="flex items-center justify-center gap-2">
            <Home size={19} />
            {t('scan.go_home')}
          </Button>
        </div>
      </Screen>
    )
  }

  return (
    <Screen className="flex min-h-[calc(100dvh-var(--app-inset-top))] flex-col items-center justify-center text-center">
      <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-primary-soft)] [animation-duration:1.6s]" />
        <span className="absolute inset-2 animate-spin rounded-full border-[3px] border-[var(--color-primary-soft)] border-t-[var(--color-primary)] [animation-duration:1.1s]" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)]" style={{ boxShadow: 'var(--shadow-card)' }}>
          <ReceiptText size={30} className="text-[var(--color-primary)]" />
        </span>
      </div>
      <h1 className="mb-6 text-[22px] font-bold text-[var(--color-ink)]">{t('scan.checking_title')}</h1>

      <ul className="w-full max-w-[280px] space-y-3 text-left">
        {STEPS.map((key, i) => {
          const done = i < step
          const active = i === step
          return (
            <li key={key} className={cn('flex items-center gap-3 transition-opacity duration-300', i > step && 'opacity-40')}>
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  done ? 'bg-[var(--color-success)] text-white' : 'bg-[var(--color-primary-soft)]',
                )}
              >
                {done ? (
                  <Check size={14} strokeWidth={3} />
                ) : active ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                )}
              </span>
              <span className={cn('text-[14.5px]', active ? 'font-medium text-[var(--color-ink)]' : 'text-[var(--color-ink-secondary)]')}>
                {t(key)}
              </span>
            </li>
          )
        })}
      </ul>
    </Screen>
  )
}
