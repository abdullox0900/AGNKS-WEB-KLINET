import { useOnline } from '@/shared/lib/useOnline'
import { useI18n } from '@/app/providers/I18nProvider'

export function OfflineBanner() {
  const online = useOnline()
  const { t } = useI18n()
  if (online) return null
  return (
    <div className="flex h-9 items-center justify-center bg-[var(--color-danger-soft)] text-[13px] font-medium text-[var(--color-danger)]">
      {t('home.offline')}
    </div>
  )
}
