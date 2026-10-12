import { useState } from 'react'
import useSWR from 'swr'
import { Check } from 'lucide-react'
import { Sheet } from '@/shared/ui/Sheet'
import { Button } from '@/shared/ui/Button'
import { apiAnswerReferral, apiGetReferralOptions } from '@/shared/api/client'
import { useMe } from '@/shared/api/hooks'
import { useI18n } from '@/app/providers/I18nProvider'
import { cn } from '@/shared/lib/cn'

const OTHER = 'other'

/**
 * "Sizni kim taklif qildi?" — asked once, right after a NEW client registers, while the Dashboard switch is on.
 * Pick the fuel-station attendant from the list, type a name, or skip. Closing it by dragging only hides it for
 * this visit (it comes back next time); "O'tkazib yuborish" records the skip for good.
 */
export function ReferralSheet() {
  const { t } = useI18n()
  const { data: me, mutate } = useMe()
  const [hidden, setHidden] = useState(false)
  const ask = !!me?.referralAsk && !hidden
  const { data: options } = useSWR(ask ? '/me/referral/options' : null, apiGetReferralOptions)

  const [stationId, setStationId] = useState<string | null>(null)
  const [choice, setChoice] = useState<string | null>(null) // attendant id, or OTHER
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)

  const stations = options?.stations ?? []
  const station = stations.find((s) => s.id === stationId) ?? stations[0]
  const hasList = stations.length > 0
  const typing = choice === OTHER || !hasList
  const ready = typing ? typed.trim().length >= 2 : !!choice

  async function send(answer: Parameters<typeof apiAnswerReferral>[0]) {
    setBusy(true)
    try {
      await apiAnswerReferral(answer)
      await mutate()
    } catch {
      setHidden(true) // never trap the client behind a question
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={ask} onClose={() => setHidden(true)} title={t('ref.title')}>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">{t('ref.desc')}</p>

      {hasList && stations.length > 1 && (
        <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
          {stations.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setStationId(s.id)
                setChoice(null)
              }}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                (station?.id === s.id) ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-ink-secondary)]',
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {hasList && station && (
        <ul className="mb-3 space-y-2">
          {station.attendants.map((a) => (
            <Row key={a.id} label={a.name} selected={choice === a.id} onSelect={() => setChoice(a.id)} />
          ))}
          <Row label={t('ref.other')} selected={choice === OTHER} onSelect={() => setChoice(OTHER)} muted />
        </ul>
      )}

      {typing && (
        <input
          value={typed}
          maxLength={60}
          autoFocus={hasList}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={t('ref.type_ph')}
          className="mb-3 h-12 w-full rounded-2xl border border-[var(--color-border)] bg-transparent px-4 text-[15px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-tertiary)] focus:border-[var(--color-primary)]"
        />
      )}

      <div className="space-y-2 pb-1 pt-1">
        <Button
          disabled={!ready}
          loading={busy}
          onClick={() => void send(typing ? { name: typed.trim() } : { attendantId: choice! })}
        >
          {t('ref.send')}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => void send({ skip: true })}>
          {t('ref.skip')}
        </Button>
      </div>
    </Sheet>
  )
}

function Row({ label, selected, onSelect, muted }: { label: string; selected: boolean; onSelect: () => void; muted?: boolean }) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-left text-[15px] transition-colors',
          selected ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] font-semibold text-[var(--color-ink)]' : 'border-[var(--color-border)]',
          !selected && (muted ? 'text-[var(--color-ink-tertiary)]' : 'text-[var(--color-ink)]'),
        )}
      >
        <span className="truncate">{label}</span>
        {selected && <Check size={18} className="shrink-0 text-[var(--color-primary)]" />}
      </button>
    </li>
  )
}
