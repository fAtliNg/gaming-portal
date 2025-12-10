export function applyCurve(
  nvx: number,
  nvy: number,
  spin: number,
  kMag: number,
  dt: number,
  decay = 0.997
): { vx: number; vy: number; spin: number } {
  const vxPrev = nvx
  const vyPrev = nvy
  const vx = nvx + -vyPrev * spin * kMag * dt
  const vy = nvy + vxPrev * spin * kMag * dt
  const s2 = spin * decay
  return { vx, vy, spin: s2 }
}

export function computeBaseBall(width: number): number {
  return Math.min(120, Math.max(40, width * 0.1))
}
