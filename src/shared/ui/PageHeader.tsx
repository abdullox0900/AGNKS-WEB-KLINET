import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useBackButton } from '@/shared/lib/useBackButton'
import { useI18n } from '@/app/providers/I18nProvider'

export function PageHeader({
  title,
  onBack,
  right,
  back = true,
}: {
  title: string
  onBack?: () => void
  right?: ReactNode
  /** false on bottom-bar tab pages — the bar is the navigation there. */
  back?: boolean
}) {
  const { showFallback, goBack } = useBackButton(onBack, back)
  const { t } = useI18n()

  return (
    // Screen already pads the top by --app-inset-top; the sticky header takes that space
    // over (negative margin + same padding) so it isn't counted twice, and so the header
    // stays opaque under Telegram's fullscreen controls while the page scrolls beneath.
    <div className="page-strip sticky top-0 z-20 -mt-[var(--app-inset-top)] pt-[var(--app-inset-top)]">
      <div className="flex h-14 items-center gap-2 px-4">
        {showFallback && (
          <button
            onClick={goBack}
            aria-label={t('common.back')}
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full active:bg-[var(--color-border)]"
          >
            <ChevronLeft size={24} className="text-[var(--color-ink)]" />
          </button>
        )}
        <h1 className="flex-1 truncate text-[17px] font-semibold text-[var(--color-ink)]">{title}</h1>
        {right}
      </div>
    </div>
  )
}
