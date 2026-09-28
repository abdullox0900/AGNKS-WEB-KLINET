import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanLine } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { useI18n } from '@/app/providers/I18nProvider'
import { CameraQrScanner } from '@/features/scan-receipt/CameraQrScanner'
import { tgShowScanQrPopup, tgCloseScanQrPopup, isInTelegram } from '@/shared/lib/telegram'

/** Camera scanner (plain browser) / Telegram popup launcher; the QR is then checked on /earn/submit. */
export function ScanPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const handedOffRef = useRef(false)

  function handleQr(text: string) {
    if (handedOffRef.current) return
    handedOffRef.current = true
    navigate('/earn/submit', { state: { qrText: text }, replace: true })
  }

  useEffect(() => {
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
              <ScanLine size={34} className="text-[var(--color-primary)]" />
            </div>
            <p className="max-w-[240px] text-center text-[14px] text-[var(--color-ink-secondary)]">{t('common.loading')}</p>
          </div>
        ) : (
          <CameraQrScanner onDetect={handleQr} paused={false} />
        )}
      </div>
    </Screen>
  )
}
