import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useBackButton } from '@/shared/lib/useBackButton'

export function PageHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  const { showFallback, goBack } = useBackButton(onBack)

  return (
    // Telegram's fullscreen/expanded Mini App mode extends content behind the device's
    // own status bar/notch — pad for that (env(safe-area-inset-top)) so the header
    // never renders underneath it, on top of the header's own fixed height.
    <div className="sticky top-0 z-20 bg-[var(--color-bg)] pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center gap-2 px-4">
        {showFallback && (
          <button
            onClick={goBack}
            aria-label="Orqaga"
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
