import type { ReceiptErrorCode } from '@/entities/receipt'
import { formatMoney } from '@/shared/lib/format'

export type ErrorAction = 'rescan' | 'stations' | 'close' | 'edit_amount' | 'location' | 'contact' | 'retry'

interface ErrorCopy {
  title: string
  message: string
  actions: ErrorAction[]
}

export function getErrorCopy(
  code: ReceiptErrorCode,
  locale: 'uz' | 'ru',
  meta?: Record<string, string | number>,
): ErrorCopy {
  const isRu = locale === 'ru'

  switch (code) {
    case 'RECEIPT_QR_INVALID':
      return {
        title: isRu ? 'QR не распознан' : "QR o'qilmadi",
        message: isRu ? 'Это не QR-код фискального чека' : 'Bu fiskal chek QR kodi emas',
        actions: ['rescan'],
      }
    case 'RECEIPT_TERMINAL_UNKNOWN':
      return {
        title: isRu ? 'Другая АЗС' : 'Boshqa shoxobcha',
        message: isRu ? 'Этот чек не с наших АЗС' : 'Bu chek bizning shoxobchalarimizdan emas',
        actions: ['stations'],
      }
    case 'RECEIPT_ALREADY_USED':
      return {
        title: isRu ? 'Чек уже использован' : 'Chek ishlatilgan',
        message: isRu
          ? `По этому чеку бонус уже начислен — ${meta?.date ?? ''}, ${meta?.time ?? ''}`
          : `Bu chek bo'yicha bonus berilgan — ${meta?.date ?? ''}, ${meta?.time ?? ''}`,
        actions: ['close'],
      }
    case 'RECEIPT_EXPIRED':
      return {
        title: isRu ? 'Время истекло' : "Vaqt o'tgan",
        message: isRu
          ? `Чек нужно отсканировать в течение ${meta?.n ?? 30} минут`
          : `Chek ${meta?.n ?? 30} daqiqa ichida skanerlanishi kerak`,
        actions: ['close'],
      }
    case 'RECEIPT_TIME_INVALID':
      return {
        title: isRu ? 'Неверное время' : 'Vaqt noto\'g\'ri',
        message: isRu ? 'Проверьте время на чеке' : 'Chekdagi vaqtni tekshiring',
        actions: ['rescan'],
      }
    case 'RECEIPT_AMOUNT_OUT_OF_RANGE':
      return {
        title: isRu ? 'Проверьте сумму' : 'Summani tekshiring',
        message: isRu
          ? `От ${formatMoney(Number(meta?.min ?? 0), 'ru')} до ${formatMoney(Number(meta?.max ?? 0), 'ru')}`
          : `${formatMoney(Number(meta?.min ?? 0), 'uz')} dan ${formatMoney(Number(meta?.max ?? 0), 'uz')} gacha`,
        actions: ['edit_amount'],
      }
    case 'LOCATION_REQUIRED':
      return {
        title: isRu ? 'Нужна геолокация' : 'Joylashuv kerak',
        message: isRu
          ? 'Мы проверяем, что чек отсканирован на АЗС'
          : 'Chek shoxobchada skanerlanganini tekshiramiz',
        actions: ['location'],
      }
    case 'RECEIPT_PHOTO_REQUIRED':
      return {
        title: isRu ? 'Проблема с фото' : 'Surat bilan muammo',
        message: isRu ? 'Загрузите фото чека ещё раз' : 'Chek suratini qayta yuklang',
        actions: ['rescan'],
      }
    case 'LOCATION_TOO_FAR':
      return {
        title: isRu ? 'Вы далеко' : 'Uzoqdasiz',
        message: isRu ? 'Сканируйте, находясь рядом с АЗС' : 'Shoxobcha yaqinida bo\'lganingizda skanerlang',
        actions: ['close'],
      }
    case 'CARD_BLOCKED':
      return {
        title: isRu ? 'Карта заблокирована' : 'Karta bloklangan',
        message: isRu ? 'Свяжитесь с поддержкой' : "Qo'llab-quvvatlash bilan bog'laning",
        actions: ['contact'],
      }
    case 'RATE_LIMITED':
      return {
        title: isRu ? 'Подождите немного' : 'Biroz kuting',
        message: isRu ? 'Слишком много попыток. Через минуту' : "Juda ko'p urinish. Bir daqiqadan keyin",
        actions: ['close'],
      }
    case 'DISPUTE_ALREADY_OPEN':
      return {
        title: isRu ? 'Жалоба уже отправлена' : 'Shikoyat yuborilgan',
        message: isRu
          ? 'Жалоба по этой операции уже отправлена'
          : 'Bu operatsiya bo\'yicha shikoyat allaqachon yuborilgan',
        actions: ['close'],
      }
    case 'NETWORK_ERROR':
      return {
        title: isRu ? 'Нет связи' : 'Aloqa yo\'q',
        message: isRu ? 'Проверьте интернет-соединение' : 'Internet ulanishini tekshiring',
        actions: ['retry'],
      }
    case 'INTERNAL_ERROR':
    default:
      return {
        title: isRu ? 'Что-то не сработало' : 'Nimadir ishlamadi',
        message: isRu
          ? 'Попробуйте снова. Если повторится, напишите нам'
          : 'Qaytadan urinib ko\'ring. Takrorlansa, bizga yozing',
        actions: ['retry', 'contact'],
      }
  }
}
