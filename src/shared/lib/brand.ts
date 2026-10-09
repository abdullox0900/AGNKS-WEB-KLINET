import { BRANDS, DEFAULT_BRAND_KEY, type Brand } from '@/shared/config/brands'

const STORAGE_KEY = 'agnks-brand'

/**
 * Which station's look to use. The bot's menu button opens the app with `?b=<key>`; that is read once per
 * launch (and kept for reloads within the same session). Not remembered across launches on purpose: the original
 * bot opens the app without the parameter and must always show the original look.
 */
function resolveBrand(): Brand | null {
  let key: string | null = null
  try {
    key = new URLSearchParams(window.location.search).get('b')
    if (key) sessionStorage.setItem(STORAGE_KEY, key)
    else key = sessionStorage.getItem(STORAGE_KEY)
  } catch {
    /* storage can be blocked */
  }
  if (!key || key === DEFAULT_BRAND_KEY) return null
  return BRANDS.find((b) => b.key === key) ?? null
}

export const brand: Brand | null = resolveBrand()

type Scheme = 'light' | 'dark'

const hsl = (h: number, s: number, l: number, a?: number) => (a === undefined ? `hsl(${h} ${s}% ${l}%)` : `hsl(${h} ${s}% ${l}% / ${a})`)

/** The theme variables a brand overrides (everything else — money, success, danger… stays as is). */
export function brandVars(hue: number, scheme: Scheme): Record<string, string> {
  const h = ((hue % 360) + 360) % 360
  if (scheme === 'dark') {
    return {
      '--color-bg': hsl(h, 26, 8),
      '--color-surface': hsl(h, 22, 12),
      '--color-border': hsl(h, 18, 19),
      '--color-track': hsl(h, 30, 15),
      '--color-primary': hsl(h, 88, 62),
      '--color-primary-ink': hsl(h, 60, 9),
      '--color-primary-soft': hsl(h, 88, 62, 0.14),
      '--color-accent': hsl((h + 18) % 360, 85, 58),
      '--color-nav-bg': hsl(h, 42, 11),
      '--color-nav-active': hsl(h, 88, 66),
      '--color-nav-idle': hsl(h, 14, 45),
    }
  }
  return {
    '--color-bg': hsl(h, 32, 96),
    '--color-surface': '#ffffff',
    '--color-border': hsl(h, 22, 90),
    '--color-track': hsl(h, 32, 92),
    '--color-primary': hsl(h, 85, 36),
    '--color-primary-ink': '#ffffff',
    '--color-primary-soft': hsl(h, 90, 94),
    '--color-accent': hsl((h + 18) % 360, 80, 52),
    '--color-nav-bg': hsl(h, 50, 12),
    '--color-nav-active': hsl(h, 88, 66),
    '--color-nav-idle': hsl(h, 14, 55),
  }
}

/** The background as #rrggbb, for Telegram's header/bottom bar (it doesn't understand hsl()). */
export function brandBackgroundHex(hue: number, scheme: Scheme): string {
  const [s, l] = scheme === 'dark' ? [0.26, 0.08] : [0.32, 0.96]
  const h = hue / 360
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const channel = (t: number) => {
    const x = t < 0 ? t + 1 : t > 1 ? t - 1 : t
    const v = x < 1 / 6 ? p + (q - p) * 6 * x : x < 1 / 2 ? q : x < 2 / 3 ? p + (q - p) * (2 / 3 - x) * 6 : p
    return Math.round(v * 255).toString(16).padStart(2, '0')
  }
  return `#${channel(h + 1 / 3)}${channel(h)}${channel(h - 1 / 3)}`
}

/** Applies (or clears) the brand's variables on <html>. Inline styles beat the stylesheet, so no CSS changes are needed. */
export function applyBrand(scheme: Scheme): void {
  const root = document.documentElement
  const vars = brand ? brandVars(brand.hue, scheme) : null
  for (const name of Object.keys(brandVars(0, 'dark'))) {
    if (vars) root.style.setProperty(name, vars[name])
    else root.style.removeProperty(name)
  }
}
