import React, { useEffect, useRef, useState } from 'react'
import Arena from '../../components/Arena'
import { Screen, Orient, FsControls, FsToggle, GameArea, HudLeft, HudRight, HudLevel, HudScore, HudLives, LifeDot, LevelOverlay, GameOverOverlay, DepthHighlight, Paddle, PCenter, PVTop, PVBottom, PHLeft, PHRight, PaddleOpponentBlue } from './styled'
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
import { tangentVelocity, edgeMultiplier, responseBack, computeSpinBack, responseFront, computeSpinFront, computeSpinFirstHit } from './utils/impact'
import { applyCurve, computeBaseBall, reflectBounds } from './utils/ball'
import { computeBounds } from './utils/bounds'
import { playSound } from './utils/sound'
import { pointsForRegion } from './utils/score'
import { toggleFullscreen as toggleFsUtil } from './utils/fullscreen'
import { DEPTH, SCALE_TARGET, GAMMA, LEVEL_OVERLAY_MS, BOUNDARY_PADDING, FRONT_HIT_K, FRONT_VEL_K, BACK_HIT_K, BACK_VEL_K, MISS_RESET_DELAY_MS, HIT_OVERLAY_MS, WALL_BOUNCE_VOLUME, BLUE_HIT_VOLUME, RED_HIT_VOLUME, MISS_VOLUME } from './constants'
import { useLocation } from 'react-router-dom'

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
  const wsRef = useRef<WebSocket | null>(null)
  const joinedRef = useRef(false)
  const loc = useLocation()
  const params = new URLSearchParams(loc.search)
  const roomId = params.get('room') || ''
  const role = (params.get('role') || 'blue') as 'blue' | 'red'

  const centerOpponent = (rect: DOMRect) => {
    const cx = rect.width / 2
    const cy = rect.height / 2
    oppVelRef.current = { x: 0, y: 0 }
    oppPosRef.current = { x: cx, y: cy }
    setOppPos(oppPosRef.current)
  }

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:2001')
    wsRef.current = ws
    ws.onopen = () => {
      if (roomId) {
        try { ws.send(JSON.stringify({ type: 'join_room', roomId, role })) } catch { }
      }
    }
    ws.onmessage = (ev) => {
      let msg: any
      try { msg = JSON.parse(ev.data) } catch { return }
      console.log('[game] ws message', msg)
      if (msg.type === 'joined' && msg.roomId === roomId) {
        joinedRef.current = true
      }
      if (msg.type === 'opponent_paddle') {
        console.log('[game] opponent_paddle', msg)
        if (msg.roomId && msg.roomId !== roomId) return
        if (msg.role !== 'blue') return
        const area = areaRef.current
        if (!area) return
        const rect = area.getBoundingClientRect()
        const cx = rect.width / 2
        const cy = rect.height / 2
        const scBack = s(depth - 1)
        const bw = rect.width * scBack
        const bh = rect.height * scBack
        const w = bw / 5
        const h = (w * 2) / 3
        const halfW = w / 2
        const halfH = h / 2
        const { minX, maxX, minY, maxY } = computeBounds(cx, cy, bw, bh, halfW, halfH)
        const rx = Math.max(minX, Math.min(maxX, cx + (msg.nx || 0) * (maxX - cx)))
        const ry = Math.max(minY, Math.min(maxY, cy + (msg.ny || 0) * (maxY - cy)))
        oppPosRef.current = { x: rx, y: ry }
        setOppPos(oppPosRef.current)
      } else if (msg.type === 'ball_state' && role !== 'blue') {
        ballXRef.current = msg.x
        ballYRef.current = msg.y
        ballDepthRef.current = msg.depth
        velXRef.current = msg.vx
        velYRef.current = msg.vy
        setBallX(msg.x); setBallY(msg.y); setBallDepth(msg.depth)
        setVelX(msg.vx); setVelY(msg.vy)
      } else if (msg.type === 'peer_left') {
        setIsMoving(false)
      }
    }
    ws.onerror = (e) => { console.error('[game] ws error', e) }
    ws.onclose = () => { wsRef.current = null; joinedRef.current = false }
    return () => { try { ws.close() } catch { } }
  }, [role, roomId])

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
      {
        const r = reflectBounds(nx, ny, nvx, nvy, maxX, maxY)
        nx = r.nx
        ny = r.ny
        nvx = r.nvx
        nvy = r.nvy
        if (r.bounced) playSound(wallBounceMp3, WALL_BOUNCE_VOLUME)
      }
      // bot logic removed for online mode; opponent paddle is controlled via WebSocket updates
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
          {
            const { vx, vy } = responseBack(nvx, nvy, hx, hy, g.pvx, g.pvy, BACK_HIT_K, BACK_VEL_K, p.bsX, p.bsY, p.ms)
            nvx = vx
            nvy = vy
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
            const sVal = computeSpinBack(hx, hy, g.pvx, g.pvy, p.ms)
            spinRef.current = sVal
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
          {
            const { vx, vy } = responseFront(nvx, nvy, hx, hy, g.pvx, g.pvy, kHit, kVel, p.bsX, p.bsY)
            nvx = vx
            nvy = vy
          }
          playSound(blueHitMp3, BLUE_HIT_VOLUME)
          {
            const region = getHitRegion(hx, hy)
            setBlueHit(region)
            setScore((prev) => prev + pointsForRegion(region))
          }
          if (blueHitTimerRef.current) window.clearTimeout(blueHitTimerRef.current)
          blueHitTimerRef.current = window.setTimeout(() => setBlueHit(null), HIT_OVERLAY_MS)
          {
            const sVal = computeSpinFront(hx, hy, g.pvx, g.pvy, 1)
            spinRef.current = sVal
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
      if (wsRef.current && roomId && role === 'blue') {
        try {
          wsRef.current.send(JSON.stringify({ type: 'ball', roomId, x: nx, y: ny, depth: nd, vx: nvx, vy: nvy }))
        } catch { }
      }
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

  // bot start timing removed

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
    if (!wsRef.current) {
      console.log('[game] creating ws on first move')
      const ws = new WebSocket('ws://127.0.0.1:2001')
      wsRef.current = ws
      ws.onopen = () => {
        if (roomId) {
          try { ws.send(JSON.stringify({ type: 'join_room', roomId, role })) } catch { }
        }
      }
      ws.onmessage = (ev) => {
        let msg: any
        try { msg = JSON.parse(ev.data) } catch { return }
        console.log('[game] ws message', msg)
        if (msg.type === 'joined' && msg.roomId === roomId) {
          joinedRef.current = true
        }
        if (msg.type === 'opponent_paddle') {
          console.log('[game] opponent_paddle', msg)
          if (msg.roomId && msg.roomId !== roomId) return
          if (msg.role !== 'blue') return
          const cx = rect.width / 2
          const cy = rect.height / 2
          const scBack = s(depth - 1)
          const bw = rect.width * scBack
          const bh = rect.height * scBack
          const w = bw / 5
          const h = (w * 2) / 3
          const halfW = w / 2
          const halfH = h / 2
          const { minX, maxX, minY, maxY } = computeBounds(cx, cy, bw, bh, halfW, halfH)
          const rx = Math.max(minX, Math.min(maxX, cx + (msg.nx || 0) * (maxX - cx)))
          const ry = Math.max(minY, Math.min(maxY, cy + (msg.ny || 0) * (maxY - cy)))
          oppPosRef.current = { x: rx, y: ry }
          setOppPos(oppPosRef.current)
        }
      }
      ws.onerror = (err) => console.error('[game] ws error (on move create)', err)
      ws.onclose = () => { wsRef.current = null; joinedRef.current = false }
    }
    const pw = paddleRef.current?.offsetWidth || rect.width * 0.18
    const ph = paddleRef.current?.offsetHeight || rect.height * 0.12
    const halfW = pw / 2
    const halfH = ph / 2
    const { minX, maxX, minY, maxY } = computeBounds(rect.width / 2, rect.height / 2, rect.width, rect.height, halfW, halfH)
    const x = Math.max(minX, Math.min(maxX, localX))
    const y = Math.max(minY, Math.min(maxY, localY))
    const nx = (x - rect.width / 2) / (maxX - rect.width / 2)
    const ny = (y - rect.height / 2) / (maxY - rect.height / 2)
    console.log('[game] onPointerMove', { role, roomId, x, y, nx, ny })
    const prev = posRef.current
    setPos({ x, y })
    posRef.current = { x, y }
    const now = performance.now()
    if (lastTsRef.current) {
      const dt = Math.max(1, now - lastTsRef.current)
      paddleVelRef.current = { x: (x - prev.x) / dt, y: (y - prev.y) / dt }
    }
    lastTsRef.current = now
    const wsConn = wsRef.current
    const payload = { type: 'paddle', roomId, role: 'blue', nx, ny, x, y }
    console.log('[game] prepare paddle', payload, 'wsState=', wsConn?.readyState, 'joined=', joinedRef.current)
    if (!roomId) {
      console.log('[game] skip send: empty roomId')
    } else if (!wsConn) {
      console.log('[game] skip send: no ws connection')
    } else if (wsConn.readyState !== WebSocket.OPEN) {
      console.log('[game] skip send: ws not open, state=', wsConn.readyState)
    } else {
      console.log('[game] send paddle', payload)
      try { wsConn.send(JSON.stringify(payload)) } catch { }
    }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    if (isMoving) return
    if (missed) return
    if (gameOver) return
    if (role !== 'blue') return
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
        const scale = cfg0.firstHitSpinScale
        const sVal = computeSpinFirstHit(hx, hy, paddleVelRef.current.x, paddleVelRef.current.y, scale)
        spinRef.current = sVal
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
            role === 'blue' ? (
              <Paddle ref={paddleRef} style={{ left: `${pos.x}px`, top: `${pos.y}px` }}>
                <PCenter />
                <PVTop />
                <PVBottom />
                <PHLeft />
                <PHRight />
              </Paddle>
            ) : (
              <PaddleOpponentBlue ref={opponentRef} style={{ left: `${oppPos.x}px`, top: `${oppPos.y}px` }}>
                <PCenter />
                <PVTop />
                <PVBottom />
                <PHLeft />
                <PHRight />
              </PaddleOpponentBlue>
            )
          )}
        </GameArea>
      </Orient>
    </Screen>
  )
}
