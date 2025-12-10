export function intersectsCRR(
  cx: number,
  cy: number,
  r: number,
  rx: number,
  ry: number,
  w: number,
  h: number,
  cr: number
): boolean {
  const dx = Math.abs(cx - rx)
  const dy = Math.abs(cy - ry)
  const hx = w / 2
  const hy = h / 2
  const ix = Math.max(hx - cr, 0)
  const iy = Math.max(hy - cr, 0)
  const kx = Math.max(dx - ix, 0)
  const ky = Math.max(dy - iy, 0)
  const dist = Math.hypot(kx, ky)
  if (dx <= ix && dy <= iy) return true
  return dist <= cr + r
}

