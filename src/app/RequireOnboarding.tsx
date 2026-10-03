import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useMe } from '@/shared/api/hooks'
import { useSyncLanguage } from '@/shared/lib/useSyncLanguage'

export function RequireOnboarding({ children }: { children: ReactNode }) {
  const { data, isLoading } = useMe()
  useSyncLanguage(data)

  if (isLoading && !data) return null
  if (data && !data.registered) return <Navigate to="/onboarding/lang" replace />

  return children
}
