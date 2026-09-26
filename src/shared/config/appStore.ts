import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from './dictionaries'

interface AppState {
  locale: Locale
  setLocale: (locale: Locale) => void
  marketingOptIn: boolean
  setMarketingOptIn: (value: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'uz',
      setLocale: (locale) => set({ locale }),
      marketingOptIn: false,
      setMarketingOptIn: (marketingOptIn) => set({ marketingOptIn }),
    }),
    { name: 'agnks-app-store' },
  ),
)
