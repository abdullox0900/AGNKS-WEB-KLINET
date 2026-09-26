import { useState } from 'react'
import { Globe, MessageCircle, MessageSquareText, FileText, ShieldCheck, Info } from 'lucide-react'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Screen } from '@/shared/ui/Screen'
import { Sheet } from '@/shared/ui/Sheet'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/Toast'
import { useI18n } from '@/app/providers/I18nProvider'
import { useAppStore } from '@/shared/config/appStore'
import { apiSendFeedback, apiSetMarketingOptIn } from '@/shared/api/client'
import { tgOpenLink } from '@/shared/lib/telegram'
import { cn } from '@/shared/lib/cn'

function Row({ icon, label, right, onClick }: { icon: React.ReactNode; label: string; right?: React.ReactNode; onClick?: () => void }) {
  const content = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-bg)] text-[var(--color-ink-secondary)]">
        {icon}
      </div>
      <span className="flex-1 text-[15px] text-[var(--color-ink)]">{label}</span>
      {right}
    </>
  )
  // Rows with an interactive `right` control (e.g. a toggle) must not also be a <button> themselves —
  // nested buttons are invalid HTML and make the inner control's clicks unreliable.
  if (!onClick) {
    return <div className="flex w-full items-center gap-3 border-b border-[var(--color-border)] py-3.5 text-left last:border-b-0">{content}</div>
  }
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-[var(--color-border)] py-3.5 text-left last:border-b-0"
    >
      {content}
    </button>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`h-7 w-12 rounded-full p-0.5 transition-colors ${checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}
    >
      <span
        className={`block h-6 w-6 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

export function SettingsPage() {
  const { t, locale, setLocale } = useI18n()
  const marketingOptIn = useAppStore((s) => s.marketingOptIn)
  const setMarketingOptIn = useAppStore((s) => s.setMarketingOptIn)
  const [sheet, setSheet] = useState<'lang' | 'offer' | 'privacy' | 'feedback' | null>(null)

  async function handleMarketingChange(value: boolean) {
    setMarketingOptIn(value)
    await apiSetMarketingOptIn(value)
  }

  return (
    <Screen padded={false}>
      <PageHeader title={t('settings.title')} />
      <div className="px-4">
        <div className="rounded-2xl bg-[var(--color-surface)] px-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <Row
            icon={<Globe size={17} />}
            label={t('settings.language')}
            onClick={() => setSheet('lang')}
            right={<span className="text-[13px] text-[var(--color-ink-tertiary)]">{locale === 'uz' ? "O'zbekcha" : 'Русский'}</span>}
          />
          <Row
            icon={<MessageCircle size={17} />}
            label={t('settings.marketing')}
            right={<Toggle checked={marketingOptIn} onChange={handleMarketingChange} />}
          />
          <Row icon={<MessageSquareText size={17} />} label="Taklif va shikoyat" onClick={() => setSheet('feedback')} />
          <Row icon={<FileText size={17} />} label={t('settings.offer')} onClick={() => setSheet('offer')} />
          <Row icon={<ShieldCheck size={17} />} label={t('settings.privacy')} onClick={() => setSheet('privacy')} />
          <Row icon={<MessageCircle size={17} />} label={t('settings.contact')} onClick={() => tgOpenLink('https://t.me/agnks_support')} />
          <Row icon={<Info size={17} />} label={t('settings.version')} right={<span className="text-[13px] text-[var(--color-ink-tertiary)]">1.0.0</span>} />
        </div>
      </div>

      <Sheet open={sheet === 'lang'} onClose={() => setSheet(null)} title={t('settings.language')}>
        <div className="space-y-2 pb-6">
          {(['uz', 'ru'] as const).map((code) => (
            <button
              key={code}
              onClick={() => {
                setLocale(code)
                setSheet(null)
              }}
              className={`flex h-13 w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-[15px] font-medium ${
                locale === code ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-ink)]'
              }`}
            >
              {code === 'uz' ? "O'zbekcha" : 'Русский'}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === 'offer' || sheet === 'privacy'} onClose={() => setSheet(null)} title={sheet === 'offer' ? t('settings.offer') : t('settings.privacy')}>
        <p className="pb-6 text-[14px] leading-relaxed text-[var(--color-ink-secondary)]">
          AGNKS Loyalty dasturi doirasida bonus yig'ish va sarflash shartlari, mijoz ma'lumotlarini qayta ishlash
          tartibi ushbu hujjatda belgilanadi. To'liq matn tez orada shu yerda ko'rsatiladi.
        </p>
      </Sheet>

      <Sheet open={sheet === 'feedback'} onClose={() => setSheet(null)} title="Taklif va shikoyat">
        <FeedbackForm onSent={() => setSheet(null)} />
      </Sheet>
    </Screen>
  )
}

function FeedbackForm({ onSent }: { onSent: () => void }) {
  const { show } = useToast()
  const [kind, setKind] = useState<'suggestion' | 'complaint'>('suggestion')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!message.trim() || submitting) return
    setSubmitting(true)
    try {
      await apiSendFeedback({ kind, message: message.trim() })
      show('Yuborildi, rahmat!')
      onSent()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex gap-2">
        {(['suggestion', 'complaint'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={cn(
              'flex-1 rounded-2xl border px-4 py-3 text-[14px] font-medium',
              kind === k ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-ink-secondary)]',
            )}
          >
            {k === 'suggestion' ? 'Taklif' : 'Shikoyat'}
          </button>
        ))}
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
        rows={6}
        placeholder={kind === 'suggestion' ? 'Taklifingizni yozing…' : 'Nima yuz berganini yozing…'}
        className="w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3.5 text-[15px] text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
      />
      <p className="text-right text-[11px] text-[var(--color-ink-tertiary)]">{message.length}/1000</p>
      <Button className="w-full" loading={submitting} disabled={!message.trim()} onClick={handleSubmit}>
        Yuborish
      </Button>
    </div>
  )
}
