import { LEVEL_CONFIGS } from '../../../config'

export type SimParams = {
  bsX: number
  bsY: number
  bsZ: number
  ms: number
  mimicDelayMs: number
  ac: number
  damp: number
  rt: number
  nz: number
}

export function getParams(level: number): SimParams {
  const m = Math.max(1, level)
  const table = [
    { ac: 1400, damp: 0.88, rt: 300, nz: 28 },
    { ac: 1600, damp: 0.9, rt: 240, nz: 22 },
    { ac: 1800, damp: 0.91, rt: 180, nz: 18 },
    { ac: 2000, damp: 0.92, rt: 140, nz: 12 },
    { ac: 2200, damp: 0.93, rt: 120, nz: 10 },
    { ac: 2400, damp: 0.94, rt: 100, nz: 8 },
    { ac: 2600, damp: 0.95, rt: 80, nz: 6 },
    { ac: 2800, damp: 0.96, rt: 60, nz: 4 },
    { ac: 3200, damp: 0.97, rt: 40, nz: 2 },
    { ac: 5000, damp: 0.985, rt: 0, nz: 0 },
  ]
  if (m <= LEVEL_CONFIGS.length) {
    const cfg = LEVEL_CONFIGS[m - 1]
    const base = table[m - 1]
    return {
      bsX: cfg.ballSpeedX,
      bsY: cfg.ballSpeedY,
      bsZ: cfg.ballSpeedZ,
      ms: cfg.botMaxSpeed,
      mimicDelayMs: (cfg as any).mimicDelayMs ?? 0,
      ...base,
    }
  } else {
    const extra = m - LEVEL_CONFIGS.length
    const last = LEVEL_CONFIGS[LEVEL_CONFIGS.length - 1]
    const bsX = Math.min(2.5, last.ballSpeedX + 0.04 * extra)
    const bsY = Math.min(2.5, last.ballSpeedY + 0.04 * extra)
    const bsZ = Math.min(2.2, last.ballSpeedZ + 0.03 * extra)
    const ms = Math.min(3200, last.botMaxSpeed + 120 * extra)
    const ac = Math.min(8000, 5000 + 120 * extra)
    const damp = Math.min(0.995, 0.985 + 0.001 * extra)
    const rt = 0
    const nz = 0
    const mimicDelayMs = ms > 500 ? 100 : 0
    return { bsX, bsY, bsZ, ms, mimicDelayMs, ac, damp, rt, nz }
  }
}
