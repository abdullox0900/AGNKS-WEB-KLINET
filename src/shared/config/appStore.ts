import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from './dictionaries'

/** 'auto' follows Telegram's scheme inside Telegram, the OS scheme in a plain browser. */
export type ThemePref = 'auto' | 'light' | 'dark'

interface AppState {
  locale: Locale
  setLocale: (locale: Locale) => void
  marketingOptIn: boolean
  setMarketingOptIn: (value: boolean) => void
  /** Home "Qanday ishlaydi?" card closed by the user — never shown again. */
  howCardDismissed: boolean
  theme: ThemePref
  setTheme: (theme: ThemePref) => void
  dismissHowCard: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'uz',
      setLocale: (locale) => set({ locale }),
      marketingOptIn: false,
      setMarketingOptIn: (marketingOptIn) => set({ marketingOptIn }),
      howCardDismissed: false,
      dismissHowCard: () => set({ howCardDismissed: true }),
      theme: 'auto',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'agnks-app-store' },
  ),
)
