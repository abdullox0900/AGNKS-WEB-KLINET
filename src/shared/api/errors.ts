import type { ReceiptErrorCode } from '@/entities/receipt'

export class ApiError extends Error {
  code: ReceiptErrorCode
  meta?: Record<string, string | number>

  constructor(code: ReceiptErrorCode, meta?: Record<string, string | number>) {
    super(code)
    this.code = code
    this.meta = meta
  }
}

export function isClientError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false
  return err.code !== 'NETWORK_ERROR' && err.code !== 'INTERNAL_ERROR'
}
