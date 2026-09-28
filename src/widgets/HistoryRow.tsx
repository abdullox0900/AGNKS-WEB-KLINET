import type { HistoryEntry } from '@/entities/receipt'
import { formatSignedMoney, formatTime } from '@/shared/lib/format'
import { useI18n } from '@/app/providers/I18nProvider'
import { cn } from '@/shared/lib/cn'

const STATUS_KEY: Record<string, string> = {
  pending: 'history.status.pending',
  rejected: 'history.status.rejected',
  dispute: 'history.status.dispute',
  reversed: 'history.status.reversed',
}

export function HistoryRow({ entry, onClick }: { entry: HistoryEntry; onClick: () => void }) {
  const { t, locale } = useI18n()
  const statusKey = STATUS_KEY[entry.status]

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-[var(--color-border)] py-3.5 text-left last:border-b-0 active:bg-[var(--color-surface)]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-[var(--color-ink)]">{entry.stationName}</p>
        <p className="mt-0.5 text-[13px] text-[var(--color-ink-tertiary)]">
          {formatTime(new Date(entry.createdAt))}
          {statusKey && <span className="text-[var(--color-ink-secondary)]"> · {t(statusKey as never)}</span>}
        </p>
      </div>
      <p
        className={cn(
          'tnum shrink-0 text-[15px] font-semibold',
          entry.amount > 0 ? 'text-[var(--color-money)]' : 'text-[var(--color-ink)]',
        )}
      >
        {formatSignedMoney(entry.amount, locale)}
      </p>
    </button>
  )
}
