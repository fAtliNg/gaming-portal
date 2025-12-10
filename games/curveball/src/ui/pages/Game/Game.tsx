import React, { useEffect, useRef, useState } from 'react'
import Arena from '../../components/Arena'
import { Screen, Orient, FsControls, FsToggle, GameArea, HudLeft, HudRight, HudLevel, HudScore, HudLives, LifeDot, LevelOverlay, GameOverOverlay, DepthHighlight, Ball, Paddle, PCenter, PVTop, PVBottom, PHLeft, PHRight, PaddleOpponent, P2Center, P2VTop, P2VBottom, P2HLeft, P2HRight, PHitCenter, PHitBL, PHitBR, PHitTL, PHitTR, P2HitCenter, P2HitBL, P2HitBR, P2HitTL, P2HitTR } from './styled'
import { useThemeMode } from '../../ThemeModeProvider'
import IconFullscreenExit from '../../icons/IconFullscreenExit'
import IconFullscreenEnter from '../../icons/IconFullscreenEnter'
import IconSun from '../../icons/IconSun'
import IconMoon from '../../icons/IconMoon'
import { LEVEL_CONFIGS, CURVE_CONSTANT } from '../../config'
import blueHitMp3 from '../../../../assets/sounds/3_pPaddleBounce.mp3'
import redHitMp3 from '../../../../assets/sounds/2_wallBounce1.mp3'
import missMp3 from '../../../../assets/sounds/4_missSound.mp3'
import wallBounceMp3 from '../../../../assets/sounds/5_ePaddleBounce.mp3'
import { getHitRegion } from './utils/hits'
import { intersectsCRR } from './utils/geometry'
import { getParams } from './utils/params'
import { unit, limitMagnitude, clamp, lerp } from './utils/vector'
import { makeScale } from './utils/scaling'
import { tangentVelocity, edgeMultiplier } from './utils/impact'
import { applyCurve, computeBaseBall } from './utils/ball'
import { computeBounds } from './utils/bounds'
import { playSound } from './utils/sound'
import { pointsForRegion } from './utils/score'
import { toggleFullscreen as toggleFsUtil } from './utils/fullscreen'
import { DEPTH, SCALE_TARGET, GAMMA, LEVEL_OVERLAY_MS, BOUNDARY_PADDING, FRONT_HIT_K, FRONT_VEL_K, BACK_HIT_K, BACK_VEL_K, SPIN_K_H, SPIN_K_V, FIRST_SPIN_K_H, FIRST_SPIN_K_V, SPIN_VEL_K, MAX_SPIN, MISS_RESET_DELAY_MS, HIT_OVERLAY_MS, WALL_BOUNCE_VOLUME, BLUE_HIT_VOLUME, RED_HIT_VOLUME, MISS_VOLUME } from './utils/constants'

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
  const depth = DEPTH
  const scaleTarget = SCALE_TARGET
  const gamma = GAMMA
  const s = makeScale(depth, gamma, scaleTarget)
  const posRef = useRef({ x: 0, y: 0 })
  const lastTsRef = useRef<number>(0)
  const paddleVelRef = useRef({ x: 0, y: 0 })
  const missTimerRef = useRef<number | null>(null)
  const gameOverTimerRef = useRef<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const backHistoryRef = useRef<{ ts: number; x: number; y: number; vx: number; vy: number }[]>([])

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



  useEffect(() => {
    setShowLevel(true)
    const timer = setTimeout(() => setShowLevel(false), LEVEL_OVERLAY_MS)
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
      const baseBall = computeBaseBall(rect.width)
      const dt = 0.016

      const p = getParams(level)
      let nd = ballDepthRef.current + 0.14 * p.bsZ * direction
      let nvx = velXRef.current
      let nvy = velYRef.current
      let nx = ballXRef.current + nvx * dt
      let ny = ballYRef.current + nvy * dt
      const vxPrev = nvx
      const vyPrev = nvy
      {
        const kMag = CURVE_CONSTANT
        const { vx, vy, spin } = applyCurve(nvx, nvy, spinRef.current, kMag, dt)
        nvx = vx
        nvy = vy
        spinRef.current = spin
      }
      const maxX = rect.width / 2 - baseBall / 2 - BOUNDARY_PADDING
      const maxY = rect.height / 2 - baseBall / 2 - BOUNDARY_PADDING
      if (nx > maxX) { nx = maxX; nvx = -nvx * 0.9; playSound(wallBounceMp3, WALL_BOUNCE_VOLUME) }
      if (nx < -maxX) { nx = -maxX; nvx = -nvx * 0.9; playSound(wallBounceMp3, WALL_BOUNCE_VOLUME) }
      if (ny > maxY) { ny = maxY; nvy = -nvy * 0.9; playSound(wallBounceMp3, WALL_BOUNCE_VOLUME) }
      if (ny < -maxY) { ny = -maxY; nvy = -nvy * 0.9; playSound(wallBounceMp3, WALL_BOUNCE_VOLUME) }
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
            const { ux: sx, uy: sy } = unit(oppInertiaDirRef.current.x, oppInertiaDirRef.current.y)
            const sp = p.ms * 0.95
            vx = sx * sp
            vy = sy * sp
          }
          const vLim = p.ms * ((oppBurstUntilRef.current && now < oppBurstUntilRef.current) ? 1.35 : 1)
            ;[vx, vy] = limitMagnitude(vx, vy, vLim)
          let ox = oppPosRef.current.x + vx * dt
          let oy = oppPosRef.current.y + vy * dt
          if (delayedPos) {
            const alpha = (p.mimicDelayMs && p.mimicDelayMs > 0) ? Math.min(1, dt * 8) : 1
            ox = lerp(ox, delayedPos.x, alpha)
            oy = lerp(oy, delayedPos.y, alpha)
          }
          const halfW = w / 2
          const halfH = h / 2
          const bw = rect.width * scBack
          const bh = rect.height * scBack
          const { minX, maxX, minY, maxY } = computeBounds(cx, cy, bw, bh, halfW, halfH)
          ox = clamp(ox, minX, maxX)
          oy = clamp(oy, minY, maxY)
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
          const { ux: udx, uy: udy } = unit(dx2, dy2)
          let vx = udx * p.ms * 0.85
          let vy = udy * p.ms * 0.85
          const vLim = p.ms
            ;[vx, vy] = limitMagnitude(vx, vy, vLim)
          let ox = oppPosRef.current.x + vx * dt
          let oy = oppPosRef.current.y + vy * dt
          const bw = rect.width * scBack
          const bh = rect.height * scBack
          const halfW = w / 2
          const halfH = h / 2
          const { minX, maxX, minY, maxY } = computeBounds(cx, cy, bw, bh, halfW, halfH)
          ox = clamp(ox, minX, maxX)
          oy = clamp(oy, minY, maxY)
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
          const kHit = BACK_HIT_K
          const kVel = BACK_VEL_K
          {
            const minV = 0.08
            const { vvx, vvy } = tangentVelocity(hx, hy, g.pvx, g.pvy, minV)
            const msExtra = Math.max(0, p.ms - 500)
            const hitBoost = p.ms > 500 ? Math.min(1.5, 1.22 + 0.0003 * msExtra) : 1
            nvx = (nvx * 0.92 + hx * kHit * hitBoost + vvx * kVel * hitBoost) * p.bsX
            nvy = (nvy * 0.92 + hy * kHit * hitBoost + vvy * kVel * hitBoost) * p.bsY
          }
          playSound(redHitMp3, RED_HIT_VOLUME)
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
            const { ux, uy } = unit(oppVelRef.current.x, oppVelRef.current.y)
            oppInertiaDirRef.current = { x: ux, y: uy }
            oppKeepInertiaRef.current = true
          }
          setRedHit(getHitRegion(hx, hy))
          if (redHitTimerRef.current) window.clearTimeout(redHitTimerRef.current)
          redHitTimerRef.current = window.setTimeout(() => setRedHit(null), HIT_OVERLAY_MS)
          {
            const kSpinH = SPIN_K_H
            const kSpinV = SPIN_K_V
            const kSpinVel = SPIN_VEL_K
            {
              const minV = 0.08
              const { vvx, vvy } = tangentVelocity(hx, hy, g.pvx, g.pvy, minV)
              const raw = kSpinH * hx - kSpinV * hy + kSpinVel * (vvx * hy - vvy * hx)
              const edgeMul = edgeMultiplier(hx, hy)
              const speedMag = Math.hypot(vvx, vvy)
              const speedBoost = 1 + 0.9 * Math.min(2, speedMag)
              const msExtra = Math.max(0, p.ms - 500)
              const botSpinBoost = p.ms > 500 ? Math.min(1.4, 1.1 + 0.0002 * msExtra) : 1
              const maxS = MAX_SPIN
              spinRef.current = Math.max(-maxS, Math.min(maxS, raw * edgeMul * speedBoost * botSpinBoost))
            }
          }

        } else {
          setIsMoving(false)
          setDirection(0)
          setMissed(true)
          playSound(missMp3, MISS_VOLUME)
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
          }, MISS_RESET_DELAY_MS)
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
          const kHit = FRONT_HIT_K
          const kVel = FRONT_VEL_K
          oppKeepInertiaRef.current = false
          nvx = (nvx * 0.92 + hx * kHit + g.pvx * kVel) * p.bsX
          nvy = (nvy * 0.92 + hy * kHit + g.pvy * kVel) * p.bsY
          playSound(blueHitMp3, BLUE_HIT_VOLUME)
          {
            const region = getHitRegion(hx, hy)
            setBlueHit(region)
            setScore((prev) => prev + pointsForRegion(region))
          }
          if (blueHitTimerRef.current) window.clearTimeout(blueHitTimerRef.current)
          blueHitTimerRef.current = window.setTimeout(() => setBlueHit(null), HIT_OVERLAY_MS)
          {
            const kSpinH = SPIN_K_H
            const kSpinV = SPIN_K_V
            const kSpinVel = SPIN_VEL_K
            const raw = kSpinH * hx - kSpinV * hy + kSpinVel * (g.pvx * hy - g.pvy * hx)
            const edgeMul = edgeMultiplier(hx, hy)
            const speedMag = Math.hypot(g.pvx, g.pvy)
            const speedBoost = 1 + 0.9 * Math.min(2, speedMag)
            const maxS = MAX_SPIN
            spinRef.current = Math.max(-maxS, Math.min(maxS, raw * edgeMul * speedBoost))
          }

        } else {
          setIsMoving(false)
          setDirection(0)
          setMissed(true)
          playSound(missMp3, MISS_VOLUME)
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
          }, MISS_RESET_DELAY_MS)
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
    const baseBall = computeBaseBall(rect.width)
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
      const kHit = FRONT_HIT_K
      const kVel = FRONT_VEL_K
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
      playSound(blueHitMp3, BLUE_HIT_VOLUME)
      {
        const region = getHitRegion(hx, hy)
        setBlueHit(region)
        setScore((prev) => prev + pointsForRegion(region))
      }
      if (blueHitTimerRef.current) window.clearTimeout(blueHitTimerRef.current)
      blueHitTimerRef.current = window.setTimeout(() => setBlueHit(null), HIT_OVERLAY_MS)
      {
        const kSpinH = FIRST_SPIN_K_H
        const kSpinV = FIRST_SPIN_K_V
        const kSpinVel = SPIN_VEL_K
        const raw = kSpinH * hx - kSpinV * hy + kSpinVel * (paddleVelRef.current.x * hy - paddleVelRef.current.y * hx)
        const edgeMul = edgeMultiplier(hx, hy)
        const speedMag = Math.hypot(paddleVelRef.current.x, paddleVelRef.current.y)
        const speedBoost = 1 + 0.9 * Math.min(2, speedMag)
        const maxS = MAX_SPIN
        const scale = cfg0.firstHitSpinScale
        spinRef.current = Math.max(-maxS, Math.min(maxS, raw * scale * edgeMul * speedBoost))
      }
    }
  }

  const toggleFullscreen = () => {
    const el: any = screenRef.current || document.documentElement
    const d: any = document as any
    toggleFsUtil(el, d)
  }
  const { mode, toggle } = useThemeMode()

  return (
    <Screen ref={screenRef}>
      <Orient>
        <Arena showBall={false} aspect={1.55} />
        <FsControls>
          <FsToggle type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            {isFullscreen ? <IconFullscreenExit /> : <IconFullscreenEnter />}
          </FsToggle>
          <FsToggle type="button" onClick={toggle} aria-label={'Switch theme'}>
            {mode === 'blue' ? <IconSun /> : <IconMoon />}
          </FsToggle>
        </FsControls>
        <GameArea
          ref={areaRef}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
        >
          <HudLeft>
            <HudScore>score: {score}</HudScore>
            <HudLives>
              {Array.from({ length: Math.max(0, redLives - 1) }).map((_, i) => (
                <LifeDot key={i} $variant="red" />
              ))}
            </HudLives>
          </HudLeft>
          <HudRight>
            <HudLevel>LEVEL: {level}</HudLevel>
            <HudLives>
              {Array.from({ length: Math.max(0, blueLives - 1) }).map((_, i) => (
                <LifeDot key={i} $variant="blue" />
              ))}
            </HudLives>
          </HudRight>
          {showLevel && (
            <LevelOverlay>LEVEL {level}</LevelOverlay>
          )}
          {gameOver && (
            <GameOverOverlay>GAME OVER</GameOverOverlay>
          )}
          <DepthHighlight style={{ transform: `translate(-50%, -50%) scale(${s(ballDepth)})` }} />
          {!gameOver && (
            <Ball $missed={missed} style={{ transform: `translate(calc(-50% + ${ballX * s(ballDepth)}px), calc(-50% + ${ballY * s(ballDepth)}px)) scale(${s(ballDepth)})` }} />
          )}
          {!gameOver && (
            <PaddleOpponent ref={opponentRef} style={{ left: `${oppPos.x}px`, top: `${oppPos.y}px` }}>
              {redHit === 'center' && <P2HitCenter />}
              {redHit === 'bottom-left' && <P2HitBL />}
              {redHit === 'bottom-right' && <P2HitBR />}
              {redHit === 'top-left' && <P2HitTL />}
              {redHit === 'top-right' && <P2HitTR />}
              <P2Center />
              <P2VTop />
              <P2VBottom />
              <P2HLeft />
              <P2HRight />
            </PaddleOpponent>
          )}
          {!gameOver && (
            <Paddle ref={paddleRef} style={{ left: `${pos.x}px`, top: `${pos.y}px` }}>
              {blueHit === 'center' && <PHitCenter />}
              {blueHit === 'bottom-left' && <PHitBL />}
              {blueHit === 'bottom-right' && <PHitBR />}
              {blueHit === 'top-left' && <PHitTL />}
              {blueHit === 'top-right' && <PHitTR />}
              <PCenter />
              <PVTop />
              <PVBottom />
              <PHLeft />
              <PHRight />
            </Paddle>
          )}
        </GameArea>
      </Orient>
    </Screen>
  )
}
