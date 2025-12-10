import { unit } from './vector'

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

