import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import { useHistoryPreview } from '@/shared/api/hooks'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { HistoryRow } from './HistoryRow'
import { EntryDetailSheet } from './EntryDetailSheet'
import { useI18n } from '@/app/providers/I18nProvider'
import type { HistoryEntryType } from '@/entities/receipt'

export function HistoryPreview() {
  const { data, isLoading } = useHistoryPreview()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [selected, setSelected] = useState<{ type: HistoryEntryType; id: string } | null>(null)

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">{t('home.history')}</h2>
        {data && data.items.length > 0 && (
          <button
            onClick={() => navigate('/history')}
            className="text-[14px] font-medium text-[var(--color-primary)] active:opacity-70"
          >
            {t('home.history_all')}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2 py-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState icon={<Receipt size={26} />} title={t('home.history_empty')} />
      ) : (
        <div className="rounded-2xl bg-[var(--color-surface)] px-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          {data.items.map((entry) => (
            <HistoryRow key={entry.id} entry={entry} onClick={() => setSelected({ type: entry.type, id: entry.id })} />
          ))}
        </div>
      )}

      {selected && <EntryDetailSheet type={selected.type} id={selected.id} onClose={() => setSelected(null)} />}
    </div>
  )
}
