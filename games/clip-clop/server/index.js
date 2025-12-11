import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'

const app = express()
app.use(express.json())
app.use(cors({ origin: ['http://localhost:2008', 'http://127.0.0.1:2008'] }))

app.get('/api/top', (_req, res) => {
  res.json({ items: [] })
})

const port = 2001
const server = app.listen(port, () => {
  console.log(`Clip-clop backend on http://localhost:${port}`)
})

const wss = new WebSocketServer({ server })


const waiting = []
const rooms = new Map()

function send(ws, msg) {
  try {
    ws.send(JSON.stringify(msg))
  } catch {}
}

wss.on('connection', (ws) => {
  console.log('[ws] connection opened')
  ws.on('message', (data) => {
    let msg
    try { msg = JSON.parse(data.toString()) } catch { return }
    const t = msg?.type
    if (t === 'join_room') {
      const { roomId, role } = msg
      const rm = rooms.get(roomId)
      if (!rm) return
      if (role === 'blue') rm.a = ws
      else rm.b = ws
      ws.roomId = roomId
      ws.role = role
      send(ws, { type: 'joined', roomId, role })
      console.log(`[ws] join_room room=${roomId} role=${role}`)
      return
    }
    if (t === 'find_game') {
      send(ws, { type: 'queued' })
      console.log('[ws] find_game received')
      // prevent duplicate entries for the same socket
      if (!waiting.includes(ws)) {
        waiting.push(ws)
      }
      if (waiting.length >= 2) {
        // pair two distinct sockets
        const a = waiting.shift()
        let bIndex = waiting.findIndex((c) => c !== a)
        if (bIndex === -1) {
          // no distinct partner yet, put back and wait
          waiting.unshift(a)
        } else {
          const b = waiting.splice(bIndex, 1)[0]
          const roomId = Math.random().toString(36).slice(2, 10)
          rooms.set(roomId, { a: null, b: null })
          send(a, { type: 'match_found', roomId, role: 'blue' })
          send(b, { type: 'match_found', roomId, role: 'red' })
          console.log(`[ws] match_found room=${roomId}`)
        }
      }
    } else if (t === 'paddle') {
      const { roomId, nx, ny, x, y, role } = msg
      const rm = rooms.get(roomId)
      if (!rm) {
        console.log(`[ws] paddle ignored: unknown roomId=${roomId}`)
        return
      }
      const targets = [rm.a, rm.b].filter((c) => c && c !== ws && c.readyState === 1)
      console.log(`[ws] paddle from role=${role} room=${roomId} nx=${nx} ny=${ny}`)
      for (const target of targets) {
        send(target, { type: 'opponent_paddle', roomId, role, nx: -nx, ny, x, y })
      }
    } else if (t === 'ball') {
      const { roomId, x, y, depth, vx, vy } = msg
      const rm = rooms.get(roomId)
      if (!rm) return
      const peer = ws === rm.a ? rm.b : rm.a
      if (peer && peer.readyState === 1) send(peer, { type: 'ball_state', x, y, depth, vx, vy })
    }
  })
  ws.on('close', () => {
    console.log('[ws] connection closed')
    // remove from waiting
    const i = waiting.indexOf(ws)
    if (i >= 0) waiting.splice(i, 1)
    // tear down room
    for (const [roomId, rm] of rooms.entries()) {
      if (rm.a === ws || rm.b === ws) {
        rooms.delete(roomId)
        const peer = rm.a === ws ? rm.b : rm.a
        if (peer && peer.readyState === 1) send(peer, { type: 'peer_left' })
        console.log(`[ws] room ${roomId} torn down`)
      }
    }
  })
})
