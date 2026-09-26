export type HistoryEntryType = 'earn' | 'spend'

export type HistoryStatus = 'applied' | 'pending' | 'rejected' | 'dispute' | 'reversed'

export interface HistoryEntry {
  id: string
  type: HistoryEntryType
  stationName: string
  createdAt: string
  amount: number
  status: HistoryStatus
  bonus?: number
  ratePercent?: number
  receiptAmount?: number
  operationNumber: string
  cashierName?: string
  balanceAfter?: number
  disputeSent?: boolean
}

export type ReceiptErrorCode =
  | 'RECEIPT_QR_INVALID'
  | 'RECEIPT_TERMINAL_UNKNOWN'
  | 'RECEIPT_ALREADY_USED'
  | 'RECEIPT_EXPIRED'
  | 'RECEIPT_TIME_INVALID'
  | 'RECEIPT_AMOUNT_OUT_OF_RANGE'
  | 'RECEIPT_PHOTO_REQUIRED'
  | 'LOCATION_REQUIRED'
  | 'LOCATION_TOO_FAR'
  | 'CARD_BLOCKED'
  | 'RATE_LIMITED'
  | 'DISPUTE_ALREADY_OPEN'
  | 'AUTH_INVALID_INIT_DATA'
  | 'AUTH_FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'INTERNAL_ERROR'

export interface ApiError {
  code: ReceiptErrorCode
  message?: string
  meta?: Record<string, string | number>
}

export type ReceiptSource = { qrText: string } | { manual: { t: string; r: string; c: string; s: string } }

export interface SubmitReceiptResult {
  id: string
  status: 'applied' | 'pending_review' | 'rejected'
  bonus: number
  rateBps: number
  balanceAfter?: number
}
