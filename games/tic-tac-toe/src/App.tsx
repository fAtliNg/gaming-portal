import React, { useEffect, useRef, useState } from 'react'
import { Box, Typography, Button } from '@mui/material'

type Cell = '' | 'x' | 'o'
const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]
function winnerOf(b: Cell[]): Cell {
  for (const [a, c, d] of lines) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]
  }
  return ''
}

export default function App() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(''))
  const [done, setDone] = useState<string>('')
  const [me, setMe] = useState<'x' | 'o' | ''>('')
  const [turn, setTurn] = useState<'x' | 'o' | ''>('x')
  const wsRef = useRef<WebSocket | null>(null)
  const connectedRef = useRef<boolean>(false)
  const openingRef = useRef<boolean>(false)
  const [findingState, setFindingState] = useState<'idle' | 'connecting' | 'waiting' | 'playing'>(
    'idle'
  )
  const params = new URLSearchParams(window.location.search)
  const gameUuid = params.get('game_uuid') || ''
  const find = params.get('find') === '1'
  const partyUuid = params.get('party_uuid') || ''
  const view = params.get('view') === '1'

  useEffect(() => {
    if (!gameUuid) return
    if (!find && !partyUuid) return
    const log = (...a: any[]) => console.log('[ttt-client]', ...a)
    log('effect', {
      href: window.location.href,
      cookie: document.cookie,
      gameUuid,
      find,
      partyUuid,
      view,
    })
    if (wsRef.current) {
      log('skip ws create: already exists', { readyState: wsRef.current.readyState })
      return
    }
    if (openingRef.current) {
      log('skip ws create: opening in progress')
      return
    }
    openingRef.current = true
    setFindingState('connecting')
    const url = `ws://localhost:11692/ws?game_uuid=${gameUuid}${partyUuid ? `&party_uuid=${partyUuid}` : ''}`
    const ws = new WebSocket(url)
    wsRef.current = ws
    log('ws created', { readyState: ws.readyState })
    ws.onmessage = (ev) => {
      const raw = String(ev.data)
      log('message raw', raw)
      let msg: any = {}
      try {
        msg = JSON.parse(raw)
      } catch (e) {
        log('message parse error', e)
        return
      }
      log('message', msg)
      if (msg.type === 'waiting') {
        log('waiting')
        setFindingState('waiting')
      }
      if (msg.type === 'start') {
        log('party_start', msg.partyUuid, { userXId: msg.userXId, userOId: msg.userOId })
        setMe(msg.me)
        log('me set', msg.me)
        setBoard(Array(9).fill(''))
        setDone('')
        setTurn('x')
        setFindingState('playing')
        try {
          log('postMessage party_start -> parent')
          window.parent?.postMessage(
            {
              type: 'party_start',
              partyUuid: msg.partyUuid,
              userXId: msg.userXId,
              userOId: msg.userOId,
            },
            '*'
          )
        } catch { }
      }
      if (msg.type === 'state') {
        log('state', { board: msg.board, turn: msg.turn })
        setBoard(msg.board as Cell[])
        setTurn((msg.turn || '') as any)
        if (!me && msg.symbol) {
          setMe(msg.symbol)
          log('me set by state', msg.symbol)
        }
      }
      if (msg.type === 'end') {
        log('end', msg.result)
        if (!me && msg.symbol) {
          setMe(msg.symbol)
          log('me set by end', msg.symbol)
        }
        const result = msg.result as 'x' | 'o' | 'draw'
        const mine = me || (msg.symbol as any) || ''
        setDone(result === 'draw' ? 'Ничья' : result === mine ? 'Вы выиграли!' : 'Вы проиграли!')
        try {
          window.parent?.postMessage({ type: 'party_end', partyUuid: msg.partyUuid, result }, '*')
        } catch { }
        setFindingState('idle')
      }
      if (msg.type === 'ratings') {
        log('ratings', msg)
        try {
          window.parent?.postMessage({ type: 'ratings', userX: msg.userX, userO: msg.userO }, '*')
        } catch { }
      }
    }
    ws.onopen = () => {
      log('open', { readyState: ws.readyState, cookie: document.cookie })
      connectedRef.current = true
      setFindingState('waiting')
    }
    ws.onerror = (e) => {
      log('error', e)
    }
    ws.onclose = (ev) => {
      log('close', { code: (ev as any).code, reason: (ev as any).reason, wasClean: (ev as any).wasClean })
      connectedRef.current = false
      wsRef.current = null
      openingRef.current = false
    }
    return () => {
      try {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CLOSING || connectedRef.current) {
          log('cleanup close', { readyState: ws.readyState, connected: connectedRef.current })
          ws.close()
        }
        openingRef.current = false
      } catch { }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameUuid, find, partyUuid])

  useEffect(() => {
    if (view && partyUuid) {
      ; (async () => {
        const res = await fetch(`http://localhost:11692/api/party/${partyUuid}`)
        const data = await res.json()
        const moves: Array<{ i: number; s: 'x' | 'o' }> = data.moves || []
        const b: Cell[] = Array(9).fill('')
        for (const m of moves) b[m.i] = m.s
        setBoard(b)
        const w = winnerOf(b)
        setDone(w ? (w === 'x' ? 'Победа X' : 'Победа O') : b.every((v) => v) ? 'Ничья' : '')
      })()
    }
  }, [view, partyUuid])

  const play = (i: number) => {
    const log = (...a: any[]) => console.log('[ttt-client]', ...a)
    if (done) {
      log('skip move: done')
      return
    }
    if (board[i]) {
      log('skip move: cell occupied', i)
      return
    }
    if (!wsRef.current) {
      log('skip move: no ws')
      return
    }
    if (me !== turn) {
      log('skip move: not my turn', { me, turn })
      return
    }
    log('send move', i, { readyState: wsRef.current.readyState, partyUuid })
    wsRef.current.send(JSON.stringify({ type: 'move', index: i, partyUuid }))
  }
  return (
    <Box sx={{ p: 3, display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Box key={i} sx={{ border: '4px solid #334155' }}>
            <Box
              onClick={() => play(i)}
              sx={{ display: 'grid', placeItems: 'center', width: 100, height: 100 }}
            >
              {board[i] === 'x' && (
                <Box sx={{ width: 60, height: 60, position: 'relative' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '50%',
                      height: 8,
                      bgcolor: '#22d3ee',
                      transform: 'rotate(45deg)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '50%',
                      height: 8,
                      bgcolor: '#22d3ee',
                      transform: 'rotate(-45deg)',
                    }}
                  />
                </Box>
              )}
              {board[i] === 'o' && (
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    border: '8px solid #a3e635',
                  }}
                />
              )}
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        {done && <Typography variant="body2">{done}</Typography>}
        <Button
          variant="contained"
          onClick={() => {
            const log = (...a: any[]) => console.log('[ttt-client]', ...a)
            log('find_game click -> parent')
            try {
              window.parent?.postMessage({ type: 'find_game' }, '*')
            } catch { }
          }}
          disabled={findingState === 'playing'}
        >
          Найти игру
        </Button>
      </Box>
    </Box>
  )
}
