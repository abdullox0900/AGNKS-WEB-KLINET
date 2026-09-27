import { useEffect } from 'react'
import { Bell, Megaphone } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { useI18n } from '@/app/providers/I18nProvider'
import { useAppStore } from '@/shared/config/appStore'
import { useNews } from '@/shared/api/hooks'
import { formatDateGroup, formatTime } from '@/shared/lib/format'

export function NewsPage() {
  const { t, locale } = useI18n()
  const { data, isLoading, error, mutate } = useNews()
  const markNewsSeen = useAppStore((s) => s.markNewsSeen)

  // Opening the feed clears the 🔔 dot on Home.
  useEffect(() => {
    if (data?.[0]) markNewsSeen(data[0].sentAt)
  }, [data, markNewsSeen])

  return (
    <Screen padded={false}>
      <PageHeader title={t('news.title')} />
      <div className="space-y-2.5 px-4 pb-8">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </>
        ) : error ? (
          <ErrorState message={t('common.error_generic')} onRetry={() => mutate()} />
        ) : !data?.length ? (
          <EmptyState
            icon={<Bell size={28} />}
            title={t('news.empty')}
            action={<p className="max-w-[260px] text-[13px] text-[var(--color-ink-tertiary)]">{t('news.empty_hint')}</p>}
          />
        ) : (
          data.map((item) => {
            const at = new Date(item.sentAt)
            const text = locale === 'ru' && item.textRu ? item.textRu : item.textUz
            return (
              <article
                key={item.id}
                className="rounded-2xl bg-[var(--color-surface)] p-4"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="mb-2 flex items-center gap-2 text-[12px] text-[var(--color-ink-tertiary)]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                    <Megaphone size={13} />
                  </span>
                  {formatDateGroup(at, locale)}, {formatTime(at)}
                </div>
                <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-[var(--color-ink)]">{text}</p>
              </article>
            )
          })
        )}
      </div>
    </Screen>
  )
}
