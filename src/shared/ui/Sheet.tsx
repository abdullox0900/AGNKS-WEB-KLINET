import type { ReactNode } from 'react'
import { Drawer } from 'vaul'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/** Bottom sheet built on vaul (https://vaul.emilkowal.ski/) for native-feeling
 * drag-to-dismiss and spring physics instead of a plain CSS slide-in. */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] w-full max-w-[480px] flex-col rounded-t-3xl bg-[var(--color-surface)] pb-[max(20px,env(safe-area-inset-bottom))] outline-none"
          style={{ boxShadow: 'var(--shadow-float)' }}
        >
          <div className="flex justify-center pt-3">
            <div className="h-1.5 w-10 rounded-full bg-[var(--color-border)]" />
          </div>
          {title ? (
            <Drawer.Title className="px-5 pt-3 pb-1 text-[17px] font-semibold text-[var(--color-ink)]">
              {title}
            </Drawer.Title>
          ) : (
            <Drawer.Title className="sr-only">Panel</Drawer.Title>
          )}
          <div className="overflow-y-auto px-5 pt-2">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
