import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/shared/lib/cn'

export function SpendQr({ value, dim }: { value: string; dim?: boolean }) {
  return (
    <div
      className={cn(
        'flex h-[240px] w-[240px] items-center justify-center rounded-3xl bg-white p-4 transition-opacity duration-300',
        dim && 'opacity-30',
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <QRCodeSVG value={value} size={208} level="M" />
    </div>
  )
}
