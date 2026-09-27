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
    // Telegram's fullscreen/expanded Mini App mode extends content behind the device's
    // own status bar/notch — pad for that (env(safe-area-inset-top)) so the header
    // never renders underneath it, on top of the header's own fixed height.
    <div className="sticky top-0 z-20 bg-[var(--color-bg)] pt-[env(safe-area-inset-top)]">
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
