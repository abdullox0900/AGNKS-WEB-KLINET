import { useCallback, useEffect, useRef, useState } from 'react'
import { apiCreateSpendToken } from '@/shared/api/client'

interface TokenState {
  qrText: string | null
  code: string | null
  expiresAt: number | null
  loading: boolean
  error: boolean
  stopped: boolean
}

const STOP_AFTER_MS = 5 * 60 * 1000

export function useSpendToken() {
  const [state, setState] = useState<TokenState>({
    qrText: null,
    code: null,
    expiresAt: null,
    loading: true,
    error: false,
    stopped: false,
  })

  const timeoutRef = useRef<number | null>(null)
  const openedAtRef = useRef(Date.now())

  const fetchToken = useCallback(async () => {
    if (Date.now() - openedAtRef.current > STOP_AFTER_MS) {
      setState((s) => ({ ...s, stopped: true, loading: false }))
      return
    }
    setState((s) => ({ ...s, loading: true, error: false }))
    try {
      const res = await apiCreateSpendToken()
      const expiresAt = new Date(res.expiresAt).getTime()
      setState({ qrText: res.qrText, code: res.code, expiresAt, loading: false, error: false, stopped: false })

      const refreshIn = Math.max(1000, expiresAt - Date.now() - 10_000)
      timeoutRef.current = window.setTimeout(fetchToken, refreshIn)
    } catch {
      setState((s) => ({ ...s, loading: false, error: true }))
    }
  }, [])

  useEffect(() => {
    openedAtRef.current = Date.now()
    fetchToken()
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [fetchToken])

  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const secondsLeft = state.expiresAt ? Math.max(0, Math.round((state.expiresAt - now) / 1000)) : 0

  return { ...state, secondsLeft, retry: fetchToken }
}
