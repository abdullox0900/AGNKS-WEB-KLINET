import useSWR from 'swr'
import { Sheet } from '@/shared/ui/Sheet'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useI18n } from '@/app/providers/I18nProvider'
import { apiGetHistoryEntry } from '@/shared/api/client'
import { formatDate, formatMoney, formatSignedMoney, formatTime } from '@/shared/lib/format'
import type { HistoryEntryType } from '@/entities/receipt'

const STATUS_KEY: Record<string, string> = {
  pending: 'history.status.pending',
  rejected: 'history.status.rejected',
  dispute: 'history.status.dispute',
  reversed: 'history.status.reversed',
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border)] py-3 last:border-b-0">
      <span className="text-[13px] text-[var(--color-ink-secondary)]">{label}</span>
      <span className="tnum max-w-[60%] truncate text-right text-[14px] font-medium text-[var(--color-ink)]">{value}</span>
    </div>
  )
}

/** Receipt/spend detail, shown as a sheet over whatever page it was opened from
 * (Home or History) instead of navigating to a separate route — the list behind
 * it stays mounted and visible. Disputing a specific transaction was replaced by
 * the general "Taklif va shikoyat" page (see settings) — no per-entry action here. */
export function EntryDetailSheet({
  type,
  id,
  onClose,
}: {
  type: HistoryEntryType
  id: string
  onClose: () => void
}) {
  const { t, locale } = useI18n()
  const { data: entry } = useSWR(`/history/entry/${type}/${id}`, () => apiGetHistoryEntry(type, id))

  return (
    <Sheet open onClose={onClose} title={type === 'earn' ? t('home.scan') : t('home.spend')}>
      <div className="pb-6">
        {!entry ? (
          <div className="space-y-2 pt-1">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <>
            <div className="mb-3 text-center">
              <p className={`tnum text-[28px] font-bold ${entry.amount > 0 ? 'text-[var(--color-money)]' : 'text-[var(--color-ink)]'}`}>
                {formatSignedMoney(entry.amount, locale)}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--color-bg)] px-4">
              <Row label={t('detail.station')} value={entry.stationName} />
              <Row
                label={t('detail.time')}
                value={`${formatDate(new Date(entry.createdAt), locale)}, ${formatTime(new Date(entry.createdAt))}`}
              />
              {entry.type === 'earn' ? (
                <>
                  {entry.receiptAmount != null && <Row label={t('detail.receipt_amount')} value={formatMoney(entry.receiptAmount, locale)} />}
                  {entry.ratePercent != null && <Row label={t('detail.rate')} value={`${entry.ratePercent}%`} />}
                  {entry.bonus != null && <Row label={t('detail.bonus')} value={formatMoney(entry.bonus, locale)} />}
                </>
              ) : (
                <>
                  {entry.cashierName && <Row label={t('detail.cashier')} value={entry.cashierName} />}
                  <Row label={t('detail.spent_amount')} value={formatMoney(Math.abs(entry.amount), locale)} />
                  {entry.balanceAfter != null && <Row label={t('detail.remaining')} value={formatMoney(entry.balanceAfter, locale)} />}
                </>
              )}
              {STATUS_KEY[entry.status] && <Row label={t('detail.status')} value={t(STATUS_KEY[entry.status] as never)} />}
              <Row label={t('detail.op_number')} value={entry.operationNumber} />
            </div>
          </>
        )}
      </div>
    </Sheet>
  )
}
