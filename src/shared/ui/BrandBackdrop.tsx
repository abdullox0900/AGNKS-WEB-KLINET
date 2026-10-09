import { brand } from '@/shared/lib/brand'

/** The station's living background (see `fx` in brands.ts). Renders nothing for stations without it. Purely decorative. */
export function BrandBackdrop() {
  if (!brand?.fx) return null
  return (
    <div className="brand-aura" aria-hidden>
      <i />
      <i />
      <i />
    </div>
  )
}
