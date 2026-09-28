import { useNavigate } from 'react-router-dom'
import { tgShowScanQrPopup, tgCloseScanQrPopup } from '@/shared/lib/telegram'

/** Inside Telegram: native showScanQrPopup, then the full-screen /earn/submit step.
 * Outside (plain browser) the popup isn't available, so open the in-app camera page. */
export function useStartScan() {
  const navigate = useNavigate()

  return function startScan() {
    // A rescan from the submit page's error view replaces it, so Back goes home instead
    // of back to the failed receipt (which would be submitted again).
    const replace = window.location.pathname === '/earn/submit'
    const opened = tgShowScanQrPopup((text) => {
      tgCloseScanQrPopup()
      navigate('/earn/submit', { state: { qrText: text }, replace })
      return true
    })
    if (!opened) navigate('/earn/scan', { replace })
  }
}
