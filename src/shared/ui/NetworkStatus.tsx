import { useEffect, useRef, useState } from 'react'
import { useSWRConfig } from 'swr'
import { Snail, Wifi, WifiOff, X } from 'lucide-react'
import { useI18n } from '@/app/providers/I18nProvider'
import { useNetworkStore } from '@/shared/lib/network'
import { cn } from '@/shared/lib/cn'
import type { DictKey } from '@/shared/config/dictionaries'

type Shown = 'offline' | 'slow' | 'back' | null

const SLOW_SNOOZE_MS = 2 * 60_000
const BACK_VISIBLE_MS = 2_500

const STYLE: Record<Exclude<Shown, null>, { icon: typeof Wifi; tone: string; title: DictKey; desc: DictKey }> = {
  // fixed shades (not theme tokens) so white text stays readable in both themes
  offline: { icon: WifiOff, tone: 'bg-[#dc2626] text-white', title: 'net.offline_title', desc: 'net.offline_desc' },
  slow: { icon: Snail, tone: 'bg-[#d97706] text-white', title: 'net.slow_title', desc: 'net.slow_desc' },
  back: { icon: Wifi, tone: 'bg-[#16a34a] text-white', title: 'net.back_title', desc: 'net.back_desc' },
}

/**
 * App-wide connection notice sliding down from the top: stays while offline, a
 * dismissible heads-up when the connection is slow, and a short "back online" once
 * it recovers (which also refetches everything that failed meanwhile).
 */
export function NetworkStatus() {
  const { t } = useI18n()
  const { mutate } = useSWRConfig()
  const status = useNetworkStore((s) => s.status)
  const [shown, setShownState] = useState<Shown>(null)
  // last non-empty notice, kept rendered while the banner slides out
  const [content, setContent] = useState<Exclude<Shown, null>>('offline')
  const setShown = (v: Shown) => {
    if (v) setContent(v)
    setShownState(v)
  }
  const [snoozedUntil, setSnoozedUntil] = useState(0)
  const prev = useRef(status)

  useEffect(() => {
    const was = prev.current
    prev.current = status
    if (status === 'offline') return setShown('offline')
    if (status === 'slow') return setShown(Date.now() < snoozedUntil ? null : 'slow')
    if (was === 'offline') {
      void mutate(() => true)
      setShown('back')
      const timer = window.setTimeout(() => setShown(null), BACK_VISIBLE_MS)
      return () => window.clearTimeout(timer)
    }
    setShown(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, snoozedUntil, mutate])

  const s = STYLE[content]
  const Icon = s.icon

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[70] mx-auto flex max-w-[480px] justify-center px-3 pt-[calc(var(--app-inset-top)+8px)] transition-all duration-300 ease-out',
        shown ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
      )}
    >
      <div className={cn('pointer-events-auto flex w-full items-center gap-3 rounded-2xl px-4 py-3', s.tone)} style={{ boxShadow: 'var(--shadow-float)' }}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Icon size={19} className={cn(content === 'offline' && shown && 'animate-pulse')} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold leading-tight">{t(s.title)}</p>
          <p className="mt-0.5 text-[12.5px] leading-snug opacity-90">{t(s.desc)}</p>
        </div>
        {content === 'slow' && (
          <button
            onClick={() => {
              setSnoozedUntil(Date.now() + SLOW_SNOOZE_MS)
              setShown(null)
            }}
            aria-label={t('common.close')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full active:bg-white/20"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
