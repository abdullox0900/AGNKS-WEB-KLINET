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
          <span
            className={cn(
              'absolute top-0 h-[3px] w-6 rounded-b-full bg-[var(--color-primary)] transition-opacity duration-200',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
          <Icon
            size={24}
            strokeWidth={isActive ? 2.2 : 1.8}
            className={cn(
              'transition-colors duration-200',
              isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink-tertiary)]',
            )}
          />
          <span
            className={cn(
              'text-[12px] leading-none transition-colors duration-200',
              isActive ? 'font-semibold text-[var(--color-primary)]' : 'font-medium text-[var(--color-ink-tertiary)]',
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
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)]"
      style={{ boxShadow: '0 -8px 24px -16px rgba(20, 22, 26, 0.18)' }}
    >
      <div className="flex" style={{ height: BOTTOM_NAV_HEIGHT }}>
        {LEFT.map((tab) => (
          <TabLink key={tab.to} tab={tab} />
        ))}

        {/* Center slot: 72px halo ring lifted above the bar, 52px action button inside. */}
        <div className="relative flex flex-1 justify-center">
          <div className="absolute -top-7 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[var(--color-surface)]">
            <button
              onClick={() => {
                tgImpact('medium')
                startScan()
              }}
              aria-label={t('nav.scan')}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] transition-transform duration-150 active:scale-90"
              style={{ boxShadow: '0 8px 20px -6px color-mix(in srgb, var(--color-primary) 60%, transparent)' }}
            >
              <ScanLine size={24} strokeWidth={2.2} />
            </button>
          </div>
          <span className="absolute bottom-[14px] text-[12px] font-medium leading-none text-[var(--color-ink-tertiary)]">
            {t('nav.scan')}
          </span>
        </div>

        {RIGHT.map((tab) => (
          <TabLink key={tab.to} tab={tab} />
        ))}
      </div>
    </nav>
  )
}
