/**
 * One webapp, one look per station bot. Each station's bot opens the app at `<app>/?b=<key>`
 * and the app paints itself in that station's color. `main` (no key / unknown key) is the original look.
 *
 * To add or recolor a station: edit this list only — `hue` is a color wheel angle (0–360):
 * 0 red · 28 orange · 48 gold · 82 lime · 140 green · 160 emerald · 178 teal · 200 blue (the default)
 * · 262 violet · 300 magenta · 340 rose.
 */
export interface Brand {
  /** the `?b=` value; same as the key in the server's TELEGRAM_EXTRA_BOT_TOKENS */
  key: string
  name: string
  hue: number
}

export const DEFAULT_BRAND_KEY = 'main'

export const BRANDS: Brand[] = [
  { key: 'kokand', name: "Qo'qon", hue: 160 },
  { key: 'quva', name: 'Quva', hue: 24 },
  { key: 'beshariq', name: 'Beshariq', hue: 262 },
  { key: 'fargona', name: "Farg'ona", hue: 340 },
  { key: 'margilon', name: "Marg'ilon", hue: 178 },
  { key: 'namuna', name: "Na'muna", hue: 48 },
  { key: 'nursux', name: 'Nursux', hue: 300 },
]
