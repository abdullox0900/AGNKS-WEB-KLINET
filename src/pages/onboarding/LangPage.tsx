import { useNavigate } from 'react-router-dom'
import { Fuel } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Screen } from '@/shared/ui/Screen'
import { useI18n } from '@/app/providers/I18nProvider'
import { cn } from '@/shared/lib/cn'
import type { Locale } from '@/shared/config/dictionaries'

export function LangPage() {
  const navigate = useNavigate()
  const { locale, setLocale, t } = useI18n()

  const options: { code: Locale; labelKey: 'lang.uz' | 'lang.ru' }[] = [
    { code: 'uz', labelKey: 'lang.uz' },
    { code: 'ru', labelKey: 'lang.ru' },
  ]

  return (
    <Screen className="flex min-h-screen flex-col justify-between pt-20">
      <div>
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)]">
          <Fuel size={30} className="text-[var(--color-primary)]" />
        </div>
        <h1 className="mb-6 text-[24px] font-bold text-[var(--color-ink)]">{t('lang.title')}</h1>
        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.code}
              onClick={() => setLocale(opt.code)}
              className={cn(
                'flex h-14 w-full items-center justify-between rounded-2xl border px-5 text-[16px] font-medium transition-colors',
                locale === opt.code
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)]',
              )}
            >
              {t(opt.labelKey)}
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border-2',
                  locale === opt.code ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]',
                )}
              >
                {locale === opt.code && <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />}
              </span>
            </button>
          ))}
        </div>
      </div>
      <Button onClick={() => navigate('/onboarding/phone')}>{t('lang.continue')}</Button>
    </Screen>
  )
}
