import { Fuel } from 'lucide-react'
import { METHANE_PRICE_PER_M3 } from '@/shared/config/methanePrice'
import { useMe } from '@/shared/api/hooks'
import { useI18n } from '@/app/providers/I18nProvider'

/** Fixed-width card for the horizontal "Aksiyalar va narxlar" row on the home screen. */
export function MethanePriceCard() {
  const { t } = useI18n()
  const { data: me } = useMe()
  const price = (me?.methanePrice ?? METHANE_PRICE_PER_M3).toLocaleString('ru-RU').replace(/,/g, ' ')
  return (
    <div className="w-[170px] shrink-0 rounded-[20px] bg-[var(--color-surface)] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <Fuel size={22} className="text-[var(--color-primary)]" />
      <p className="mt-3 text-[12px] text-[var(--color-ink-tertiary)]">{t('home.methane_price')}</p>
      <p className="tnum text-[20px] font-extrabold leading-none">
        {price} <span className="text-[13px] font-semibold text-[var(--color-ink-tertiary)]">{t('home.methane_unit')}</span>
      </p>
    </div>
  )
}
