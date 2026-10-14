import { useNavigate } from 'react-router-dom'
import { Ban } from 'lucide-react'
import { useMe } from '@/shared/api/hooks'
import { useI18n } from '@/app/providers/I18nProvider'

/**
 * Shown on the main screens while the card is blocked: says so in red, gives the reason the SEO wrote, and offers the
 * one thing a blocked client can still do — write to support (it becomes an "appeal" in the dashboard).
 */
export function BlockedNotice() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { data: me } = useMe()
  if (!me?.cardBlocked) return null
  return (
    <div className="mb-4 rounded-2xl border border-[var(--color-danger)]/40 bg-[var(--color-danger-soft)] p-4" role="alert">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-danger)]/15 text-[var(--color-danger)]">
          <Ban size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-[var(--color-danger)]">{t('blocked.title')}</p>
          <p className="mt-1 break-words text-[13.5px] leading-relaxed text-[var(--color-ink)]">
            {me.blockedReason ? t('blocked.reason', { reason: me.blockedReason }) : t('blocked.no_reason')}
          </p>
          <p className="mt-1 text-[12.5px] text-[var(--color-ink-secondary)]">{t('blocked.hint')}</p>
        </div>
      </div>
      <button
        onClick={() => navigate('/support')}
        className="mt-3 h-11 w-full rounded-xl bg-[var(--color-danger)] text-[14.5px] font-semibold text-white active:opacity-85"
      >
        {t('blocked.write')}
      </button>
    </div>
  )
}
