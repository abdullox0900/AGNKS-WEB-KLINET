import { useState } from 'react'
import { Sheet } from '@/shared/ui/Sheet'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/Toast'
import { apiSendFeedback } from '@/shared/api/client'
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
  return (
    <Sheet open={open} onClose={onClose} title={t('feedback.title')}>
      {/* key resets the form each time it's opened with a different preset kind */}
      <FeedbackForm key={`${open}-${initialKind}`} initialKind={initialKind} onSent={onClose} />
    </Sheet>
  )
}

function FeedbackForm({ initialKind, onSent }: { initialKind: FeedbackKind; onSent: () => void }) {
  const { show } = useToast()
  const { t } = useI18n()
  const [kind, setKind] = useState<FeedbackKind>(initialKind)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!message.trim() || submitting) return
    setSubmitting(true)
    try {
      await apiSendFeedback({ kind, message: message.trim() })
      show(t('feedback.sent'))
      onSent()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex gap-2">
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
        placeholder={t(kind === 'suggestion' ? 'feedback.ph_suggestion' : 'feedback.ph_complaint')}
        className="w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3.5 text-[15px] text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
      />
      <p className="text-right text-[11px] text-[var(--color-ink-tertiary)]">{message.length}/1000</p>
      <Button className="w-full" loading={submitting} disabled={!message.trim()} onClick={handleSubmit}>
        {t('feedback.send')}
      </Button>
    </div>
  )
}
