import { useState } from 'react'
import { Globe, Megaphone, MessageSquareText, Info, CircleHelp, SunMoon, Sun, Moon, Check, ChevronRight, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { Sheet } from '@/shared/ui/Sheet'
import { useI18n } from '@/app/providers/I18nProvider'
import { useAppStore, type ThemePref } from '@/shared/config/appStore'
import { FeedbackSheet } from '@/features/feedback/FeedbackSheet'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/Toast'
import { apiLogout } from '@/shared/api/client'
import { useSWRConfig } from 'swr'

function Row({ icon, label, right, onClick }: { icon: React.ReactNode; label: string; right?: React.ReactNode; onClick?: () => void }) {
  const content = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-bg)] text-[var(--color-ink-secondary)]">
        {icon}
      </div>
      <span className="flex-1 text-[15px] text-[var(--color-ink)]">{label}</span>
      {right}
    </>
  )
  // Rows with an interactive `right` control (e.g. a toggle) must not also be a <button> themselves —
  // nested buttons are invalid HTML and make the inner control's clicks unreliable.
  if (!onClick) {
    return <div className="flex w-full items-center gap-3 border-b border-[var(--color-border)] py-3.5 text-left last:border-b-0">{content}</div>
  }
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-[var(--color-border)] py-3.5 text-left last:border-b-0"
    >
      {content}
    </button>
  )
}

const THEME_OPTIONS: { value: ThemePref; icon: typeof Sun }[] = [
  { value: 'auto', icon: SunMoon },
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
]

export function SettingsPage() {
  const { t, locale, setLocale } = useI18n()
  const navigate = useNavigate()
  const [sheet, setSheet] = useState<'lang' | 'theme' | 'feedback' | 'logout' | null>(null)
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const { mutate } = useSWRConfig()
  const { show } = useToast()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await apiLogout()
      // drop every cached response so nothing of the old profile flashes after re-registration
      await mutate(() => true, undefined, { revalidate: false })
      setSheet(null)
      navigate('/onboarding/lang', { replace: true })
    } catch {
      show(t('common.error_generic'))
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <Screen padded={false}>
      <PageHeader title={t('settings.title')} back={false} />
      <div className="px-4">
        <div className="rounded-2xl bg-[var(--color-surface)] px-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <Row
            icon={<Globe size={17} />}
            label={t('settings.language')}
            onClick={() => setSheet('lang')}
            right={<span className="text-[13px] text-[var(--color-ink-tertiary)]">{locale === 'uz' ? "O'zbekcha" : 'Русский'}</span>}
          />
          <Row
            icon={<SunMoon size={17} />}
            label={t('settings.theme')}
            onClick={() => setSheet('theme')}
            right={<span className="text-[13px] text-[var(--color-ink-tertiary)]">{t(`theme.${theme}`)}</span>}
          />
          <Row
            icon={<Megaphone size={17} />}
            label={t('promo.title')}
            onClick={() => navigate('/promotions')}
            right={<ChevronRight size={18} className="text-[var(--color-ink-tertiary)]" />}
          />
          <Row icon={<CircleHelp size={17} />} label={t('home.how_title')} onClick={() => navigate('/guide')} />
          <Row icon={<MessageSquareText size={17} />} label={t('feedback.title')} onClick={() => setSheet('feedback')} />
          <Row icon={<Info size={17} />} label={t('settings.version')} right={<span className="text-[13px] text-[var(--color-ink-tertiary)]">1.0.0</span>} />
        </div>

        <button
          onClick={() => setSheet('logout')}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-[var(--color-surface)] px-4 py-3.5 text-left"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
            <LogOut size={17} />
          </span>
          <span className="flex-1 text-[15px] font-medium text-[var(--color-danger)]">{t('logout.row')}</span>
        </button>
      </div>

      <Sheet open={sheet === 'logout'} onClose={() => !loggingOut && setSheet(null)} title={t('logout.title')}>
        <p className="text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">{t('logout.desc')}</p>
        <div className="mt-5 space-y-2 pb-2">
          <Button variant="danger" loading={loggingOut} onClick={handleLogout}>
            {t('logout.confirm')}
          </Button>
          <Button variant="ghost" disabled={loggingOut} onClick={() => setSheet(null)}>
            {t('logout.cancel')}
          </Button>
        </div>
      </Sheet>

      <Sheet open={sheet === 'lang'} onClose={() => setSheet(null)} title={t('settings.language')}>
        <div className="space-y-2 pb-6">
          {(['uz', 'ru'] as const).map((code) => (
            <button
              key={code}
              onClick={() => {
                setLocale(code)
                setSheet(null)
              }}
              className={`flex h-13 w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-[15px] font-medium ${
                locale === code ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-ink)]'
              }`}
            >
              {code === 'uz' ? "O'zbekcha" : 'Русский'}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === 'theme'} onClose={() => setSheet(null)} title={t('settings.theme')}>
        <div className="space-y-2 pb-6">
          {THEME_OPTIONS.map(({ value, icon: Icon }) => {
            const active = theme === value
            return (
              <button
                key={value}
                onClick={() => {
                  setTheme(value)
                  setSheet(null)
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left',
                  active ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' : 'border-[var(--color-border)]',
                )}
              >
                <Icon size={20} className={active ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink-secondary)]'} />
                <span className="flex-1">
                  <span className={cn('block text-[15px] font-medium', active ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink)]')}>
                    {t(`theme.${value}`)}
                  </span>
                  {value === 'auto' && (
                    <span className="block text-[12.5px] text-[var(--color-ink-tertiary)]">{t('theme.auto_hint')}</span>
                  )}
                </span>
                {active && <Check size={18} className="text-[var(--color-primary)]" />}
              </button>
            )
          })}
        </div>
      </Sheet>

      <FeedbackSheet open={sheet === 'feedback'} onClose={() => setSheet(null)} />
    </Screen>
  )
}
