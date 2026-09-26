import { useNavigate } from 'react-router-dom'
import { ScanLine, Wallet, Settings } from 'lucide-react'
import { useMe } from '@/shared/api/hooks'
import { Screen } from '@/shared/ui/Screen'
import { Button } from '@/shared/ui/Button'
import { BalanceBlock } from '@/widgets/BalanceBlock'
import { RateBanner } from '@/widgets/RateBanner'
import { HistoryPreview } from '@/widgets/HistoryPreview'
import { OfflineBanner } from '@/shared/ui/OfflineBanner'
import { useI18n } from '@/app/providers/I18nProvider'
import { formatMoney } from '@/shared/lib/format'
import { tgShowScanQrPopup, tgCloseScanQrPopup, tgHaptic } from '@/shared/lib/telegram'
import { apiSubmitReceipt } from '@/shared/api/client'
import { ApiError } from '@/shared/api/errors'

export function HomePage() {
  const navigate = useNavigate()
  const { data: me } = useMe()
  const { t, locale } = useI18n()

  const spendDisabled = !me || me.balance < me.spendMinAmount

  function handleScan() {
    const opened = tgShowScanQrPopup((text) => {
      tgCloseScanQrPopup()
      void (async () => {
        try {
          const idempotencyKey = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`).replace(/-/g, '').slice(0, 20)
          const result = await apiSubmitReceipt({ source: { qrText: text }, idempotencyKey })
          tgHaptic('success')
          navigate(`/earn/result/${result.id}`, { state: { result } })
        } catch (err) {
          tgHaptic('error')
          const code = err instanceof ApiError ? err.code : 'INTERNAL_ERROR'
          const meta = err instanceof ApiError ? err.meta : undefined
          navigate('/earn/scan', { state: { errorCode: code, errorMeta: meta } })
        }
      })()
      return true
    })
    if (!opened) navigate('/earn/scan')
  }

  return (
    <Screen>
      <OfflineBanner />
      <div className="flex items-center justify-between pt-4">
        <p className="text-[15px] text-[var(--color-ink-secondary)]">
          {t('home.hello')}{me?.firstName ? `, ${me.firstName}` : ''}
        </p>
        <button
          onClick={() => navigate('/settings')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)] active:bg-[var(--color-border)]"
          aria-label={t('settings.title')}
        >
          <Settings size={18} className="text-[var(--color-ink-secondary)]" />
        </button>
      </div>

      <div className="mt-4 rounded-3xl bg-[var(--color-surface)] p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <BalanceBlock />

        <div className="mt-5 space-y-2.5">
          <Button onClick={handleScan} className="flex items-center justify-center gap-2">
            <ScanLine size={20} />
            {t('home.scan')}
          </Button>
          <Button
            variant="secondary"
            disabled={spendDisabled}
            onClick={() => navigate('/spend')}
            className="flex items-center justify-center gap-2"
          >
            <Wallet size={20} />
            {t('home.spend')}
          </Button>
          {spendDisabled && me && (
            <p className="text-center text-[12.5px] text-[var(--color-ink-tertiary)]">
              {t('home.spend_min', { min: formatMoney(me.spendMinAmount, locale) })}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <RateBanner />
      </div>

      <div className="mt-6">
        <HistoryPreview />
      </div>
    </Screen>
  )
}
