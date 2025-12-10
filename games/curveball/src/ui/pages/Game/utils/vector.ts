export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function limitMagnitude(vx: number, vy: number, max: number): [number, number] {
  const mag = Math.hypot(vx, vy)
  if (mag > max) return [(vx / mag) * max, (vy / mag) * max]
  return [vx, vy]
}

export function unit(dx: number, dy: number): { ux: number; uy: number } {
  const d = Math.hypot(dx, dy) || 1
  return { ux: dx / d, uy: dy / d }
}

export function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t
}

