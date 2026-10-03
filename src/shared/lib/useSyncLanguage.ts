import { useEffect, useRef } from 'react'
import { useSWRConfig } from 'swr'
import { useAppStore } from '@/shared/config/appStore'
import { apiSetLanguage } from '@/shared/api/client'
import type { UserProfile } from '@/entities/user'

/**
 * Keeps the language of the bot's messages equal to the language of the webapp:
 *  - the client picked a language in the webapp  → tell the server (so Telegram messages follow it);
 *  - the client never picked one                 → the webapp follows what the bot registered
 *    (taken from their Telegram language), instead of defaulting to Uzbek.
 */
export function useSyncLanguage(me: UserProfile | undefined) {
  const locale = useAppStore((s) => s.locale)
  const chosen = useAppStore((s) => s.localeChosen)
  const adoptLocale = useAppStore((s) => s.adoptLocale)
  const { mutate } = useSWRConfig()
  const pushing = useRef<string | null>(null)

  useEffect(() => {
    if (!me?.registered || me.lang === locale) return
    if (!chosen) {
      adoptLocale(me.lang)
      return
    }
    if (pushing.current === locale) return
    pushing.current = locale
    apiSetLanguage(locale)
      .then(() => mutate('/me'))
      .catch(() => {
        pushing.current = null
      })
  }, [me?.registered, me?.lang, locale, chosen, adoptLocale, mutate])
}
