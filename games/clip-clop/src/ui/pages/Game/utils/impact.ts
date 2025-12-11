import { unit } from './vector'
import { SPIN_K_H, SPIN_K_V, SPIN_VEL_K, MAX_SPIN } from '../constants'

export function tangentVelocity(hx: number, hy: number, pvx: number, pvy: number, minV: number) {
  const speed = Math.hypot(pvx, pvy)
  let vvx = pvx
  let vvy = pvy
  if (speed < minV) {
    const tx = -hy
    const ty = hx
    const { ux, uy } = unit(tx, ty)
    vvx = ux * minV
    vvy = uy * minV
  }
  return { vvx, vvy }
}

export function edgeMultiplier(hx: number, hy: number) {
  const edgeFactor = Math.min(1, Math.hypot(hx, hy))
  return 3.2 * (edgeFactor * edgeFactor)
}

export function responseBack(
  nvx: number,
  nvy: number,
  hx: number,
  hy: number,
  pvx: number,
  pvy: number,
  kHit: number,
  kVel: number,
  bsX: number,
  bsY: number,
  ms: number
): { vx: number; vy: number } {
  const minV = 0.08
  const { vvx, vvy } = tangentVelocity(hx, hy, pvx, pvy, minV)
  const msExtra = Math.max(0, ms - 500)
  const hitBoost = ms > 500 ? Math.min(1.5, 1.22 + 0.0003 * msExtra) : 1
  const vx = (nvx * 0.92 + hx * kHit * hitBoost + vvx * kVel * hitBoost) * bsX
  const vy = (nvy * 0.92 + hy * kHit * hitBoost + vvy * kVel * hitBoost) * bsY
  return { vx, vy }
}

export function computeSpinBack(hx: number, hy: number, pvx: number, pvy: number, ms: number): number {
  const minV = 0.08
  const { vvx, vvy } = tangentVelocity(hx, hy, pvx, pvy, minV)
  const raw = SPIN_K_H * hx - SPIN_K_V * hy + SPIN_VEL_K * (vvx * hy - vvy * hx)
  const edgeMul = edgeMultiplier(hx, hy)
  const speedMag = Math.hypot(vvx, vvy)
  const speedBoost = 1 + 0.9 * Math.min(2, speedMag)
  const msExtra = Math.max(0, ms - 500)
  const botSpinBoost = ms > 500 ? Math.min(1.4, 1.1 + 0.0002 * msExtra) : 1
  const maxS = MAX_SPIN
  return Math.max(-maxS, Math.min(maxS, raw * edgeMul * speedBoost * botSpinBoost))
}

export function responseFront(
  nvx: number,
  nvy: number,
  hx: number,
  hy: number,
  pvx: number,
  pvy: number,
  kHit: number,
  kVel: number,
  bsX: number,
  bsY: number
): { vx: number; vy: number } {
  const vx = (nvx * 0.92 + hx * kHit + pvx * kVel) * bsX
  const vy = (nvy * 0.92 + hy * kHit + pvy * kVel) * bsY
  return { vx, vy }
}

export function computeSpinFront(hx: number, hy: number, pvx: number, pvy: number, scale: number): number {
  const raw = SPIN_K_H * hx - SPIN_K_V * hy + SPIN_VEL_K * (pvx * hy - pvy * hx)
  const edgeMul = edgeMultiplier(hx, hy)
  const speedMag = Math.hypot(pvx, pvy)
  const speedBoost = 1 + 0.9 * Math.min(2, speedMag)
  const maxS = MAX_SPIN
  return Math.max(-maxS, Math.min(maxS, raw * scale * edgeMul * speedBoost))
}

export function computeSpinFirstHit(hx: number, hy: number, pvx: number, pvy: number, scale: number): number {
  const raw = (3.6 /* FIRST_SPIN_K_H */) * hx - (4.8 /* FIRST_SPIN_K_V */) * hy + SPIN_VEL_K * (pvx * hy - pvy * hx)
  const edgeMul = edgeMultiplier(hx, hy)
  const speedMag = Math.hypot(pvx, pvy)
  const speedBoost = 1 + 0.9 * Math.min(2, speedMag)
  const maxS = MAX_SPIN
  return Math.max(-maxS, Math.min(maxS, raw * scale * edgeMul * speedBoost))
}
