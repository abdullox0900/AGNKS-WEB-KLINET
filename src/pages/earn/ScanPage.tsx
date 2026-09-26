import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ScanLine } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { useI18n } from '@/app/providers/I18nProvider'
import { ReceiptErrorSheet } from '@/features/scan-receipt/ReceiptErrorSheet'
import { CameraQrScanner } from '@/features/scan-receipt/CameraQrScanner'
import { tgShowScanQrPopup, tgCloseScanQrPopup, tgHaptic, isInTelegram } from '@/shared/lib/telegram'
import { apiSubmitReceipt } from '@/shared/api/client'
import { ApiError } from '@/shared/api/errors'
import type { ReceiptErrorCode } from '@/entities/receipt'

export function ScanPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()
  const navState = location.state as { errorCode?: ReceiptErrorCode; errorMeta?: Record<string, string | number> } | null
  const [errorCode, setErrorCode] = useState<ReceiptErrorCode | null>(navState?.errorCode ?? null)
  const [errorMeta, setErrorMeta] = useState<Record<string, string | number> | undefined>(navState?.errorMeta)
  const [submitting, setSubmitting] = useState(false)
  const submittedRef = useRef(false)

  async function handleQr(text: string) {
    if (submittedRef.current) return
    submittedRef.current = true
    setSubmitting(true)
    try {
      const idempotencyKey = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`).replace(/-/g, '').slice(0, 20)
      const result = await apiSubmitReceipt({
        source: { qrText: text },
        idempotencyKey,
      })
      tgHaptic('success')
      navigate(`/earn/result/${result.id}`, { state: { result }, replace: true })
    } catch (err) {
      tgHaptic('error')
      setErrorCode(err instanceof ApiError ? err.code : 'INTERNAL_ERROR')
      setErrorMeta(err instanceof ApiError ? err.meta : undefined)
      submittedRef.current = false
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (errorCode) return
    const opened = tgShowScanQrPopup((text) => {
      tgCloseScanQrPopup()
      handleQr(text)
      return true
    })
    return () => {
      if (opened) tgCloseScanQrPopup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Screen padded={false}>
      <PageHeader title={t('home.scan')} />
      <div className="px-4 pb-8">
        {isInTelegram() ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-[var(--color-surface)] py-14">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
              {submitting ? (
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
              ) : (
                <ScanLine size={34} className="text-[var(--color-primary)]" />
              )}
            </div>
            <p className="max-w-[240px] text-center text-[14px] text-[var(--color-ink-secondary)]">{t('common.loading')}</p>
          </div>
        ) : (
          <CameraQrScanner onDetect={handleQr} paused={submitting} />
        )}
      </div>

      <ReceiptErrorSheet
        code={errorCode}
        meta={errorMeta}
        onClose={() => setErrorCode(null)}
        onRetry={() => setErrorCode(null)}
      />
    </Screen>
  )
}
