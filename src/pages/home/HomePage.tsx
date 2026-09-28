import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, Lightbulb, MessageSquareWarning, ChevronRight, CircleHelp, X, Bell } from 'lucide-react'
import { useMe, useNews } from '@/shared/api/hooks'
import { Screen } from '@/shared/ui/Screen'
import { Button } from '@/shared/ui/Button'
import { BonusGauge } from '@/widgets/BonusGauge'
import { QuickActions } from '@/widgets/QuickActions'
import { RateBanner } from '@/widgets/RateBanner'
import { MethanePriceCard } from '@/widgets/MethanePriceCard'
import { useI18n } from '@/app/providers/I18nProvider'
import { formatMoney } from '@/shared/lib/format'
import { useAppStore } from '@/shared/config/appStore'
import { FeedbackSheet, type FeedbackKind } from '@/features/feedback/FeedbackSheet'

export function HomePage() {
  const navigate = useNavigate()
  const { data: me } = useMe()
  const { t, locale } = useI18n()

  const [feedback, setFeedback] = useState<FeedbackKind | null>(null)
  const spendDisabled = !me || me.balance < me.spendMinAmount

  return (
    <Screen>
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[15px] font-bold text-[var(--color-primary)]">
            {(me?.firstName ?? '?').charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-[12.5px] text-[var(--color-ink-tertiary)]">{t('home.hello')}</p>
            <p className="text-[17px] font-bold leading-tight text-[var(--color-ink)]">{me?.firstName ?? '—'}</p>
          </div>
        </div>
        <NewsBell />
      </div>

      <div className="mt-4 rounded-3xl bg-[var(--color-surface)] p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <BonusGauge />

        <div className="mt-4 space-y-2.5">
          <Button
            variant="gradient"
            disabled={spendDisabled}
            onClick={() => navigate('/spend')}
            className="flex items-center justify-center gap-2"
          >
            <Wallet size={20} />
            {t('home.spend')}
          </Button>
          {spendDisabled && me && (
            <p className="text-center text-[12.5px] text-[var(--color-ink-tertiary)]">
              {t('home.spend_min', { min: formatMoney(me.spendMinAmount, locale) })}
            </p>
          )}
        </div>
      </div>

      <QuickActions />

      <div className="mb-2.5 mt-6 flex items-center justify-between">
        <p className="text-[15px] font-bold text-[var(--color-ink)]">{t('home.prices_title')}</p>
        <button onClick={() => navigate('/promotions')} className="text-[13px] font-semibold text-[var(--color-primary)]">
          {t('home.history_all')}
        </button>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        <RateBanner />
        <MethanePriceCard />
      </div>

      <HowCard />

      <div className="mt-6">
        <h2 className="mb-2.5 text-[15px] font-semibold text-[var(--color-ink)]">{t('home.feedback_title')}</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <FeedbackTile
            icon={<Lightbulb size={20} />}
            title={t('feedback.suggestion')}
            hint={t('home.suggestion_hint')}
            tone="primary"
            onClick={() => setFeedback('suggestion')}
          />
          <FeedbackTile
            icon={<MessageSquareWarning size={20} />}
            title={t('feedback.complaint')}
            hint={t('home.complaint_hint')}
            tone="danger"
            onClick={() => setFeedback('complaint')}
          />
        </div>
      </div>

      <FeedbackSheet open={feedback !== null} initialKind={feedback ?? 'suggestion'} onClose={() => setFeedback(null)} />
    </Screen>
  )
}

function FeedbackTile({
  icon,
  title,
  hint,
  tone,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  hint: string
  tone: 'primary' | 'danger'
  onClick: () => void
}) {
  const toneCls =
    tone === 'primary'
      ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
      : 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-3 rounded-2xl bg-[var(--color-surface)] p-4 text-left transition-transform duration-150 active:scale-[0.97]"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex w-full items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneCls}`}>{icon}</span>
        <ChevronRight size={18} className="text-[var(--color-ink-tertiary)]" />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-[var(--color-ink)]">{title}</p>
        <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-tertiary)]">{hint}</p>
      </div>
    </button>
  )
}

/** Entry to the /guide page; the X hides it for good (persisted), guide stays reachable from Profil. */
function HowCard() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const dismissed = useAppStore((s) => s.howCardDismissed)
  const dismiss = useAppStore((s) => s.dismissHowCard)
  if (dismissed) return null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate('/guide')}
      onKeyDown={(e) => e.key === 'Enter' && navigate('/guide')}
      className="relative mt-4 cursor-pointer rounded-2xl bg-[var(--color-surface)] p-4 transition-transform duration-150 active:scale-[0.98]"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          dismiss()
        }}
        aria-label={t('common.close')}
        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-tertiary)] active:bg-[var(--color-border)]"
      >
        <X size={16} />
      </button>
      <div className="flex items-center gap-3 pr-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          <CircleHelp size={20} />
        </span>
        <div>
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">{t('home.how_title')}</p>
          <p className="text-[12.5px] text-[var(--color-ink-tertiary)]">{t('home.how_sub')}</p>
        </div>
      </div>
      <div className="mt-3.5 flex items-center gap-1 text-[12px] font-medium text-[var(--color-ink-secondary)]">
        {[t('home.how_s1'), t('home.how_s2'), t('home.how_s3')].map((label, i) => (
          <span key={label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-[var(--color-ink-tertiary)]" />}
            <span className="whitespace-nowrap rounded-lg bg-[var(--color-bg)] px-2 py-1">{label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/** 🔔 → /news, with a dot while there is a broadcast newer than the last one seen. */
function NewsBell() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { data } = useNews()
  const seenAt = useAppStore((s) => s.newsSeenAt)
  const latest = data?.[0]?.sentAt
  const unread = !!latest && (!seenAt || new Date(latest) > new Date(seenAt))

  return (
    <button
      onClick={() => navigate('/news')}
      aria-label={t('news.title')}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-ink-secondary)] active:bg-[var(--color-border)]"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <Bell size={19} />
      {unread && (
        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-danger)]" />
      )}
    </button>
  )
}
