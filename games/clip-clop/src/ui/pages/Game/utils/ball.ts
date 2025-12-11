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

// duplicate removed

export function reflectBounds(
  nx: number,
  ny: number,
  nvx: number,
  nvy: number,
  maxX: number,
  maxY: number
): { nx: number; ny: number; nvx: number; nvy: number; bounced: boolean } {
  let x = nx
  let y = ny
  let vx = nvx
  let vy = nvy
  let bounced = false
  if (x > maxX) { x = maxX; vx = -vx * 0.9; bounced = true }
  if (x < -maxX) { x = -maxX; vx = -vx * 0.9; bounced = true }
  if (y > maxY) { y = maxY; vy = -vy * 0.9; bounced = true }
  if (y < -maxY) { y = -maxY; vy = -vy * 0.9; bounced = true }
  return { nx: x, ny: y, nvx: vx, nvy: vy, bounced }
}
