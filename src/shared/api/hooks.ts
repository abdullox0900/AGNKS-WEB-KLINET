import useSWR from 'swr'
import { apiGetMe, apiGetRate, apiGetHistory, apiGetPromotions, apiGetNews } from './client'

export function useMe() {
  return useSWR('/me', apiGetMe, { revalidateOnFocus: true })
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
