import { Delete } from 'lucide-react'
import { tgImpact } from '@/shared/lib/telegram'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'back'] as const

export function NumericKeypad({ onKey, maxDigits = 9 }: { onKey: (key: string) => void; maxDigits?: number }) {
  void maxDigits
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          onClick={() => {
            tgImpact('light')
            onKey(key)
          }}
          className="flex h-14 items-center justify-center rounded-2xl bg-[var(--color-surface)] text-[20px] font-semibold text-[var(--color-ink)] active:bg-[var(--color-border)]"
        >
          {key === 'back' ? <Delete size={22} /> : key}
        </button>
      ))}
    </div>
  )
}
