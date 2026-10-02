/** Fallback for "Bugungi metan narxi" while /me loads or on an older backend; the real value comes from Dashboard → Bonus. */
export const METHANE_PRICE_PER_M3 = Number(import.meta.env.VITE_METHANE_PRICE_PER_M3) || 3900
