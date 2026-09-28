import { createBrowserRouter, Outlet, useLocation } from 'react-router-dom'
import { RequireOnboarding } from './RequireOnboarding'
import { OfflineBanner } from '@/shared/ui/OfflineBanner'
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary'
import { BottomNav, BOTTOM_NAV_HEIGHT } from '@/widgets/BottomNav'

import { LangPage } from '@/pages/onboarding/LangPage'
import { PhonePage } from '@/pages/onboarding/PhonePage'
import { NamePage } from '@/pages/onboarding/NamePage'
import { HowPage } from '@/pages/onboarding/HowPage'

import { HomePage } from '@/pages/home/HomePage'
import { ScanPage } from '@/pages/earn/ScanPage'
import { ResultPage } from '@/pages/earn/ResultPage'
import { SubmitPage } from '@/pages/earn/SubmitPage'
import { SpendPage } from '@/pages/spend/SpendPage'
import { HistoryPage } from '@/pages/history/HistoryPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { GuidePage } from '@/pages/guide/GuidePage'
import { PromotionsPage } from '@/pages/promotions/PromotionsPage'
import { NewsPage } from '@/pages/news/NewsPage'

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

/** Top-level tabs share the bottom bar; pad content so it never hides behind it. */
function TabsLayout() {
  return (
    <>
      <div style={{ paddingBottom: `calc(${BOTTOM_NAV_HEIGHT + 16}px + var(--app-inset-bottom))` }}>
        <Outlet />
      </div>
      <BottomNav />
    </>
  )
}

/** A rescan from the error view lands on the same path with a new QR — remount per navigation. */
function SubmitRoute() {
  const location = useLocation()
  return <SubmitPage key={location.key} />
}

export const router = createBrowserRouter([
  { path: '/onboarding/lang', element: <LangPage /> },
  { path: '/onboarding/phone', element: <PhonePage /> },
  { path: '/onboarding/name', element: <NamePage /> },
  { path: '/onboarding/how', element: <HowPage /> },
  {
    element: <MainLayout />,
    children: [
      {
        element: <TabsLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/history', element: <HistoryPage /> },
          { path: '/spend', element: <SpendPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
      { path: '/earn/scan', element: <ScanPage /> },
      { path: '/earn/submit', element: <SubmitRoute /> },
      { path: '/earn/result/:id', element: <ResultPage /> },
      { path: '/guide', element: <GuidePage /> },
      { path: '/promotions', element: <PromotionsPage /> },
      { path: '/news', element: <NewsPage /> },
    ],
  },
])
