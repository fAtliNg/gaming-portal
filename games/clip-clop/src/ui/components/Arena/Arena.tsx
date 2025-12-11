import React, { useEffect, useRef } from 'react'
import { useTheme } from 'styled-components'
import { Canvas } from './styled'

type Props = {
  lineColor?: string
  ballColor?: string
  background?: string
  showBall?: boolean
  aspect?: number
  highlightIndex?: number
  highlightColor?: string
}

export default function Arena({ lineColor, ballColor, background, showBall = true, aspect = 1.55, highlightIndex = -1, highlightColor }: Props) {
  const theme: any = useTheme()
  const effectiveLineColor = lineColor ?? theme?.colors?.gridLine ?? theme?.colors?.hudText ?? '#78e7ff'
  const effectiveBallColor = ballColor ?? theme?.colors?.hudText ?? '#78e7ff'
  const effectiveBackground = background ?? theme?.colors?.bg ?? '#000'
  const effectiveHighlightColor = highlightColor ?? theme?.colors?.neonTeal ?? 'rgb(155, 252, 251)'
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let w = 0
    let h = 0
    let t = 0
    let bx = 0
    let by = 0
    let vx = 2.2
    let vy = 1.6

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bx = w * 0.5
      by = h * 0.5
    }

    const drawTunnel = () => {
      const cx = w / 2
      const cy = h / 2
      let baseW = Math.min(w * 0.92, h * aspect)
      let baseH = baseW / aspect
      if (baseH > h * 0.86) {
        baseH = h * 0.86
        baseW = baseH * aspect
      }
      const host = canvas.parentElement as HTMLElement | null
      if (host) {
        host.style.setProperty('--tunnel-w', `${baseW}px`)
        host.style.setProperty('--tunnel-h', `${baseH}px`)
        host.style.setProperty('--tunnel-top', `${cy - baseH / 2}px`)
        const computeFs = () => {
          try {
            ctx.save()
            ctx.font = '900 100px "Orbitron", system-ui'
            const w100 = ctx.measureText('CLIP-CLOP').width || 800
            ctx.restore()
            const target = baseW * 0.88
            const n = 9
            const ls = Math.max(0.12, Math.min(0.2, baseW / 2200))
            const fs = Math.min(160, Math.max(44, (target * 100) / (w100 + ls * 100 * (n - 1))))
            host.style.setProperty('--title-fs', `${fs}px`)
            host.style.setProperty('--title-ls', `${ls}em`)
          } catch { }
        }
        computeFs()
        // @ts-ignore
        document.fonts?.ready?.then(() => computeFs())
      }
      const depth = 9
      const scaleTarget = 0.25
      const gamma = 0.85
      const s = (i: number) => Math.pow(scaleTarget, Math.pow(i / (depth - 1), gamma))
      const innerW = baseW * s(depth - 1)
      const innerH = baseH * s(depth - 1)
      if (host) {
        host.style.setProperty('--inner-w', `${innerW}px`)
        host.style.setProperty('--inner-h', `${innerH}px`)
      }
      const toShade = (hex: string, k: number) => {
        const h = hex.startsWith('#') ? hex.slice(1) : hex
        const r = parseInt(h.slice(0, 2), 16)
        const g = parseInt(h.slice(2, 4), 16)
        const b = parseInt(h.slice(4, 6), 16)
        return `rgb(${Math.round(r * k)}, ${Math.round(g * k)}, ${Math.round(b * k)})`
      }
      ctx.lineWidth = 2
      if (host) {
        host.style.setProperty('--grid-line-w', `${ctx.lineWidth}px`)
      }
      for (let i = 0; i < depth; i++) {
        const rw = baseW * s(i)
        const rh = baseH * s(i)
        const x = cx - rw / 2
        const y = cy - rh / 2
        const k = 1 - (i / (depth - 1)) * 0.5
        const hc = effectiveHighlightColor || toShade(effectiveLineColor, 1.6)
        ctx.strokeStyle = i === highlightIndex ? hc : toShade(effectiveLineColor, k)
        ctx.strokeRect(x, y, rw, rh)
        if (i > 0) {
          const prw = baseW * s(i - 1)
          const prh = baseH * s(i - 1)
          const px = cx - prw / 2
          const py = cy - prh / 2
          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(x, y)
          ctx.moveTo(px + prw, py)
          ctx.lineTo(x + rw, y)
          ctx.moveTo(px, py + prh)
          ctx.lineTo(x, y + rh)
          ctx.moveTo(px + prw, py + prh)
          ctx.lineTo(x + rw, y + rh)
          ctx.stroke()
        }
      }
    }

    const stepFrame = () => {
      t += 1
      bx += vx
      by += vy
      const r = Math.min(w, h) * 0.02
      if (bx < r || bx > w - r) vx *= -1
      if (by < r || by > h - r) vy *= -1
      ctx.fillStyle = effectiveBackground
      ctx.fillRect(0, 0, w, h)
      drawTunnel()
      if (showBall) {
        ctx.beginPath()
        ctx.arc(bx, by, r, 0, Math.PI * 2)
        ctx.strokeStyle = effectiveBallColor
        ctx.lineWidth = 3
        ctx.stroke()
      }
      raf = requestAnimationFrame(stepFrame)
    }

    const obs = new ResizeObserver(resize)
    obs.observe(canvas)
    resize()
    raf = requestAnimationFrame(stepFrame)
    return () => {
      cancelAnimationFrame(raf)
      obs.disconnect()
    }
  }, [effectiveLineColor, effectiveBallColor, effectiveBackground, showBall, aspect, highlightIndex, effectiveHighlightColor])

  return <Canvas ref={ref} />
}
