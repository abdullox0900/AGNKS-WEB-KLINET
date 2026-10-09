import { NavLink } from 'react-router-dom'
import { House, History, ScanLine, Wallet, UserRound, type LucideIcon } from 'lucide-react'
import { useI18n } from '@/app/providers/I18nProvider'
import { useStartScan } from '@/features/scan-receipt/useStartScan'
import { tgImpact } from '@/shared/lib/telegram'
import { cn } from '@/shared/lib/cn'
import type { DictKey } from '@/shared/config/dictionaries'

type Tab = { to: string; icon: LucideIcon; label: DictKey }

const LEFT: Tab[] = [
  { to: '/', icon: House, label: 'nav.home' },
  { to: '/history', icon: History, label: 'nav.history' },
]
const RIGHT: Tab[] = [
  { to: '/spend', icon: Wallet, label: 'nav.bonus' },
  { to: '/settings', icon: UserRound, label: 'nav.profile' },
]

/** Height of the bar itself (without the safe-area inset) — pages pad by this. */
export const BOTTOM_NAV_HEIGHT = 72

function TabLink({ tab }: { tab: Tab }) {
  const { t } = useI18n()
  const Icon = tab.icon
  return (
    <NavLink
      to={tab.to}
      end
      replace
      onClick={() => tgImpact('light')}
      className="relative flex flex-1 flex-col items-center justify-center gap-1"
    >
      {({ isActive }) => (
        <>
          <Icon
            size={23}
            strokeWidth={isActive ? 2.2 : 1.8}
            className={cn(
              'transition-colors duration-200',
              isActive ? 'text-[var(--color-nav-active)]' : 'text-[var(--color-nav-idle)]',
            )}
          />
          <span
            className={cn(
              'text-[11px] leading-none transition-colors duration-200',
              isActive ? 'font-bold text-[var(--color-nav-active)]' : 'font-medium text-[var(--color-nav-idle)]',
            )}
          >
            {t(tab.label)}
          </span>
        </>
      )}
    </NavLink>
  )
}

export function BottomNav() {
  const { t } = useI18n()
  const startScan = useStartScan()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] px-4 pb-[max(14px,var(--app-inset-bottom))]">
      <div
        className="relative flex items-center rounded-full bg-[var(--color-nav-bg)] px-2"
        style={{ height: BOTTOM_NAV_HEIGHT, boxShadow: '0 16px 36px -16px rgba(0,0,0,.45)' }}
      >
        {LEFT.map((tab) => (
          <TabLink key={tab.to} tab={tab} />
        ))}

        {/* Center slot: raised gradient scan button, ringed by the page background. */}
        <div className="relative flex w-[76px] justify-center">
          <button
            onClick={() => {
              tgImpact('medium')
              startScan()
            }}
            aria-label={t('nav.scan')}
            className="grad-flow absolute -top-9 flex h-[62px] w-[62px] items-center justify-center rounded-full border-4 border-[var(--color-bg)] text-[var(--color-primary-ink)] transition-transform duration-150 active:scale-90"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
          >
            <ScanLine size={26} strokeWidth={2.2} />
          </button>
        </div>

        {RIGHT.map((tab) => (
          <TabLink key={tab.to} tab={tab} />
        ))}
      </div>
    </nav>
  )
}
