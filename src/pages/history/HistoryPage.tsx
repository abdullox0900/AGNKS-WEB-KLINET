import { useMemo, useState } from 'react'
import useSWRInfinite from 'swr/infinite'
import { Receipt } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { Chip } from '@/shared/ui/Chip'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { HistoryRow } from '@/widgets/HistoryRow'
import { EntryDetailSheet } from '@/widgets/EntryDetailSheet'
import { useI18n } from '@/app/providers/I18nProvider'
import { apiGetHistory } from '@/shared/api/client'
import { formatDateGroup } from '@/shared/lib/format'
import type { HistoryEntry, HistoryEntryType } from '@/entities/receipt'

type Filter = 'all' | 'earn' | 'spend'

export function HistoryPage() {
  const { t, locale } = useI18n()
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<{ type: HistoryEntryType; id: string } | null>(null)

  const getKey = (pageIndex: number, prev: { items: HistoryEntry[]; nextCursor: string | null } | null) => {
    if (pageIndex === 0) return ['history', filter, null]
    if (!prev?.nextCursor) return null
    return ['history', filter, prev.nextCursor]
  }

  const { data, isLoading, isValidating, size, setSize } = useSWRInfinite(
    getKey,
    ([, f, cursor]) => apiGetHistory({ filter: f as Filter, cursor: cursor ?? undefined, limit: 15 }),
  )

  const items = useMemo(() => data?.flatMap((p) => p.items) ?? [], [data])
  const hasMore = data ? !!data[data.length - 1]?.nextCursor : false

  const groups = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>()
    for (const item of items) {
      const key = formatDateGroup(new Date(item.createdAt), locale)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return Array.from(map.entries())
  }, [items, locale])

  return (
    <Screen padded={false}>
      <PageHeader title={t('history.title')} back={false} />
      <div className="flex gap-2 overflow-x-auto px-4 pb-3">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          {t('history.all')}
        </Chip>
        <Chip active={filter === 'earn'} onClick={() => setFilter('earn')}>
          {t('history.earned')}
        </Chip>
        <Chip active={filter === 'spend'} onClick={() => setFilter('spend')}>
          {t('history.spent')}
        </Chip>
      </div>

      <div className="px-4">
        {isLoading ? (
          <div className="space-y-2 pt-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={<Receipt size={26} />} title={t('history.empty')} />
        ) : (
          <div>
            {groups.map(([label, entries]) => (
              <div key={label}>
                <p className="sticky top-14 z-10 bg-[var(--color-bg)] py-2 text-[13px] font-semibold text-[var(--color-ink-tertiary)]">
                  {label}
                </p>
                <div className="rounded-2xl bg-[var(--color-surface)] px-4">
                  {entries.map((entry) => (
                    <HistoryRow key={entry.id} entry={entry} onClick={() => setSelected({ type: entry.type, id: entry.id })} />
                  ))}
                </div>
              </div>
            ))}
            {hasMore && (
              <button
                onClick={() => setSize(size + 1)}
                disabled={isValidating}
                className="mt-4 w-full py-3 text-center text-[14px] font-medium text-[var(--color-primary)]"
              >
                {isValidating ? t('common.loading') : t('home.history_all')}
              </button>
            )}
          </div>
        )}
      </div>

      {selected && <EntryDetailSheet type={selected.type} id={selected.id} onClose={() => setSelected(null)} />}
    </Screen>
  )
}
