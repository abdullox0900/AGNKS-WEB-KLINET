import useSWR from 'swr'
import { apiGetMe, apiGetRate, apiGetHistory } from './client'

export function useMe() {
  return useSWR('/me', apiGetMe, { revalidateOnFocus: true })
}

export function useRate() {
  return useSWR('/me/rate', apiGetRate, { refreshInterval: 5 * 60 * 1000 })
}

export function useHistoryPreview() {
  return useSWR('/me/history?limit=3', () => apiGetHistory({ limit: 3 }))
}
