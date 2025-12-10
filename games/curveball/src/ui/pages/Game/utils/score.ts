import type { HitRegion } from './hits'

export function pointsForRegion(region: HitRegion): number {
  return region === 'center' ? 50 : 25
}

