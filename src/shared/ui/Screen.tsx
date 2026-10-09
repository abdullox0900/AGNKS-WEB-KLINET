import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function Screen({
  children,
  className,
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    // Top inset lives on the outer wrapper (not the customizable inner div) so it never
    // collides with a page's own pt-* — covers the notch and, in Telegram fullscreen,
    // Telegram's overlay controls (see --app-inset-top in index.css).
    <div className="mx-auto min-h-full w-full max-w-[480px] pt-[var(--app-inset-top)]">
      <div className={cn(padded && 'px-4 pb-8', className)}>{children}</div>
    </div>
  )
}

export function FixedBottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="page-strip fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px] px-4 pb-[max(16px,var(--app-inset-bottom))] pt-3">
      {children}
    </div>
  )
}
