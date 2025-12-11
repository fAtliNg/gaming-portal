export type HitRegion = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center'

export function getHitRegion(hx: number, hy: number, ctX = 0.24, ctY = 0.28): HitRegion {
  if (Math.abs(hx) < ctX && Math.abs(hy) < ctY) return 'center'
  return hy >= 0 ? (hx >= 0 ? 'bottom-right' : 'bottom-left') : (hx >= 0 ? 'top-right' : 'top-left')
}

