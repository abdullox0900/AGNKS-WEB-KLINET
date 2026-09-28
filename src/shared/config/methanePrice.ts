/** "Bugungi metan narxi" — static for now (no backend field yet), overridable per deploy via env. */
export const METHANE_PRICE_PER_M3 = Number(import.meta.env.VITE_METHANE_PRICE_PER_M3) || 3900
