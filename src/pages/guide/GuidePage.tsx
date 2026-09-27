import { useState, type ReactNode } from 'react'
import { ScanLine, Coins, Wallet, ChevronDown } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { Button } from '@/shared/ui/Button'
import { useMe, useRate } from '@/shared/api/hooks'
import { useI18n } from '@/app/providers/I18nProvider'
import { formatMoney } from '@/shared/lib/format'
import { useStartScan } from '@/features/scan-receipt/useStartScan'
import { cn } from '@/shared/lib/cn'

function Step({ n, icon, title, children, last }: { n: number; icon: ReactNode; title: string; children: ReactNode; last?: boolean }) {
  const { t } = useI18n()
  return (
    <div className="flex gap-4">
      {/* number rail with a connector line down to the next step */}
      <div className="flex flex-col items-center">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          {icon}
        </span>
        {!last && <span className="my-1.5 w-px flex-1 bg-[var(--color-border)]" />}
      </div>
      <div className={cn('pt-1', !last && 'pb-6')}>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-ink-tertiary)]">{t('guide.step', { n })}</p>
        <p className="mt-0.5 text-[16px] font-semibold text-[var(--color-ink)]">{title}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">{children}</p>
      </div>
    </div>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 py-3.5 text-left">
        <span className="flex-1 text-[14.5px] font-medium text-[var(--color-ink)]">{q}</span>
        <ChevronDown
          size={18}
          className={cn('shrink-0 text-[var(--color-ink-tertiary)] transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && <p className="pb-3.5 text-[13.5px] leading-relaxed text-[var(--color-ink-secondary)]">{a}</p>}
    </div>
  )
}

export function GuidePage() {
  const { t, locale } = useI18n()
  const { data: me } = useMe()
  const { data: rate } = useRate()
  const startScan = useStartScan()

  const percent = rate ? `${rate.basePercent}%` : t('guide.percent_fallback')
  const minSpend = me ? formatMoney(me.spendMinAmount, locale) : t('guide.min_fallback')

  return (
    <Screen padded={false}>
      <PageHeader title={t('home.how_title')} />
      <div className="px-4 pb-8">
        <div className="rounded-3xl bg-[var(--color-surface)] p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-[20px] font-bold leading-snug text-[var(--color-ink)]">{t('home.how_sub')}</p>
          <p className="mt-1 text-[14px] text-[var(--color-ink-secondary)]">
            {t('guide.lead', { percent })}
          </p>

          <div className="mt-6">
            <Step n={1} icon={<ScanLine size={22} />} title={t('guide.s1_title')}>
              {t('guide.s1_text')}
            </Step>
            <Step n={2} icon={<Coins size={22} />} title={t('guide.s2_title')}>
              {t('guide.s2_text', { percent })}
            </Step>
            <Step n={3} icon={<Wallet size={22} />} title={t('guide.s3_title')} last>
              {t('guide.s3_text', { min: minSpend })}
            </Step>
          </div>
        </div>

        <h2 className="mb-1 mt-6 text-[15px] font-semibold text-[var(--color-ink)]">{t('guide.faq_title')}</h2>
        <div className="rounded-2xl bg-[var(--color-surface)] px-4">
          {([1, 2, 3, 4, 5] as const).map((i) => (
            <Faq key={i} q={t(`guide.q${i}`)} a={t(`guide.a${i}`)} />
          ))}
        </div>

        <Button className="mt-6 flex items-center justify-center gap-2" onClick={startScan}>
          <ScanLine size={20} />
          {t('home.scan')}
        </Button>
      </div>
    </Screen>
  )
}
