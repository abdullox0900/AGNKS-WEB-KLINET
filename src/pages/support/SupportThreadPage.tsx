import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSWRConfig } from 'swr'
import { Send } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useToast } from '@/shared/ui/Toast'
import { apiReplySupport } from '@/shared/api/client'
import { useSupportThread } from '@/shared/api/hooks'
import { formatClock, formatWhen } from '@/shared/lib/formatTime'
import { cn } from '@/shared/lib/cn'
import { useI18n } from '@/app/providers/I18nProvider'
import type { DictKey } from '@/shared/config/dictionaries'

const KIND: Record<string, DictKey> = { suggestion: 'support.kind.suggestion', complaint: 'support.kind.complaint', appeal: 'support.kind.appeal' }

/** One conversation with support: your messages on the right, the operator's answers on the left. */
export function SupportThreadPage() {
  const { id } = useParams()
  const { t, locale } = useI18n()
  const { show } = useToast()
  const { mutate: globalMutate } = useSWRConfig()
  const { data: thread, isLoading, mutate } = useSupportThread(id)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const count = thread?.messages.length ?? 0

  // opening the thread marked the answers as read on the server — refresh the badges in the app
  useEffect(() => {
    if (thread) void globalMutate('/me')
  }, [thread?.id, count]) // eslint-disable-line react-hooks/exhaustive-deps

  // keep the newest message in view
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [count])

  async function send() {
    const message = text.trim()
    if (!message || !id || sending) return
    setSending(true)
    try {
      await apiReplySupport(id, message)
      setText('')
      await mutate()
      void globalMutate('/me/feedback')
    } catch {
      show(t('common.error_generic'))
    } finally {
      setSending(false)
    }
  }

  return (
    <Screen padded={false}>
      <PageHeader title={thread ? t(KIND[thread.kind]) : t('support.title')} />
      <div className="px-4 pb-[calc(88px+var(--app-inset-bottom))]">
        {isLoading || !thread ? (
          <div className="space-y-3 pt-2">
            <Skeleton className="h-16 w-3/4 rounded-2xl" />
            <Skeleton className="ml-auto h-12 w-2/3 rounded-2xl" />
          </div>
        ) : (
          <>
            <ul className="space-y-2.5 pt-2">
              {thread.messages.map((m) => {
                const mine = m.sender === 'client'
                return (
                  <li key={m.id} className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
                    <div
                      className={cn(
                        'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-snug',
                        mine ? 'rounded-br-md bg-[var(--color-primary)] text-[var(--color-primary-ink)]' : 'rounded-bl-md bg-[var(--color-surface)] text-[var(--color-ink)]',
                      )}
                      style={mine ? undefined : { boxShadow: 'var(--shadow-card)' }}
                    >
                      {!mine && <span className="mb-0.5 block text-[11.5px] font-semibold text-[var(--color-primary)]">{t('support.operator')}</span>}
                      {m.text}
                    </div>
                    <span className="mt-0.5 px-1 text-[11px] text-[var(--color-ink-tertiary)]">{new Date(m.at).toDateString() === new Date().toDateString() ? formatClock(m.at, locale) : formatWhen(m.at, locale)}</span>
                  </li>
                )
              })}
            </ul>
            {thread.status === 'resolved' && <p className="mt-4 text-center text-[12.5px] text-[var(--color-ink-tertiary)]">{t('support.closed_hint')}</p>}
            <div ref={endRef} />
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px] border-t border-[var(--color-border)] bg-[var(--color-bg)] px-3 pb-[max(12px,var(--app-inset-bottom))] pt-2.5">
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void send()
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 1000))}
            rows={1}
            placeholder={t('support.input_ph')}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-[15px] text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            aria-label={t('feedback.send')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-primary-ink)] transition-opacity disabled:opacity-40"
          >
            <Send size={19} />
          </button>
        </form>
      </div>
    </Screen>
  )
}
