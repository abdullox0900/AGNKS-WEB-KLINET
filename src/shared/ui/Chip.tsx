import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-9 shrink-0 rounded-full px-4 text-[14px] font-medium transition-colors',
        active
          ? 'bg-[var(--color-ink)] text-[var(--color-bg)]'
          : 'bg-[var(--color-surface)] text-[var(--color-ink-secondary)] border border-[var(--color-border)]',
      )}
    >
      {children}
    </button>
  )
}
