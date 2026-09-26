import { createBrowserRouter, Outlet } from 'react-router-dom'
import { RequireOnboarding } from './RequireOnboarding'
import { OfflineBanner } from '@/shared/ui/OfflineBanner'
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary'

import { LangPage } from '@/pages/onboarding/LangPage'
import { PhonePage } from '@/pages/onboarding/PhonePage'
import { NamePage } from '@/pages/onboarding/NamePage'
import { HowPage } from '@/pages/onboarding/HowPage'

import { HomePage } from '@/pages/home/HomePage'
import { ScanPage } from '@/pages/earn/ScanPage'
import { ResultPage } from '@/pages/earn/ResultPage'
import { SpendPage } from '@/pages/spend/SpendPage'
import { HistoryPage } from '@/pages/history/HistoryPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

function MainLayout() {
  return (
    <RequireOnboarding>
      <OfflineBanner />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </RequireOnboarding>
  )
}

export const router = createBrowserRouter([
  { path: '/onboarding/lang', element: <LangPage /> },
  { path: '/onboarding/phone', element: <PhonePage /> },
  { path: '/onboarding/name', element: <NamePage /> },
  { path: '/onboarding/how', element: <HowPage /> },
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/earn/scan', element: <ScanPage /> },
      { path: '/earn/result/:id', element: <ResultPage /> },
      { path: '/spend', element: <SpendPage /> },
      { path: '/history', element: <HistoryPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
])
