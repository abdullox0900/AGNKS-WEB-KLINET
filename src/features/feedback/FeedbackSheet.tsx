import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sheet } from '@/shared/ui/Sheet'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/Toast'
import { apiSendFeedback } from '@/shared/api/client'
import { useMe } from '@/shared/api/hooks'
import { useSWRConfig } from 'swr'
import { cn } from '@/shared/lib/cn'
import { useI18n } from '@/app/providers/I18nProvider'

export type FeedbackKind = 'suggestion' | 'complaint'

/** "Taklif va shikoyat" bottom sheet — opened from Home tiles and from Settings. */
export function FeedbackSheet({
  open,
  onClose,
  initialKind = 'suggestion',
}: {
  open: boolean
  onClose: () => void
  initialKind?: FeedbackKind
}) {
  const { t } = useI18n()
  const { data: me } = useMe()
  return (
    <Sheet open={open} onClose={onClose} title={t(me?.cardBlocked ? 'support.kind.appeal' : 'feedback.title')}>
      {/* key resets the form each time it's opened with a different preset kind */}
      <FeedbackForm key={`${open}-${initialKind}`} initialKind={initialKind} onSent={onClose} />
    </Sheet>
  )
}

function FeedbackForm({ initialKind, onSent }: { initialKind: FeedbackKind; onSent: () => void }) {
  const { show } = useToast()
  const { t } = useI18n()
  const navigate = useNavigate()
  const { mutate } = useSWRConfig()
  const { data: me } = useMe()
  const blocked = !!me?.cardBlocked
  const [kind, setKind] = useState<FeedbackKind>(initialKind)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!message.trim() || submitting) return
    setSubmitting(true)
    try {
      const { id } = await apiSendFeedback({ kind, message: message.trim() })
      show(t('feedback.sent'))
      onSent()
      void mutate('/me/feedback')
      navigate(`/support/${id}`) // the conversation opens right away; the answer shows up there
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 pb-6">
      {blocked && <p className="rounded-2xl bg-[var(--color-danger-soft)] px-4 py-3 text-[13.5px] leading-relaxed text-[var(--color-ink)]">{t('support.appeal_hint')}</p>}
      <div className={cn('flex gap-2', blocked && 'hidden')}>
        {(['suggestion', 'complaint'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={cn(
              'flex-1 rounded-2xl border px-4 py-3 text-[14px] font-medium',
              kind === k ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-ink-secondary)]',
            )}
          >
            {t(k === 'suggestion' ? 'feedback.suggestion' : 'feedback.complaint')}
          </button>
        ))}
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
        rows={6}
        placeholder={t(blocked ? 'support.appeal_ph' : kind === 'suggestion' ? 'feedback.ph_suggestion' : 'feedback.ph_complaint')}
        className="w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3.5 text-[15px] text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
      />
      <p className="text-right text-[11px] text-[var(--color-ink-tertiary)]">{message.length}/1000</p>
      <Button className="w-full" loading={submitting} disabled={!message.trim()} onClick={handleSubmit}>
        {t('feedback.send')}
      </Button>
    </div>
  )
}
