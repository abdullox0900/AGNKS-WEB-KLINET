import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { dictionaries, type DictKey } from '@/shared/config/dictionaries'
import { useAppStore } from '@/shared/config/appStore'

interface I18nContextValue {
  locale: 'uz' | 'ru'
  setLocale: (locale: 'uz' | 'ru') => void
  t: (key: DictKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useAppStore((s) => s.locale)
  const setLocale = useAppStore((s) => s.setLocale)

  const t = useCallback(
    (key: DictKey, vars?: Record<string, string | number>) => {
      let str: string = dictionaries[locale][key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, String(v))
        }
      }
      return str
    },
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
