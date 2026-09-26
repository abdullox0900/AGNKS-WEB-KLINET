type ThemeParams = Record<string, string | undefined>

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  initData: string
  initDataUnsafe: { user?: { id: number; first_name?: string; last_name?: string; username?: string } }
  themeParams: ThemeParams
  colorScheme: 'light' | 'dark'
  BackButton: { show: () => void; hide: () => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void }
  HapticFeedback: {
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
  }
  requestContact: (cb: (granted: boolean, data?: unknown) => void) => void
  showScanQrPopup: (params: { text?: string }, cb: (text: string) => boolean | void) => void
  closeScanQrPopup: () => void
  openLink: (url: string) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  isVersionAtLeast: (version: string) => boolean
  LocationManager?: {
    init: (cb: () => void) => void
    getLocation: (cb: (data: { latitude: number; longitude: number } | null) => void) => void
  }
  safeAreaInset?: { top: number; bottom: number; left: number; right: number }
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

export function getTelegram(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null
}

export function isInTelegram(): boolean {
  return !!getTelegram()?.initData
}

/** Raw initData for the `Authorization: tma <initData>` header. Falls back to a
 * signed dev value (see scripts/gen-dev-init-data.mjs) outside Telegram, dev builds only. */
export function getRawInitData(): string | null {
  const real = getTelegram()?.initData
  if (real) return real
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_INIT_DATA) {
    return import.meta.env.VITE_DEV_INIT_DATA as string
  }
  return null
}

export function tgReady() {
  const tg = getTelegram()
  try {
    tg?.ready()
    tg?.expand()
  } catch {
    /* not in telegram */
  }
}

export function tgHaptic(type: 'error' | 'success' | 'warning') {
  try {
    getTelegram()?.HapticFeedback.notificationOccurred(type)
  } catch {
    /* noop */
  }
}

export function tgImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') {
  try {
    getTelegram()?.HapticFeedback.impactOccurred(style)
  } catch {
    /* noop */
  }
}

export function tgRequestContact(): Promise<boolean> {
  return new Promise((resolve) => {
    const tg = getTelegram()
    if (!tg) return resolve(false)
    try {
      tg.requestContact((granted) => resolve(granted))
    } catch {
      resolve(false)
    }
  })
}

export function tgShowScanQrPopup(onText: (text: string) => boolean | void, text?: string): boolean {
  const tg = getTelegram()
  if (!tg?.showScanQrPopup) return false
  try {
    tg.showScanQrPopup({ text }, onText)
    return true
  } catch {
    return false
  }
}

export function tgCloseScanQrPopup() {
  try {
    getTelegram()?.closeScanQrPopup()
  } catch {
    /* noop */
  }
}

export function tgOpenLink(url: string) {
  const tg = getTelegram()
  if (tg?.openLink) {
    try {
      tg.openLink(url)
      return
    } catch {
      /* fallthrough */
    }
  }
  window.open(url, '_blank')
}

export function tgSetBackButton(onClick: () => void): () => void {
  const tg = getTelegram()
  if (!tg?.BackButton) return () => {}
  try {
    tg.BackButton.show()
    tg.BackButton.onClick(onClick)
    return () => {
      try {
        tg.BackButton.offClick(onClick)
        tg.BackButton.hide()
      } catch {
        /* noop */
      }
    }
  } catch {
    return () => {}
  }
}

export function tgEnableClosingConfirmation(enable: boolean) {
  try {
    if (enable) getTelegram()?.enableClosingConfirmation()
    else getTelegram()?.disableClosingConfirmation()
  } catch {
    /* noop */
  }
}

export function tgUser() {
  return getTelegram()?.initDataUnsafe?.user ?? null
}
