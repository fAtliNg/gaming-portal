export interface LevelConfig {
  ballSpeedX: number
  ballSpeedY: number
  ballSpeedZ: number
  botMaxSpeed: number
  firstHitSpinScale: number
  mimicDelayMs?: number
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  { ballSpeedX: 0.5, ballSpeedY: 0.5, ballSpeedZ: 0.5, botMaxSpeed: 50, firstHitSpinScale: 1 },
  { ballSpeedX: 0.6, ballSpeedY: 0.6, ballSpeedZ: 0.6, botMaxSpeed: 75, firstHitSpinScale: 1 },
  { ballSpeedX: 0.7, ballSpeedY: 0.7, ballSpeedZ: 0.7, botMaxSpeed: 100, firstHitSpinScale: 1 },
  { ballSpeedX: 0.8, ballSpeedY: 0.8, ballSpeedZ: 0.8, botMaxSpeed: 125, firstHitSpinScale: 1 },
  { ballSpeedX: 0.85, ballSpeedY: 0.85, ballSpeedZ: 0.85, botMaxSpeed: 150, firstHitSpinScale: 1 },
  { ballSpeedX: 0.9, ballSpeedY: 0.9, ballSpeedZ: 0.9, botMaxSpeed: 175, firstHitSpinScale: 1 },
  { ballSpeedX: 0.95, ballSpeedY: 0.95, ballSpeedZ: 0.95, botMaxSpeed: 200, firstHitSpinScale: 1 },
  { ballSpeedX: 1.1, ballSpeedY: 1.1, ballSpeedZ: 1.1, botMaxSpeed: 499, firstHitSpinScale: 0.5 },
  { ballSpeedX: 1.25, ballSpeedY: 1.25, ballSpeedZ: 1.25, botMaxSpeed: 750, firstHitSpinScale: 1, mimicDelayMs: 1 },
  { ballSpeedX: 1.8, ballSpeedY: 1.8, ballSpeedZ: 1.8, botMaxSpeed: 850, firstHitSpinScale: 1, mimicDelayMs: 0 },
]

// export const LEVEL_CONFIGS: LevelConfig[] = [
//   { ballSpeed: 2, botMaxSpeed: 100 },
//   { ballSpeed: 2.1, botMaxSpeed: 200 },
//   { ballSpeed: 3, botMaxSpeed: 300 },
// ]

export const CURVE_CONSTANT = 0.024
