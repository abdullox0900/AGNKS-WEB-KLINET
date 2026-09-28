import { create } from 'zustand'

/**
 * Connection quality for the whole app: 'offline' | 'slow' | 'online'.
 *
 * `navigator.onLine` only knows whether the phone has *a* network, not whether the
 * internet actually works or how fast it is, and the Network Information API
 * (navigator.connection) doesn't exist on iOS / Telegram iOS. So we measure it
 * ourselves:
 *  - a tiny GET to the API's /health every 20s (and on focus / reconnect), timing the
 *    round trip — two failed pings in a row while "online" means no real connectivity;
 *  - the duration of the app's own API calls (reportRequestDuration, from the http
 *    interceptor), so a sluggish connection is noticed between pings too;
 *  - navigator.connection where it exists (Android): 2g/slow-2g or Save-Data = slow.
 */

export type NetworkStatus = 'online' | 'slow' | 'offline'

interface NetworkState {
  status: NetworkStatus
  /** median round trip of recent pings, ms */
  rttMs: number | null
}

export const useNetworkStore = create<NetworkState>(() => ({
  status: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online',
  rttMs: null,
}))

const PING_EVERY_MS = 20_000
const PING_TIMEOUT_MS = 8_000
/** round trip above this = "slow" (a /health call normally takes 50–300 ms) */
const SLOW_RTT_MS = 1_500
/** an ordinary API call slower than this also counts as a slow sample */
const SLOW_REQUEST_MS = 4_000
const SAMPLES = 3

const healthUrl = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/api\/v\d+\/?$/, '') + '/health'

let samples: number[] = []
let failures = 0
let started = false

type ConnectionInfo = { effectiveType?: string; saveData?: boolean; addEventListener?: (t: string, cb: () => void) => void }
const connection = (): ConnectionInfo | undefined => (navigator as Navigator & { connection?: ConnectionInfo }).connection

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function recompute() {
  if (!navigator.onLine || failures >= 2) {
    useNetworkStore.setState({ status: 'offline' })
    return
  }
  const rtt = samples.length ? median(samples) : null
  const c = connection()
  const slowHint = c?.saveData || c?.effectiveType === '2g' || c?.effectiveType === 'slow-2g'
  useNetworkStore.setState({ rttMs: rtt, status: slowHint || (rtt !== null && rtt > SLOW_RTT_MS) ? 'slow' : 'online' })
}

function addSample(ms: number) {
  samples = [...samples, ms].slice(-SAMPLES)
}

async function ping() {
  if (!navigator.onLine) return recompute()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)
  const t0 = performance.now()
  try {
    const res = await fetch(`${healthUrl}?t=${Date.now()}`, { cache: 'no-store', signal: controller.signal })
    if (res.status >= 500) throw new Error(String(res.status))
    failures = 0
    addSample(performance.now() - t0)
  } catch {
    failures += 1
    // a timed-out ping is also a (very) slow sample
    addSample(PING_TIMEOUT_MS)
  } finally {
    clearTimeout(timer)
    recompute()
  }
}

/** Called by the http interceptor for every API call. */
export function reportRequestDuration(ms: number, ok: boolean) {
  if (ok) failures = 0
  if (ms > SLOW_REQUEST_MS || (ok && useNetworkStore.getState().status !== 'online')) {
    // slow call = slow sample; a quick successful call is evidence the connection recovered
    addSample(ms)
    recompute()
  }
}

/** Start once at app boot. */
export function startNetworkMonitor() {
  if (started) return
  started = true
  window.addEventListener('online', () => {
    failures = 0
    samples = []
    void ping()
  })
  window.addEventListener('offline', recompute)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void ping()
  })
  connection()?.addEventListener?.('change', () => void ping())
  void ping()
  window.setInterval(() => {
    if (document.visibilityState === 'visible') void ping()
  }, PING_EVERY_MS)
}
