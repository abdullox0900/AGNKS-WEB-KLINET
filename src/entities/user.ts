export interface UserProfile {
  id: string
  firstName: string
  phone: string | null
  registered: boolean
  balance: number
  pending: number
  receiptMinAmount: number
  receiptMaxAmount: number
  spendMinAmount: number
  cardBlocked: boolean
  /** promo messages from the bot switched on (stored server-side) */
  marketingOptIn: boolean
}

export interface RateInfo {
  basePercent: number
  promo: null | {
    label: string
    percent: number
    endsAt: string
  }
}
