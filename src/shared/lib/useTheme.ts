import { useEffect, useState } from 'react'
import { useAppStore } from '@/shared/config/appStore'
import { tgColorScheme, tgOnThemeChanged, tgPaintChrome } from './telegram'
import { applyBrand, brand, brandBackgroundHex } from './brand'

// Must match --color-bg in index.css.
const BG = { light: '#f6f7f9', dark: '#0f1115' } as const

function systemScheme(): 'light' | 'dark' {
  return tgColorScheme() ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}

/** Resolves the user's theme preference and applies it to <html data-theme> + Telegram chrome. */
export function useApplyTheme() {
  const pref = useAppStore((s) => s.theme)
  const [system, setSystem] = useState(systemScheme)

  useEffect(() => {
    const update = () => setSystem(systemScheme())
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', update)
    const offTg = tgOnThemeChanged(update)
    return () => {
      mq.removeEventListener('change', update)
      offTg()
    }
  }, [])

  const effective = pref === 'auto' ? system : pref

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = effective
    root.style.colorScheme = effective
    applyBrand(effective)
    tgPaintChrome(brand ? brandBackgroundHex(brand.hue, effective) : BG[effective])
  }, [effective])
}
