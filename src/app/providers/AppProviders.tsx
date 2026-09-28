import { useEffect, type ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { I18nProvider } from './I18nProvider'
import { ToastProvider } from '@/shared/ui/Toast'
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary'
import { isClientError } from '@/shared/api/errors'
import { tgReady } from '@/shared/lib/telegram'
import { useApplyTheme } from '@/shared/lib/useTheme'
import { startNetworkMonitor } from '@/shared/lib/network'
import { NetworkStatus } from '@/shared/ui/NetworkStatus'

export function AppProviders({ children }: { children: ReactNode }) {
  useApplyTheme()
  useEffect(() => {
    tgReady()
    startNetworkMonitor()
  }, [])

  return (
    <ErrorBoundary>
      <SWRConfig
        value={{
          revalidateOnFocus: true,
          shouldRetryOnError: (err) => !isClientError(err),
          errorRetryCount: 3,
          dedupingInterval: 2000,
          onError: (err, key) => {
            console.error('[swr]', key, err)
          },
        }}
      >
        <I18nProvider>
          <ToastProvider>
            <NetworkStatus />
            {children}
          </ToastProvider>
        </I18nProvider>
      </SWRConfig>
    </ErrorBoundary>
  )
}
