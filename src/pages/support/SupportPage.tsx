import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquarePlus } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'
import { FeedbackSheet } from '@/features/feedback/FeedbackSheet'
import { BlockedNotice } from '@/features/support/BlockedNotice'
import { useMe, useSupportThreads } from '@/shared/api/hooks'
import { formatWhen } from '@/shared/lib/formatTime'
import { cn } from '@/shared/lib/cn'
import { useI18n } from '@/app/providers/I18nProvider'
import type { DictKey } from '@/shared/config/dictionaries'

const KIND: Record<string, DictKey> = { suggestion: 'support.kind.suggestion', complaint: 'support.kind.complaint', appeal: 'support.kind.appeal' }

/** "Murojaatlar": everything the client has written to support, with answers marked. */
export function SupportPage() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { data: me } = useMe()
  const { data: threads, isLoading } = useSupportThreads()
  const [writing, setWriting] = useState(false)

  return (
    <Screen padded={false}>
      <PageHeader title={t('support.title')} />
      <div className="px-4 pb-8">
        <BlockedNotice />
        <Button variant={me?.cardBlocked ? 'ghost' : 'gradient'} onClick={() => setWriting(true)} className="mb-4 flex items-center justify-center gap-2">
          <MessageSquarePlus size={19} /> {t(me?.cardBlocked ? 'support.new_appeal' : 'support.new')}
        </Button>

        {isLoading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : !threads || threads.length === 0 ? (
          <p className="py-14 text-center text-[14px] text-[var(--color-ink-tertiary)]">{t('support.empty')}</p>
        ) : (
          <ul className="space-y-2.5">
            {threads.map((th) => (
              <li key={th.id}>
                <button
                  onClick={() => navigate(`/support/${th.id}`)}
                  className="w-full rounded-2xl bg-[var(--color-surface)] p-4 text-left active:opacity-90"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-ink)]">
                      {th.unread && <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-danger)]" aria-label={t('support.unread')} />}
                      {t(KIND[th.kind])}
                    </span>
                    <span className="text-[11.5px] text-[var(--color-ink-tertiary)]">{formatWhen(th.lastActivityAt, locale)}</span>
                  </div>
                  <p className={cn('mt-1.5 line-clamp-2 break-words text-[14px]', th.unread ? 'font-medium text-[var(--color-ink)]' : 'text-[var(--color-ink-secondary)]')}>
                    {th.lastSender === 'staff' && <span className="text-[var(--color-primary)]">{t('support.operator')}: </span>}
                    {th.preview}
                  </p>
                  <span
                    className={cn(
                      'mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11.5px] font-medium',
                      th.status === 'open' ? 'bg-[var(--color-amber-soft)] text-[var(--color-amber)]' : 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
                    )}
                  >
                    {t(th.status === 'open' ? 'support.status.open' : 'support.status.resolved')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <FeedbackSheet open={writing} onClose={() => setWriting(false)} />
    </Screen>
  )
}
