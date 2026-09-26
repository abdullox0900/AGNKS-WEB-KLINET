import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mutate } from 'swr'
import { User } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Screen } from '@/shared/ui/Screen'
import { useI18n } from '@/app/providers/I18nProvider'
import { useOnboardingStore } from '@/shared/config/onboardingStore'
import { tgUser } from '@/shared/lib/telegram'
import { apiRegister } from '@/shared/api/client'

const NAME_RE = /^[\p{L}][\p{L}\s'-]{1,39}$/u

export function NamePage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { firstName, setFirstName } = useOnboardingStore()
  const [value, setValue] = useState(firstName || tgUser()?.first_name || '')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isValid = NAME_RE.test(value.trim())

  async function handleContinue() {
    if (!isValid || submitting) {
      setTouched(true)
      return
    }
    setSubmitting(true)
    try {
      setFirstName(value.trim())
      const me = await apiRegister({ firstName: value.trim() })
      // Prime the global SWR cache with the now-registered profile *before* navigating —
      // otherwise RequireOnboarding's first render on '/' can see stale unregistered data
      // and bounce straight back to onboarding.
      await mutate('/me', me, { revalidate: false })
      navigate('/onboarding/how')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen className="flex min-h-screen flex-col justify-between pt-20">
      <div>
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)]">
          <User size={28} className="text-[var(--color-primary)]" />
        </div>
        <h1 className="mb-6 text-[24px] font-bold text-[var(--color-ink)]">{t('name.title')}</h1>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={t('name.placeholder')}
          autoFocus
          className="h-14 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[16px] text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
        />
        {touched && !isValid && <p className="mt-2 text-[13px] font-medium text-[var(--color-danger)]">{t('name.error')}</p>}
      </div>
      <Button onClick={handleContinue} disabled={touched && !isValid}>
        {t('lang.continue')}
      </Button>
    </Screen>
  )
}
