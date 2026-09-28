import { useNetworkStore } from './network'

/** false only when there is no working connection (see shared/lib/network.ts). */
export function useOnline() {
  return useNetworkStore((s) => s.status !== 'offline')
}
