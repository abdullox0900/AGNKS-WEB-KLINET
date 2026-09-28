import { Fuel } from 'lucide-react'
import { METHANE_PRICE_PER_M3 } from '@/shared/config/methanePrice'
import { useI18n } from '@/app/providers/I18nProvider'

export function MethanePriceCard() {
  const { t } = useI18n()
  const price = METHANE_PRICE_PER_M3.toLocaleString('ru-RU').replace(/,/g, ' ')
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface)] px-4 py-3" style={{ boxShadow: 'var(--shadow-card)' }}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-amber-soft)] text-[var(--color-amber)]">
        <Fuel size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] text-[var(--color-ink-tertiary)]">{t('home.methane_price')}</p>
        <p className="tnum text-[16px] font-bold leading-tight text-[var(--color-ink)]">
          {price} <span className="text-[12.5px] font-semibold text-[var(--color-ink-tertiary)]">{t('home.methane_unit')}</span>
        </p>
      </div>
    </div>
  )
}
