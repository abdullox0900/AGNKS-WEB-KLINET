import { ScanLine, Wallet, History, Ticket, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStartScan } from '@/features/scan-receipt/useStartScan'
import { tgImpact } from '@/shared/lib/telegram'
import { useI18n } from '@/app/providers/I18nProvider'
import type { DictKey } from '@/shared/config/dictionaries'

type Action = { icon: LucideIcon; label: DictKey; onClick: () => void }

export function QuickActions() {
  const navigate = useNavigate()
  const startScan = useStartScan()
  const { t } = useI18n()

  const actions: Action[] = [
    { icon: ScanLine, label: 'nav.scan', onClick: startScan },
    { icon: Wallet, label: 'home.quick_pay', onClick: () => navigate('/spend') },
    { icon: History, label: 'nav.history', onClick: () => navigate('/history') },
    { icon: Ticket, label: 'promo.title', onClick: () => navigate('/promotions') },
  ]

  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => {
            tgImpact('light')
            a.onClick()
          }}
          className="flex flex-col items-center gap-1.5"
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface)] text-[var(--color-primary)]"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <a.icon size={24} />
          </span>
          <span className="text-[12px] font-medium text-[var(--color-ink-secondary)]">{t(a.label)}</span>
        </button>
      ))}
    </div>
  )
}
