import React, { useEffect, useRef, useState } from 'react'
import Arena from '../../components/Arena'
import { Screen, Orient, TitleOverlay, Center, Menu, BtnLink, Btn } from './styled'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const nav = useNavigate()
  const wsRef = useRef<WebSocket | null>(null)
  const [finding, setFinding] = useState(false)
  const pendingFindRef = useRef(false)
  const retryTimerRef = useRef<number | null>(null)
  const resendTimerRef = useRef<number | null>(null)
  const findingRef = useRef(false)
  useEffect(() => { findingRef.current = finding }, [finding])

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket('ws://127.0.0.1:2001')
      wsRef.current = ws
      ws.onopen = () => {
        if (pendingFindRef.current || findingRef.current) {
          try { ws.send(JSON.stringify({ type: 'find_game' })) } catch { }
          pendingFindRef.current = false
        }
      }
      ws.onmessage = (ev) => {
        let msg: any
        try { msg = JSON.parse(ev.data) } catch { return }
        if (msg.type === 'queued') {
          // noop
        } else if (msg.type === 'match_found') {
          setFinding(false)
          if (resendTimerRef.current) { window.clearInterval(resendTimerRef.current); resendTimerRef.current = null }
          const { roomId, role } = msg
          nav(`/game?room=${roomId}&role=${role}`)
        }
      }
      ws.onclose = () => {
        wsRef.current = null
        if (retryTimerRef.current) { window.clearTimeout(retryTimerRef.current) }
        if (pendingFindRef.current || findingRef.current) {
          retryTimerRef.current = window.setTimeout(connect, 500)
        }
      }
    }
    connect()
    return () => {
      if (retryTimerRef.current) { window.clearTimeout(retryTimerRef.current) }
      if (resendTimerRef.current) { window.clearInterval(resendTimerRef.current); resendTimerRef.current = null }
      try { wsRef.current?.close() } catch { }
    }
  }, [nav])

  const startFind = () => {
    if (finding) return
    setFinding(true)
    pendingFindRef.current = true
    console.log('[home] start find')
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify({ type: 'find_game' })) } catch { }
      pendingFindRef.current = false
    }
    if (resendTimerRef.current) { window.clearInterval(resendTimerRef.current) }
    resendTimerRef.current = window.setInterval(() => {
      const s = wsRef.current
      if (s && s.readyState === WebSocket.OPEN && findingRef.current) {
        try { s.send(JSON.stringify({ type: 'find_game' })) } catch { }
      }
    }, 1000)
  }

  return (
    <Screen>
      <Orient>
        <Arena showBall={false} aspect={1.55} />
        <TitleOverlay>CLIP-CLOP</TitleOverlay>
        <Center>
          <Menu>
            <Btn onClick={startFind} disabled={finding}>{finding ? 'Finding player…' : 'Start game'}</Btn>
            <BtnLink to="/high-scores">High score</BtnLink>
          </Menu>
          {finding && (
            <div style={{ marginTop: 16, color: '#78e7ff', fontFamily: 'Orbitron, system-ui', fontWeight: 900, letterSpacing: '0.12em' }}>Waiting for opponent…</div>
          )}
        </Center>
      </Orient>
    </Screen>
  )
}
