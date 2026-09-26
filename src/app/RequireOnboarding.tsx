import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useMe } from '@/shared/api/hooks'

export function RequireOnboarding({ children }: { children: ReactNode }) {
  const { data, isLoading } = useMe()

  if (isLoading && !data) return null
  if (data && !data.registered) return <Navigate to="/onboarding/lang" replace />

  return children
}
