import { useEffect } from 'react'
import { useSWRConfig } from 'swr'
import { apiGetRecheckList, apiRecheckReceipt } from '@/shared/api/client'
import { fetchSoliqRecord } from '@/shared/lib/soliq'

/**
 * Receipts soliq.uz had not confirmed at scan time wait for a re-check. The backend can't reach soliq.uz
 * (it only answers Uzbek IPs), so when the app opens the phone asks soliq.uz again and hands the record over —
 * the backend checks it against the receipt's own QR and, if it matches, credits the bonus by itself.
 * Silent: the client gets the usual "bonus tushdi" message. Does nothing while Avto-tekshiruv is off.
 */
export function useAutoRecheck() {
  const { mutate } = useSWRConfig()

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const items = await apiGetRecheckList()
        let credited = false
        for (const item of items) {
          if (cancelled) return
          const record = await fetchSoliqRecord({ t: item.t, r: item.r, c: item.c, s: item.s })
          if (!record) continue
          const res = await apiRecheckReceipt(item.id, record)
          if (res.status === 'applied') credited = true
        }
        if (credited && !cancelled) void mutate(() => true)
      } catch {
        /* best effort — the receipt simply stays in the queue */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mutate])
}
