import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from './dictionaries'

/** 'auto' follows Telegram's scheme inside Telegram, the OS scheme in a plain browser. */
export type ThemePref = 'auto' | 'light' | 'dark'

interface AppState {
  locale: Locale
  /** the user picked the language themselves (Profil / language page) — then the webapp is the source of truth */
  localeChosen: boolean
  /** explicit choice by the user */
  setLocale: (locale: Locale) => void
  /** follow the language the server has for this client (bot registration) without counting as a choice */
  adoptLocale: (locale: Locale) => void
  /** sentAt of the newest broadcast the user has seen — drives the 🔔 dot (per device) */
  newsSeenAt: string | null
  markNewsSeen: (sentAt: string) => void
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
      localeChosen: false,
      setLocale: (locale) => set({ locale, localeChosen: true }),
      adoptLocale: (locale) => set({ locale }),
      newsSeenAt: null,
      markNewsSeen: (newsSeenAt) => set({ newsSeenAt }),
      howCardDismissed: false,
      dismissHowCard: () => set({ howCardDismissed: true }),
      theme: 'auto',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'agnks-app-store',
      version: 1,
      // devices that already had a saved language chose it themselves — keep it and tell the server
      migrate: (state, version) => (version < 1 ? { ...(state as object), localeChosen: true } : state) as AppState,
    },
  ),
)
