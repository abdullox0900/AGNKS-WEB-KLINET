/**
 * Looks a fiscal receipt up on soliq.uz straight from the client's phone.
 *
 * soliq.uz doesn't answer servers outside Uzbekistan (our backend times out), but it
 * answers Uzbek IPs instantly and allows cross-origin calls — so the webapp fetches the
 * payment record itself and sends it along with the QR. The backend still checks it
 * against the QR (terminal / number / date) and prefers its own lookup when that works.
 *
 * Same private API + signing scheme as ofd.soliq.uz's own check page (the key is in
 * their public frontend bundle); mirrors the backend's SoliqFetchService.
 */

const API_URL = 'https://new-ofd.soliq.uz/api/payment'
const SIGNING_SECRET = 'thisIsPaymentSecretKey123@#'
const TIMEOUT_MS = 6000

export interface ReceiptQrFields {
  t: string
  r: string
  c: string
  s: string
}

export function parseReceiptQrFields(qrText: string): ReceiptQrFields | null {
  try {
    const url = new URL(qrText.trim())
    if (!/(^|\.)ofd\.soliq\.uz$/.test(url.hostname)) return null
    const t = url.searchParams.get('t')
    const r = url.searchParams.get('r')
    const c = url.searchParams.get('c')
    const s = url.searchParams.get('s')
    return t && r && c && s ? { t, r, c, s } : null
  } catch {
    return null
  }
}

async function hmacHex(message: string): Promise<string | null> {
  // crypto.subtle only exists in secure contexts (https / localhost / Telegram).
  if (!globalThis.crypto?.subtle) return null
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(SIGNING_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('')
}

/** The soliq.uz payment record (`data`), or null if it couldn't be fetched — never throws. */
export async function fetchSoliqRecord(fields: ReceiptQrFields): Promise<Record<string, unknown> | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = await hmacHex(`${fields.t}:${fields.r}:${timestamp}`)
    if (!signature) return null

    const res = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Timestamp': String(timestamp),
        'X-Signature': signature,
      },
      body: JSON.stringify({
        terminalId: fields.t,
        paymentNo: fields.r,
        paymentDate: fields.c,
        paymentType: 'CHECK',
        fiscalSign: fields.s,
      }),
    })
    const body = (await res.json().catch(() => null)) as { success?: boolean; data?: Record<string, unknown> } | null
    return res.ok && body?.success && body.data ? body.data : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
