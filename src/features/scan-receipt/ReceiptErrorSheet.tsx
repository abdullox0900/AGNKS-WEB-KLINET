import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Sheet } from '@/shared/ui/Sheet'
import { Button } from '@/shared/ui/Button'
import { useI18n } from '@/app/providers/I18nProvider'
import { getErrorCopy, type ErrorAction } from './errorCopy'
import type { ReceiptErrorCode } from '@/entities/receipt'
import { tgOpenLink } from '@/shared/lib/telegram'

const ACTION_LABEL: Record<ErrorAction, { uz: string; ru: string }> = {
  rescan: { uz: 'Qayta skanerlash', ru: 'Сканировать снова' },
  stations: { uz: 'Filiallar ro\'yxati', ru: 'Список филиалов' },
  close: { uz: 'Yopish', ru: 'Закрыть' },
  edit_amount: { uz: 'Summani o\'zgartirish', ru: 'Изменить сумму' },
  location: { uz: 'Ruxsat berish', ru: 'Разрешить' },
  contact: { uz: "Bog'lanish", ru: 'Связаться' },
  retry: { uz: 'Qayta urinish', ru: 'Повторить' },
}

export function ReceiptErrorSheet({
  code,
  meta,
  onClose,
  onRetry,
  onEditAmount,
  onLocation,
}: {
  code: ReceiptErrorCode | null
  meta?: Record<string, string | number>
  onClose: () => void
  onRetry?: () => void
  onEditAmount?: () => void
  onLocation?: () => void
}) {
  const navigate = useNavigate()
  const { locale } = useI18n()
  if (!code) return null
  const copy = getErrorCopy(code, locale, meta)

  function handleAction(action: ErrorAction) {
    switch (action) {
      case 'rescan':
        onClose()
        onRetry?.()
        break
      case 'stations':
        onClose()
        navigate('/stations')
        break
      case 'edit_amount':
        onClose()
        onEditAmount?.()
        break
      case 'location':
        onClose()
        onLocation?.()
        break
      case 'contact':
        tgOpenLink('https://t.me/agnks_support')
        break
      case 'retry':
        onClose()
        onRetry?.()
        break
      case 'close':
      default:
        onClose()
    }
  }

  return (
    <Sheet open={!!code} onClose={onClose}>
      <div className="flex flex-col items-center pb-6 pt-2 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-warning-soft)]">
          <AlertTriangle size={26} className="text-[var(--color-amber)]" />
        </div>
        <h2 className="mb-1.5 text-[17px] font-semibold text-[var(--color-ink)]">{copy.title}</h2>
        <p className="mb-6 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">{copy.message}</p>
        <div className="w-full space-y-2">
          {copy.actions.map((action, i) => (
            <Button
              key={action}
              variant={i === 0 ? 'primary' : 'ghost'}
              onClick={() => handleAction(action)}
            >
              {locale === 'ru' ? ACTION_LABEL[action].ru : ACTION_LABEL[action].uz}
            </Button>
          ))}
        </div>
      </div>
    </Sheet>
  )
}
