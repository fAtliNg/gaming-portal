export function computeBounds(
  cx: number,
  cy: number,
  bw: number,
  bh: number,
  halfW: number,
  halfH: number
) {
  const minX = cx - bw / 2 + halfW
  const maxX = cx + bw / 2 - halfW
  const minY = cy - bh / 2 + halfH
  const maxY = cy + bh / 2 - halfH
  return { minX, maxX, minY, maxY }
}

