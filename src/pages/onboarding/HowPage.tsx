import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'
import { Screen } from '@/shared/ui/Screen'
import { useI18n } from '@/app/providers/I18nProvider'

export function HowPage() {
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <Screen className="flex min-h-screen flex-col justify-between pt-16">
      <div className="flex flex-col items-center text-center">
        <svg width="180" height="220" viewBox="0 0 180 220" fill="none" className="mb-8">
          <path d="M20 10h140v190l-15-10-15 10-15-10-15 10-15-10-15 10-15-10-15 10-15-10V10z" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
          <rect x="38" y="34" width="48" height="48" rx="4" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="2" />
          <rect x="46" y="42" width="10" height="10" fill="var(--color-primary)" />
          <rect x="68" y="42" width="10" height="10" fill="var(--color-primary)" />
          <rect x="46" y="64" width="10" height="10" fill="var(--color-primary)" />
          <rect x="60" y="56" width="6" height="6" fill="var(--color-primary)" />
          <rect x="100" y="40" width="42" height="8" rx="2" fill="var(--color-border)" />
          <rect x="100" y="56" width="30" height="8" rx="2" fill="var(--color-border)" />
          <rect x="38" y="100" width="104" height="10" rx="2" fill="var(--color-border)" />
          <rect x="38" y="118" width="80" height="10" rx="2" fill="var(--color-border)" />
          <rect x="38" y="144" width="104" height="20" rx="4" fill="var(--color-amber-soft)" stroke="var(--color-amber)" strokeWidth="2" />
          <rect x="48" y="150" width="60" height="8" rx="2" fill="var(--color-amber)" />
        </svg>
        <h1 className="mb-2 text-[22px] font-bold text-[var(--color-ink)]">{t('how.title')}</h1>
        <p className="max-w-[280px] text-[15px] text-[var(--color-ink-secondary)]">{t('how.desc')}</p>
      </div>
      <Button onClick={() => navigate('/')}>{t('how.got_it')}</Button>
    </Screen>
  )
}
