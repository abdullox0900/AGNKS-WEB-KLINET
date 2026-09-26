import type { UserProfile, RateInfo } from '@/entities/user'
import type { HistoryEntry, HistoryEntryType, ReceiptSource, SubmitReceiptResult } from '@/entities/receipt'
import { http } from './http'

interface MeResponse {
  id: string
  firstName: string
  phone: string | null
  lang: 'uz' | 'ru'
  registered: boolean
  cardNumber: string
  balance: number
  pendingAmount: number
  cardBlocked: boolean
  receiptMinAmount: number
  receiptMaxAmount: number
  spendMinAmount: number
  spendMaxAmount: number
}

function toUserProfile(me: MeResponse): UserProfile {
  return {
    id: me.id,
    firstName: me.firstName,
    phone: me.phone,
    registered: me.registered,
    balance: me.balance,
    pending: me.pendingAmount,
    receiptMinAmount: me.receiptMinAmount,
    receiptMaxAmount: me.receiptMaxAmount,
    spendMinAmount: me.spendMinAmount,
    cardBlocked: me.cardBlocked,
  }
}

export async function apiGetMe(): Promise<UserProfile> {
  const { data } = await http.get<{ data: MeResponse }>('/me')
  return toUserProfile(data.data)
}

/** Phone is only ever set server-side once the Telegram bot relays a shared contact
 * (see UsersService.setPhoneFromBotContact) — there is no client-triggerable "start
 * verification" call. PhonePage polls apiGetMe() until `phone` shows up. */
export async function apiStartPhoneVerification(): Promise<void> {
  return Promise.resolve()
}

export async function apiGetRate(stationId?: string): Promise<RateInfo> {
  const { data } = await http.get<{ data: { basePercent: number; promo: { id: string; name: string; percent: number; endsAt: string } | null } }>(
    '/me/rate',
    { params: { stationId } },
  )
  const r = data.data
  return {
    basePercent: r.basePercent,
    promo: r.promo ? { label: r.promo.name, percent: r.promo.percent, endsAt: r.promo.endsAt } : null,
  }
}

export async function apiRegister(input: { firstName: string }): Promise<UserProfile> {
  const { data } = await http.post<{ data: MeResponse }>('/me/register', { firstName: input.firstName })
  return toUserProfile(data.data)
}

interface HistoryItemDto {
  type: HistoryEntryType
  id: string
  createdAt: string
  stationName: string
  amount: number
  status: string
  receiptAmount?: number
  ratePercent?: number
  photoId?: string | null
  operationNumber: string
}

function toHistoryEntry(dto: HistoryItemDto): HistoryEntry {
  return {
    id: dto.id,
    type: dto.type,
    stationName: dto.stationName,
    createdAt: dto.createdAt,
    amount: dto.amount,
    status: dto.status as HistoryEntry['status'],
    bonus: dto.type === 'earn' ? dto.amount : undefined,
    ratePercent: dto.ratePercent,
    receiptAmount: dto.receiptAmount,
    operationNumber: dto.operationNumber,
  }
}

export async function apiGetHistory(params: { limit?: number; cursor?: string; filter?: 'all' | 'earn' | 'spend' }): Promise<{
  items: HistoryEntry[]
  nextCursor: string | null
}> {
  const { data } = await http.get<{ data: { items: HistoryItemDto[]; nextCursor: string | null } }>('/me/history', {
    params: {
      limit: params.limit,
      cursor: params.cursor,
      type: params.filter && params.filter !== 'all' ? params.filter : undefined,
    },
  })
  return { items: data.data.items.map(toHistoryEntry), nextCursor: data.data.nextCursor }
}

/** No amount, no photo — soliq.uz's fiscal-check page is the sole source of the receipt total
 * (see ReceiptsService.submit on the backend). The client only ever forwards the QR/manual
 * fields it scanned plus an optional location. */
export async function apiSubmitReceipt(input: {
  source: ReceiptSource
  idempotencyKey: string
  lat?: number
  lng?: number
}): Promise<SubmitReceiptResult> {
  const body =
    'qrText' in input.source
      ? { qrText: input.source.qrText, lat: input.lat, lng: input.lng }
      : { manual: input.source.manual, lat: input.lat, lng: input.lng }

  const { data } = await http.post<{ data: SubmitReceiptResult }>('/me/receipts', body, {
    headers: { 'Idempotency-Key': input.idempotencyKey },
  })
  return data.data
}

export async function apiCreateSpendToken(): Promise<{ qrText: string; code: string; expiresAt: string }> {
  const { data } = await http.post<{ data: { code: string; qrPayload: string; expiresAt: string } }>('/me/spend-token')
  return { qrText: data.data.qrPayload, code: data.data.code, expiresAt: data.data.expiresAt }
}

export async function apiGetHistoryEntry(type: HistoryEntryType, id: string): Promise<HistoryEntry | null> {
  try {
    const { data } = await http.get<{
      data: {
        id: string
        createdAt: string
        amount: number
        bonus?: number
        rateBps?: number
        status: string
        cashierName?: string | null
        disputeSent?: boolean
        station: { name: string }
      }
    }>(`/me/history/${type}/${id}`)
    const r = data.data
    return {
      id: r.id,
      type,
      stationName: r.station.name,
      createdAt: r.createdAt,
      amount: type === 'earn' ? Number(r.bonus ?? r.amount) : -Number(r.amount),
      status: r.status as HistoryEntry['status'],
      bonus: type === 'earn' ? Number(r.bonus ?? r.amount) : undefined,
      ratePercent: r.rateBps !== undefined ? r.rateBps / 100 : undefined,
      receiptAmount: type === 'earn' ? Number(r.amount) : undefined,
      cashierName: r.cashierName ?? undefined,
      disputeSent: r.disputeSent,
      operationNumber: `${type === 'earn' ? 'E' : 'S'}-${r.id.slice(0, 8)}`,
    }
  } catch {
    return null
  }
}

export async function apiSendFeedback(input: { kind: 'suggestion' | 'complaint'; message: string }): Promise<void> {
  await http.post('/me/feedback', input)
}

export async function apiSetMarketingOptIn(value: boolean): Promise<void> {
  await http.patch('/me/marketing', { accepted: value, version: '1' })
}
