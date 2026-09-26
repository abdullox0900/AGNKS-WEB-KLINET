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
}

export interface RateInfo {
  basePercent: number
  promo: null | {
    label: string
    percent: number
    endsAt: string
  }
}
