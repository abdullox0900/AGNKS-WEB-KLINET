import useSWR from 'swr'
import { apiGetMe, apiGetRate, apiGetHistory, apiGetPromotions, apiGetNews, apiGetSupportThreads, apiGetSupportThread } from './client'

export function useMe() {
  // every few minutes too, so an answer from support or a block/unblock shows up while the app stays open
  return useSWR('/me', apiGetMe, { revalidateOnFocus: true, refreshInterval: 90_000 })
}

export function useRate() {
  return useSWR('/me/rate', apiGetRate, { refreshInterval: 5 * 60 * 1000 })
}

export function useNews() {
  return useSWR('/me/news', apiGetNews, { refreshInterval: 5 * 60 * 1000 })
}

export function usePromotions() {
  return useSWR('/me/promotions', apiGetPromotions)
}

export function useHistoryPreview() {
  return useSWR('/me/history?limit=3', () => apiGetHistory({ limit: 3 }))
}

export function useSupportThreads() {
  return useSWR('/me/feedback', apiGetSupportThreads, { refreshInterval: 30_000, revalidateOnFocus: true })
}

/** One conversation; polled while it is open so the operator's answer appears without leaving the screen. */
export function useSupportThread(id: string | undefined) {
  return useSWR(id ? ['/me/feedback', id] : null, () => apiGetSupportThread(id!), { refreshInterval: 8_000, revalidateOnFocus: true })
}
