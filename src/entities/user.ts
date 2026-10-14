export interface UserProfile {
  id: string
  firstName: string
  phone: string | null
  registered: boolean
  /** language the server uses for this client's Telegram messages */
  lang: 'uz' | 'ru'
  balance: number
  pending: number
  receiptMinAmount: number
  receiptMaxAmount: number
  spendMinAmount: number
  cardBlocked: boolean
  /** promo messages from the bot switched on (stored server-side) */
  marketingOptIn: boolean
  /** today's methane price (so'm/m³) set in the Dashboard; null from an older backend */
  methanePrice: number | null
  /** show the "who brought you?" question (new client, switched on in the Dashboard, not answered yet) */
  referralAsk: boolean
  /** the reason the SEO gave when blocking the card (null when not blocked) */
  blockedReason: string | null
  /** support threads with an answer the client has not opened yet */
  supportUnread: number
}

export interface RateInfo {
  basePercent: number
  promo: null | {
    label: string
    percent: number
    endsAt: string
  }
}
