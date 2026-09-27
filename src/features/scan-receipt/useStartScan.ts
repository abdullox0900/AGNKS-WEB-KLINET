import { useNavigate } from 'react-router-dom'
import { tgShowScanQrPopup, tgCloseScanQrPopup, tgHaptic } from '@/shared/lib/telegram'
import { apiSubmitReceipt } from '@/shared/api/client'
import { ApiError } from '@/shared/api/errors'

/** Inside Telegram: native showScanQrPopup → submit straight away. Outside (plain
 * browser) the popup isn't available, so fall back to the in-app camera page. */
export function useStartScan() {
  const navigate = useNavigate()

  return function startScan() {
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
}
