import axios, { type AxiosError } from 'axios'
import { getRawInitData } from '@/shared/lib/telegram'
import { reportRequestDuration } from '@/shared/lib/network'
import { ApiError } from './errors'
import type { ReceiptErrorCode } from '@/entities/receipt'

const baseURL = import.meta.env.VITE_API_BASE_URL as string

export const http = axios.create({ baseURL })

http.interceptors.request.use((config) => {
  ;(config as { startedAt?: number }).startedAt = performance.now()
  const initData = getRawInitData()
  if (initData) {
    config.headers.set('Authorization', `tma ${initData}`)
  }
  const method = (config.method ?? 'get').toLowerCase()
  if (method !== 'get' && !config.headers.has('Idempotency-Key')) {
    config.headers.set('Idempotency-Key', crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)
  }
  return config
})

const elapsed = (config: unknown) => performance.now() - ((config as { startedAt?: number } | undefined)?.startedAt ?? performance.now())

http.interceptors.response.use(
  (res) => {
    reportRequestDuration(elapsed(res.config), true)
    return res
  },
  (error: AxiosError<{ ok: false; error: { code: ReceiptErrorCode; details?: Record<string, unknown> } }>) => {
    reportRequestDuration(elapsed(error.config), !!error.response)
    if (!error.response) {
      return Promise.reject(new ApiError('NETWORK_ERROR'))
    }
    const body = error.response.data
    const code = (body?.error?.code as ReceiptErrorCode) ?? 'INTERNAL_ERROR'
    const details = body?.error?.details as Record<string, string | number> | undefined
    return Promise.reject(new ApiError(code, details))
  },
)
