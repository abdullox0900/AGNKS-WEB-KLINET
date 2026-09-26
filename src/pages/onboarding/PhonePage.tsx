import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Screen } from '@/shared/ui/Screen'
import { useI18n } from '@/app/providers/I18nProvider'
import { isInTelegram, tgRequestContact } from '@/shared/lib/telegram'
import { apiGetMe, apiStartPhoneVerification } from '@/shared/api/client'

type Status = 'idle' | 'checking' | 'timeout' | 'denied'

export function PhonePage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [status, setStatus] = useState<Status>('idle')
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [])

  async function handleShare() {
    setStatus('idle')
    const granted = isInTelegram() ? await tgRequestContact() : true
    if (!granted) {
      setStatus('denied')
      return
    }

    await apiStartPhoneVerification()
    setStatus('checking')
    const startedAt = Date.now()

    intervalRef.current = window.setInterval(async () => {
      const me = await apiGetMe()
      if (me.phone) {
        if (intervalRef.current) window.clearInterval(intervalRef.current)
        navigate('/onboarding/name')
        return
      }
      if (Date.now() - startedAt > 20000) {
        if (intervalRef.current) window.clearInterval(intervalRef.current)
        setStatus('timeout')
      }
    }, 1500)
  }

  return (
    <Screen className="flex min-h-screen flex-col justify-between pt-20">
      <div>
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)]">
          <Phone size={28} className="text-[var(--color-primary)]" />
        </div>
        <h1 className="mb-2 text-[24px] font-bold text-[var(--color-ink)]">{t('phone.title')}</h1>
        <p className="text-[15px] text-[var(--color-ink-secondary)]">{t('phone.desc')}</p>

        {status === 'checking' && (
          <div className="mt-6 flex items-center gap-2 text-[14px] text-[var(--color-ink-secondary)]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
            {t('phone.checking')}
          </div>
        )}
        {status === 'timeout' && (
          <p className="mt-6 text-[14px] font-medium text-[var(--color-danger)]">{t('phone.timeout')}</p>
        )}
        {status === 'denied' && (
          <p className="mt-6 text-[14px] font-medium text-[var(--color-danger)]">{t('phone.denied')}</p>
        )}
      </div>

      <Button onClick={handleShare} loading={status === 'checking'}>
        {status === 'timeout' || status === 'denied' ? t('phone.retry') : t('phone.share')}
      </Button>
    </Screen>
  )
}
