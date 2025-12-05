import React, { useEffect, useRef, useState } from 'react'
import Arena from '../components/Arena'
import { LEVEL_CONFIGS, CURVE_CONSTANT } from '../config'
import blueHitMp3 from '../../../assets/sounds/3_pPaddleBounce.mp3'
import redHitMp3 from '../../../assets/sounds/2_wallBounce1.mp3'
import missMp3 from '../../../assets/sounds/4_missSound.mp3'
import wallBounceMp3 from '../../../assets/sounds/5_ePaddleBounce.mp3'

export default function Game() {
  const areaRef = useRef<HTMLDivElement | null>(null)
  const screenRef = useRef<HTMLDivElement | null>(null)
  const [showLevel, setShowLevel] = useState(true)
  const [level, setLevel] = useState(1)
  const [redLives, setRedLives] = useState(3)
  const [blueLives, setBlueLives] = useState(5)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [oppPos, setOppPos] = useState({ x: 0, y: 0 })
  const oppPosRef = useRef({ x: 0, y: 0 })
  const oppVelRef = useRef({ x: 0, y: 0 })
  const botStartTsRef = useRef<number>(0)
  const spinRef = useRef(0)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const paddleRef = useRef<HTMLDivElement | null>(null)
  const [ballDepth, setBallDepth] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [direction, setDirection] = useState(0)
  const rafRef = useRef<number | null>(null)
  const [ballX, setBallX] = useState(0)
  const [ballY, setBallY] = useState(0)
  const [velX, setVelX] = useState(0)
  const [velY, setVelY] = useState(0)
  const ballXRef = useRef(0)
  const ballYRef = useRef(0)
  const velXRef = useRef(0)
  const velYRef = useRef(0)
  const ballDepthRef = useRef(0)
  const [missed, setMissed] = useState(false)
  const opponentRef = useRef<HTMLDivElement | null>(null)
  const [blueHit, setBlueHit] = useState<null | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center'>(null)
  const [redHit, setRedHit] = useState<null | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center'>(null)
  const blueHitTimerRef = useRef<number | null>(null)
  const redHitTimerRef = useRef<number | null>(null)
  const oppInertiaUntilRef = useRef<number>(0)
  const oppBurstUntilRef = useRef<number>(0)
  const oppKeepInertiaRef = useRef(false)
  const oppInertiaDirRef = useRef({ x: 0, y: 0 })
  const depth = 9
  const scaleTarget = 0.25
  const gamma = 0.85
  const s = (i: number) => Math.pow(scaleTarget, Math.pow(i / (depth - 1), gamma))
  const posRef = useRef({ x: 0, y: 0 })
  const lastTsRef = useRef<number>(0)
  const paddleVelRef = useRef({ x: 0, y: 0 })
  const missTimerRef = useRef<number | null>(null)
  const gameOverTimerRef = useRef<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const backHistoryRef = useRef<{ ts: number; x: number; y: number; vx: number; vy: number }[]>([])
  const playBlueHit = () => {
    try {
      const a = new Audio(blueHitMp3)
      a.volume = 0.7
      a.play()
    } catch { }
  }
  const playRedHit = () => {
    try {
      const a = new Audio(redHitMp3)
      a.volume = 0.75
      a.play()
    } catch { }
  }
  const playMiss = () => {
    try {
      const a = new Audio(missMp3)
      a.volume = 0.8
      a.play()
    } catch { }
  }
  const playWallBounce = () => {
    try {
      const a = new Audio(wallBounceMp3)
      a.volume = 0.6
      a.play()
    } catch { }
  }

  const centerOpponent = (rect: DOMRect) => {
    const cx = rect.width / 2
    const cy = rect.height / 2
    oppVelRef.current = { x: 0, y: 0 }
    oppPosRef.current = { x: cx, y: cy }
    setOppPos(oppPosRef.current)
  }

  const getGeom = (rect: DOMRect, side: 'front' | 'back') => {
    const cx = rect.width / 2
    const cy = rect.height / 2
    if (side === 'back') {
      const style = opponentRef.current ? getComputedStyle(opponentRef.current) : null
      const w = opponentRef.current?.offsetWidth || (rect.width * s(depth - 1)) / 5
      const h = opponentRef.current?.offsetHeight || (w * 2) / 3
      const cr = style ? parseFloat(style.borderRadius || '18') : 18
      const pvx = oppVelRef.current.x / 1000
      const pvy = oppVelRef.current.y / 1000
      return { x: oppPosRef.current.x || cx, y: oppPosRef.current.y || cy, w, h, cr, di: depth - 1, pvx, pvy }
    } else {
      const w = paddleRef.current?.offsetWidth || rect.width * 0.18
      const h = paddleRef.current?.offsetHeight || rect.height * 0.12
      const style = paddleRef.current ? getComputedStyle(paddleRef.current) : null
      const cr = style ? parseFloat(style.borderRadius || '22') : 22
      return { x: posRef.current.x, y: posRef.current.y, w, h, cr, di: 0, pvx: paddleVelRef.current.x, pvy: paddleVelRef.current.y }
    }
  }

  const getHitRegion = (hx: number, hy: number) => {
    const ctX = 0.24
    const ctY = 0.28
    if (Math.abs(hx) < ctX && Math.abs(hy) < ctY) return 'center'
    return hy >= 0 ? (hx >= 0 ? 'bottom-right' : 'bottom-left') : (hx >= 0 ? 'top-right' : 'top-left')
  }

  const intersectsCRR = (
    cx: number,
    cy: number,
    r: number,
    rx: number,
    ry: number,
    w: number,
    h: number,
    cr: number
  ) => {
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

  useEffect(() => {
    setShowLevel(true)
    const timer = setTimeout(() => setShowLevel(false), 1000)
    return () => clearTimeout(timer)
  }, [level])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    const area = areaRef.current
    if (!area) return
    const setCenter = () => {
      const rect = area.getBoundingClientRect()
      setPos({ x: rect.width / 2, y: rect.height / 2 })
      posRef.current = { x: rect.width / 2, y: rect.height / 2 }
      setOppPos({ x: rect.width / 2, y: rect.height / 2 })
      oppPosRef.current = { x: rect.width / 2, y: rect.height / 2 }
    }
    requestAnimationFrame(setCenter)
  }, [])

  useEffect(() => {
    if (!isMoving) return
    const step = () => {
      const area = areaRef.current
      if (!area) {
        rafRef.current = requestAnimationFrame(step)
        return
      }
      const rect = area.getBoundingClientRect()
      const cx = rect.width / 2
      const cy = rect.height / 2
      const baseBall = Math.min(120, Math.max(40, rect.width * 0.1))
      const dt = 0.016
      const getParams = (lv: number) => {
        const m = Math.max(1, lv)
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
          return { bsX: cfg.ballSpeedX, bsY: cfg.ballSpeedY, bsZ: cfg.ballSpeedZ, ms: cfg.botMaxSpeed, mimicDelayMs: (cfg as any).mimicDelayMs ?? 0, ...base }
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
      const p = getParams(level)
      let nd = ballDepthRef.current + 0.14 * p.bsZ * direction
      let nvx = velXRef.current
      let nvy = velYRef.current
      let nx = ballXRef.current + nvx * dt
      let ny = ballYRef.current + nvy * dt
      const vxPrev = nvx
      const vyPrev = nvy
      const kMag = CURVE_CONSTANT
      const spin = spinRef.current
      nvx = nvx + (-vyPrev) * spin * kMag * dt
      nvy = nvy + (vxPrev) * spin * kMag * dt
      spinRef.current = spinRef.current * 0.998
      const maxX = rect.width / 2 - baseBall / 2 - 4
      const maxY = rect.height / 2 - baseBall / 2 - 4
      if (nx > maxX) { nx = maxX; nvx = -nvx * 0.9; playWallBounce() }
      if (nx < -maxX) { nx = -maxX; nvx = -nvx * 0.9; playWallBounce() }
      if (ny > maxY) { ny = maxY; nvy = -nvy * 0.9; playWallBounce() }
      if (ny < -maxY) { ny = -maxY; nvy = -nvy * 0.9; playWallBounce() }
      {
        const now = performance.now()
        const scBackHist = s(depth - 1)
        backHistoryRef.current.push({ ts: now, x: cx + nx * scBackHist, y: cy + ny * scBackHist, vx: nvx * scBackHist, vy: nvy * scBackHist })
        if (backHistoryRef.current.length > 300) backHistoryRef.current.shift()
        const canTrack = direction > 0 && (!botStartTsRef.current || now >= botStartTsRef.current)
        const hasInertia = !canTrack && (oppKeepInertiaRef.current || (oppInertiaUntilRef.current && now < oppInertiaUntilRef.current))
        if (canTrack || hasInertia) {
          const scBack = s(depth - 1)
          const w = opponentRef.current?.offsetWidth || (rect.width * scBack) / 5
          const h = opponentRef.current?.offsetHeight || (w * 2) / 3
          let vx: number
          let vy: number
          let delayedPos: { x: number; y: number } | null = null
          if (canTrack) {
            const mimic = p.ms > 500
            const noiseX = mimic ? 0 : (Math.random() * 2 - 1) * p.nz
            const noiseY = mimic ? 0 : (Math.random() * 2 - 1) * p.nz
            const tx = cx + nx * scBack + noiseX
            const ty = cy + ny * scBack + noiseY
            const dx = tx - oppPosRef.current.x
            const dy = ty - oppPosRef.current.y
            const dist = Math.hypot(dx, dy)
            const ux = dist > 0 ? dx / dist : 0
            const uy = dist > 0 ? dy / dist : 0
            const hasBurst = oppBurstUntilRef.current && now < oppBurstUntilRef.current
            let velMatchX = nvx * scBack
            let velMatchY = nvy * scBack
            if (mimic) {
              const threshold = now - (p.mimicDelayMs || 0)
              let hx = backHistoryRef.current[backHistoryRef.current.length - 1]
              for (let i = backHistoryRef.current.length - 1; i >= 0; i--) {
                const it = backHistoryRef.current[i]
                if (it.ts <= threshold) { hx = it; break }
              }
              velMatchX = hx ? hx.vx : velMatchX
              velMatchY = hx ? hx.vy : velMatchY
            }
            let desiredVx: number
            let desiredVy: number
            if (mimic) {
              desiredVx = velMatchX
              desiredVy = velMatchY
              if (hasBurst) {
                desiredVx *= 1.15
                desiredVy *= 1.15
              }
            } else {
              desiredVx = ux * p.ms * (hasBurst ? 1.15 : 1)
              desiredVy = uy * p.ms * (hasBurst ? 1.15 : 1)
            }
            const maxDv = p.ac * dt * (hasBurst ? 1.6 : 1)
            const dvx = Math.max(-maxDv, Math.min(maxDv, desiredVx - oppVelRef.current.x))
            const dvy = Math.max(-maxDv, Math.min(maxDv, desiredVy - oppVelRef.current.y))
            vx = (oppVelRef.current.x + dvx) * p.damp
            vy = (oppVelRef.current.y + dvy) * p.damp
            if (mimic) {
              const threshold = now - (p.mimicDelayMs || 0)
              let hx2 = backHistoryRef.current[backHistoryRef.current.length - 1]
              for (let i = backHistoryRef.current.length - 1; i >= 0; i--) {
                const it = backHistoryRef.current[i]
                if (it.ts <= threshold) { hx2 = it; break }
              }

              if (hx2) {
                const scBack2 = s(depth - 1)
                const tx2 = hx2.x
                const ty2 = hx2.y
                let ox2 = tx2
                let oy2 = ty2
                const w2 = opponentRef.current?.offsetWidth || (rect.width * scBack2) / 5
                const h2 = opponentRef.current?.offsetHeight || (w2 * 2) / 3
                const halfW2 = w2 / 2
                const halfH2 = h2 / 2
                const bw2 = rect.width * scBack2
                const bh2 = rect.height * scBack2
                const minX2 = cx - bw2 / 2 + halfW2
                const maxX3 = cx + bw2 / 2 - halfW2
                const minY2 = cy - bh2 / 2 + halfH2
                const maxY3 = cy + bh2 / 2 - halfH2
                ox2 = Math.max(minX2, Math.min(maxX3, ox2))
                oy2 = Math.max(minY2, Math.min(maxY3, oy2))
                delayedPos = { x: ox2, y: oy2 }
              }
            }
          } else {
            const dm = Math.hypot(oppInertiaDirRef.current.x, oppInertiaDirRef.current.y) || 1
            const sx = oppInertiaDirRef.current.x / dm
            const sy = oppInertiaDirRef.current.y / dm
            const sp = p.ms * 0.95
            vx = sx * sp
            vy = sy * sp
          }
          const vLim = p.ms * ((oppBurstUntilRef.current && now < oppBurstUntilRef.current) ? 1.35 : 1)
          const vMag = Math.hypot(vx, vy)
          if (vMag > vLim) {
            vx = (vx / vMag) * vLim
            vy = (vy / vMag) * vLim
          }
          let ox = oppPosRef.current.x + vx * dt
          let oy = oppPosRef.current.y + vy * dt
          if (delayedPos) {
            const alpha = (p.mimicDelayMs && p.mimicDelayMs > 0) ? Math.min(1, dt * 8) : 1
            ox = ox * (1 - alpha) + delayedPos.x * alpha
            oy = oy * (1 - alpha) + delayedPos.y * alpha
          }
          const halfW = w / 2
          const halfH = h / 2
          const bw = rect.width * scBack
          const bh = rect.height * scBack
          const minX = cx - bw / 2 + halfW
          const maxX2 = cx + bw / 2 - halfW
          const minY = cy - bh / 2 + halfH
          const maxY2 = cy + bh / 2 - halfH
          ox = Math.max(minX, Math.min(maxX2, ox))
          oy = Math.max(minY, Math.min(maxY2, oy))
          oppPosRef.current = { x: ox, y: oy }
          oppVelRef.current = { x: vx, y: vy }
          setOppPos(oppPosRef.current)
        } else {
          const scBack = s(depth - 1)
          const w = opponentRef.current?.offsetWidth || (rect.width * scBack) / 5
          const h = opponentRef.current?.offsetHeight || (w * 2) / 3
          const tx2 = cx + nx * scBack
          const ty2 = cy + ny * scBack
          const dx2 = tx2 - oppPosRef.current.x
          const dy2 = ty2 - oppPosRef.current.y
          const d2 = Math.hypot(dx2, dy2) || 1
          let vx = (dx2 / d2) * p.ms * 0.85
          let vy = (dy2 / d2) * p.ms * 0.85
          const vLim = p.ms
          const vMag = Math.hypot(vx, vy)
          if (vMag > vLim) {
            vx = (vx / vMag) * vLim
            vy = (vy / vMag) * vLim
          }
          let ox = oppPosRef.current.x + vx * dt
          let oy = oppPosRef.current.y + vy * dt
          const bw = rect.width * scBack
          const bh = rect.height * scBack
          const halfW = w / 2
          const halfH = h / 2
          const minX = cx - bw / 2 + halfW
          const maxX2 = cx + bw / 2 - halfW
          const minY = cy - bh / 2 + halfH
          const maxY2 = cy + bh / 2 - halfH
          ox = Math.max(minX, Math.min(maxX2, ox))
          oy = Math.max(minY, Math.min(maxY2, oy))
          oppPosRef.current = { x: ox, y: oy }
          oppVelRef.current = { x: vx, y: vy }
          setOppPos(oppPosRef.current)
        }
      }
      if (direction > 0 && nd >= depth - 1) {
        nd = depth - 1
        const g = getGeom(rect, 'back')
        const sc = s(g.di)
        const r = (baseBall / 2) * sc
        const bcx = cx + nx * sc
        const bcy = cy + ny * sc
        const hit = intersectsCRR(bcx, bcy, r, g.x, g.y, g.w, g.h, g.cr)
        if (hit) {
          setDirection(-1)
          const hx = (bcx - g.x) / (g.w / 2)
          const hy = (bcy - g.y) / (g.h / 2)
          const kHit = 3
          const kVel = 180
          {
            const minV = 0.08
            const speed = Math.hypot(g.pvx, g.pvy)
            let vvx = g.pvx
            let vvy = g.pvy
            if (speed < minV) {
              const tx = -hy
              const ty = hx
              const tmag = Math.hypot(tx, ty) || 1
              vvx = (tx / tmag) * minV
              vvy = (ty / tmag) * minV
            }
            const msExtra = Math.max(0, p.ms - 500)
            const hitBoost = p.ms > 500 ? Math.min(1.5, 1.22 + 0.0003 * msExtra) : 1
            nvx = (nvx * 0.92 + hx * kHit * hitBoost + vvx * kVel * hitBoost) * p.bsX
            nvy = (nvy * 0.92 + hy * kHit * hitBoost + vvy * kVel * hitBoost) * p.bsY
          }
          playRedHit()
          {
            const tx2 = -hy
            const ty2 = hx
            const tmag2 = Math.hypot(tx2, ty2) || 1
            const boost = p.ms * (0.6 + 0.05 * level)
            oppVelRef.current = {
              x: oppVelRef.current.x + (tx2 / tmag2) * boost,
              y: oppVelRef.current.y + (ty2 / tmag2) * boost,
            }
            oppBurstUntilRef.current = performance.now() + 220
          }
          oppInertiaUntilRef.current = performance.now() + Math.min(1200, 500 + 40 * level)
          {
            const mv = Math.hypot(oppVelRef.current.x, oppVelRef.current.y) || 1
            oppInertiaDirRef.current = { x: oppVelRef.current.x / mv, y: oppVelRef.current.y / mv }
            oppKeepInertiaRef.current = true
          }
          setRedHit(getHitRegion(hx, hy))
          if (redHitTimerRef.current) window.clearTimeout(redHitTimerRef.current)
          redHitTimerRef.current = window.setTimeout(() => setRedHit(null), 240)
          {
            const kSpinH = 3.6
            const kSpinV = 3.6
            const kSpinVel = 420
            {
              const minV = 0.08
              const speed = Math.hypot(g.pvx, g.pvy)
              let vvx = g.pvx
              let vvy = g.pvy
              if (speed < minV) {
                const tx = -hy
                const ty = hx
                const tmag = Math.hypot(tx, ty) || 1
                vvx = (tx / tmag) * minV
                vvy = (ty / tmag) * minV
              }
              const raw = kSpinH * hx - kSpinV * hy + kSpinVel * (vvx * hy - vvy * hx)
              const edgeFactor = Math.min(1, Math.hypot(hx, hy))
              const edgeMul = 3.2 * (edgeFactor * edgeFactor)
              const speedMag = Math.hypot(vvx, vvy)
              const speedBoost = 1 + 0.9 * Math.min(2, speedMag)
              const msExtra = Math.max(0, p.ms - 500)
              const botSpinBoost = p.ms > 500 ? Math.min(1.4, 1.1 + 0.0002 * msExtra) : 1
              const maxS = 16
              spinRef.current = Math.max(-maxS, Math.min(maxS, raw * edgeMul * speedBoost * botSpinBoost))
            }
          }

        } else {
          setIsMoving(false)
          setDirection(0)
          setMissed(true)
          playMiss()
          oppKeepInertiaRef.current = false

          setRedLives((l) => Math.max(l - 1, 0))
          if (missTimerRef.current) window.clearTimeout(missTimerRef.current)
          missTimerRef.current = window.setTimeout(() => {
            centerOpponent(rect)
            setMissed(false)
            ballDepthRef.current = 0
            ballXRef.current = 0
            ballYRef.current = 0
            velXRef.current = 0
            velYRef.current = 0
            setBallDepth(0)
            setBallX(0)
            setBallY(0)
            setVelX(0)
            setVelY(0)
          }, 1000)
        }
      }
      if (direction < 0 && nd <= 0) {
        nd = 0
        const g = getGeom(rect, 'front')
        const sc = s(g.di)
        const r = (baseBall / 2) * sc
        const bcx = cx + nx * sc
        const bcy = cy + ny * sc
        const hit = intersectsCRR(bcx, bcy, r, g.x, g.y, g.w, g.h, g.cr)
        if (hit) {
          setDirection(1)
          const hx = (bcx - g.x) / (g.w / 2)
          const hy = (bcy - g.y) / (g.h / 2)
          const kHit = 3
          const kVel = 180
          oppKeepInertiaRef.current = false
          nvx = (nvx * 0.92 + hx * kHit + g.pvx * kVel) * p.bsX
          nvy = (nvy * 0.92 + hy * kHit + g.pvy * kVel) * p.bsY
          playBlueHit()
          {
            const region = getHitRegion(hx, hy)
            setBlueHit(region)
            setScore((prev) => prev + (region === 'center' ? 50 : 25))
          }
          if (blueHitTimerRef.current) window.clearTimeout(blueHitTimerRef.current)
          blueHitTimerRef.current = window.setTimeout(() => setBlueHit(null), 240)
          {
            const kSpinH = 3.6
            const kSpinV = 3.6
            const kSpinVel = 420
            const raw = kSpinH * hx - kSpinV * hy + kSpinVel * (g.pvx * hy - g.pvy * hx)
            const edgeFactor = Math.min(1, Math.hypot(hx, hy))
            const edgeMul = 3.2 * (edgeFactor * edgeFactor)
            const speedMag = Math.hypot(g.pvx, g.pvy)
            const speedBoost = 1 + 0.9 * Math.min(2, speedMag)
            const maxS = 16
            spinRef.current = Math.max(-maxS, Math.min(maxS, raw * edgeMul * speedBoost))
          }

        } else {
          setIsMoving(false)
          setDirection(0)
          setMissed(true)
          playMiss()
          centerOpponent(rect)

          setBlueLives((l) => Math.max(l - 1, 0))
          if (missTimerRef.current) window.clearTimeout(missTimerRef.current)
          missTimerRef.current = window.setTimeout(() => {
            setMissed(false)
            ballDepthRef.current = 0
            ballXRef.current = 0
            ballYRef.current = 0
            velXRef.current = 0
            velYRef.current = 0
            setBallDepth(0)
            setBallX(0)
            setBallY(0)
            setVelX(0)
            setVelY(0)
          }, 1000)
        }
      }
      velXRef.current = nvx
      velYRef.current = nvy
      setVelX(nvx)
      setVelY(nvy)
      ballDepthRef.current = nd
      ballXRef.current = nx
      ballYRef.current = ny
      setBallDepth(nd)
      setBallX(nx)
      setBallY(ny)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [isMoving, direction])

  useEffect(() => {
    const area = areaRef.current
    if (!area) return
    const params = ((lv: number) => {
      const m = Math.min(10, Math.max(1, lv))
      const table = [
        { rt: 300 }, { rt: 240 }, { rt: 180 }, { rt: 140 }, { rt: 120 }, { rt: 100 }, { rt: 80 }, { rt: 60 }, { rt: 40 }, { rt: 0 }
      ]
      return table[m - 1]
    })(level)
    const ms = (() => {
      const m = Math.max(1, level)
      if (m <= LEVEL_CONFIGS.length) {
        return LEVEL_CONFIGS[m - 1].botMaxSpeed
      } else {
        const extra = m - LEVEL_CONFIGS.length
        const last = LEVEL_CONFIGS[LEVEL_CONFIGS.length - 1]
        return Math.min(3200, last.botMaxSpeed + 120 * extra)
      }
    })()
    if (direction > 0) {
      const rtAdj = ms > 500 ? 0 : params.rt
      botStartTsRef.current = performance.now() + rtAdj
    } else {
      botStartTsRef.current = 0
    }
  }, [direction, level])

  useEffect(() => {
    if (redLives === 0) {
      setLevel((lv) => lv + 1)
      setRedLives(3)
    }
  }, [redLives])

  useEffect(() => {
    if (blueLives === 0) {
      if (gameOverTimerRef.current) window.clearTimeout(gameOverTimerRef.current)
      gameOverTimerRef.current = window.setTimeout(() => setGameOver(true), 1000)
    } else {
      if (gameOverTimerRef.current) {
        window.clearTimeout(gameOverTimerRef.current)
        gameOverTimerRef.current = null
      }
    }
  }, [blueLives])

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const area = areaRef.current
    if (!area) return
    const rect = area.getBoundingClientRect()
    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top
    const pw = paddleRef.current?.offsetWidth || rect.width * 0.18
    const ph = paddleRef.current?.offsetHeight || rect.height * 0.12
    const halfW = pw / 2
    const halfH = ph / 2
    const x = Math.max(halfW, Math.min(rect.width - halfW, localX))
    const y = Math.max(halfH, Math.min(rect.height - halfH, localY))
    const prev = posRef.current
    setPos({ x, y })
    posRef.current = { x, y }
    const now = performance.now()
    if (lastTsRef.current) {
      const dt = Math.max(1, now - lastTsRef.current)
      paddleVelRef.current = { x: (x - prev.x) / dt, y: (y - prev.y) / dt }
    }
    lastTsRef.current = now
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    if (isMoving) return
    if (missed) return
    if (gameOver) return
    const area = areaRef.current
    if (!area) return
    const rect = area.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const pw = paddleRef.current?.offsetWidth || rect.width * 0.18
    const ph = paddleRef.current?.offsetHeight || rect.height * 0.12
    const baseBall = Math.min(120, Math.max(40, rect.width * 0.1))
    const r = baseBall / 2
    const bcx = cx + ballX
    const bcy = cy + ballY
    const hit = intersectsCRR(bcx, bcy, r, pos.x, pos.y, pw, ph, 22)
    if (hit) {
      centerOpponent(rect)
      setIsMoving(true)
      setDirection(1)
      const hx = (bcx - pos.x) / (pw / 2)
      const hy = (bcy - pos.y) / (ph / 2)
      const kHit = 3
      const kVel = 180
      const m0 = Math.max(1, level)
      let cfg0: { ballSpeedX: number; ballSpeedY: number; firstHitSpinScale: number }
      if (m0 <= LEVEL_CONFIGS.length) {
        const c = LEVEL_CONFIGS[m0 - 1]
        cfg0 = { ballSpeedX: c.ballSpeedX, ballSpeedY: c.ballSpeedY, firstHitSpinScale: c.firstHitSpinScale }
      } else {
        const extra = m0 - LEVEL_CONFIGS.length
        const last = LEVEL_CONFIGS[LEVEL_CONFIGS.length - 1]
        cfg0 = {
          ballSpeedX: Math.min(2.5, last.ballSpeedX + 0.04 * extra),
          ballSpeedY: Math.min(2.5, last.ballSpeedY + 0.04 * extra),
          firstHitSpinScale: last.firstHitSpinScale,
        }
      }
      const vx0 = hx * kHit + paddleVelRef.current.x * kVel
      const vy0 = hy * kHit + paddleVelRef.current.y * kVel
      setVelX(vx0 * cfg0.ballSpeedX)
      setVelY(vy0 * cfg0.ballSpeedY)
      velXRef.current = vx0 * cfg0.ballSpeedX
      velYRef.current = vy0 * cfg0.ballSpeedY
      playBlueHit()
      {
        const region = getHitRegion(hx, hy)
        setBlueHit(region)
        setScore((prev) => prev + (region === 'center' ? 50 : 25))
      }
      if (blueHitTimerRef.current) window.clearTimeout(blueHitTimerRef.current)
      blueHitTimerRef.current = window.setTimeout(() => setBlueHit(null), 240)
      {
        const kSpinH = 3.6
        const kSpinV = 3.6
        const kSpinVel = 420
        const raw = kSpinH * hx - kSpinV * hy + kSpinVel * (paddleVelRef.current.x * hy - paddleVelRef.current.y * hx)
        const edgeFactor = Math.min(1, Math.hypot(hx, hy))
        const edgeMul = 3.2 * (edgeFactor * edgeFactor)
        const speedMag = Math.hypot(paddleVelRef.current.x, paddleVelRef.current.y)
        const speedBoost = 1 + 0.9 * Math.min(2, speedMag)
        const maxS = 16
        const scale = cfg0.firstHitSpinScale
        spinRef.current = Math.max(-maxS, Math.min(maxS, raw * scale * edgeMul * speedBoost))
      }
    }
  }

  const enterFullscreen = async () => {
    const el: any = screenRef.current || document.documentElement
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen()
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen()
      }
    } catch { }
  }

  const exitFullscreen = async () => {
    const d: any = document as any
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (d.webkitExitFullscreen) {
        await d.webkitExitFullscreen()
      }
    } catch { }
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  return (
    <div className="screen" ref={screenRef}>
      <div className="orient">
        <Arena showBall={false} aspect={1.55} />
        <div className="fs-controls">
          <button type="button" className="fs-toggle" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            {isFullscreen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 9H5V5" />
                <path d="M15 9H19V5" />
                <path d="M9 15H5V19" />
                <path d="M15 15H19V19" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 9V5H9" />
                <path d="M19 9V5H15" />
                <path d="M5 15V19H9" />
                <path d="M19 15V19H15" />
              </svg>
            )}
          </button>
        </div>
        <div
          className="game-area"
          ref={areaRef}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
        >
          <div className="hud-left">
            <div className="hud-score">score: {score}</div>
            <div className="hud-lives">
              {Array.from({ length: Math.max(0, redLives - 1) }).map((_, i) => (
                <div key={i} className="life-dot red" />
              ))}
            </div>
          </div>
          <div className="hud-right">
            <div className="hud-level">LEVEL: {level}</div>
            <div className="hud-lives">
              {Array.from({ length: Math.max(0, blueLives - 1) }).map((_, i) => (
                <div key={i} className="life-dot blue" />
              ))}
            </div>
          </div>
          {showLevel && (
            <div className="level-overlay">LEVEL {level}</div>
          )}
          {gameOver && (
            <div className="game-over-overlay">GAME OVER</div>
          )}
          <div className="depth-highlight" style={{ transform: `translate(-50%, -50%) scale(${s(ballDepth)})` }} />
          {!gameOver && (
            <div className={`ball${missed ? ' miss' : ''}`} style={{ transform: `translate(calc(-50% + ${ballX * s(ballDepth)}px), calc(-50% + ${ballY * s(ballDepth)}px)) scale(${s(ballDepth)})` }} />
          )}
          {!gameOver && (
            <div className="paddle-opponent" ref={opponentRef} style={{ left: `${oppPos.x}px`, top: `${oppPos.y}px` }}>
              {redHit === 'center' && <div className="p2-hit center" />}
              {redHit === 'bottom-left' && <div className="p2-hit bottom-left" />}
              {redHit === 'bottom-right' && <div className="p2-hit bottom-right" />}
              {redHit === 'top-left' && <div className="p2-hit top-left" />}
              {redHit === 'top-right' && <div className="p2-hit top-right" />}
              <div className="p2-center" />
              <div className="p2-v-top" />
              <div className="p2-v-bottom" />
              <div className="p2-h-left" />
              <div className="p2-h-right" />
            </div>
          )}
          {!gameOver && (
            <div
              className="paddle"
              ref={paddleRef}
              style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
            >
              {blueHit === 'center' && <div className="p-hit center" />}
              {blueHit === 'bottom-left' && <div className="p-hit bottom-left" />}
              {blueHit === 'bottom-right' && <div className="p-hit bottom-right" />}
              {blueHit === 'top-left' && <div className="p-hit top-left" />}
              {blueHit === 'top-right' && <div className="p-hit top-right" />}
              <div className="p-center" />
              <div className="p-v-top" />
              <div className="p-v-bottom" />
              <div className="p-h-left" />
              <div className="p-h-right" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
