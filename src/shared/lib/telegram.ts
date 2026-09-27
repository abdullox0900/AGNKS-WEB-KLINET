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
  onEvent?: (event: string, cb: () => void) => void
  offEvent?: (event: string, cb: () => void) => void
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  setBottomBarColor?: (color: string) => void
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

/** Telegram's own light/dark scheme, or null outside Telegram. */
export function tgColorScheme(): 'light' | 'dark' | null {
  return isInTelegram() ? (getTelegram()?.colorScheme ?? null) : null
}

/** Subscribes to Telegram theme switches; returns an unsubscribe fn. */
export function tgOnThemeChanged(cb: () => void): () => void {
  const tg = getTelegram()
  if (!isInTelegram() || !tg?.onEvent) return () => {}
  tg.onEvent('themeChanged', cb)
  return () => tg.offEvent?.('themeChanged', cb)
}

/** Paints Telegram's header/background/bottom-bar chrome so it blends with the page. */
export function tgPaintChrome(color: string) {
  const tg = getTelegram()
  if (!isInTelegram() || !tg) return
  try {
    tg.setHeaderColor?.(color)
    tg.setBackgroundColor?.(color)
    if (tg.isVersionAtLeast('7.10')) tg.setBottomBarColor?.(color)
  } catch {
    /* older clients */
  }
}
