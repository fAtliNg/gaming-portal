import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import fs from 'fs'
import path from 'path'

const app = express()
app.use(express.json())
app.use(cors({ origin: ['http://localhost:2008', 'http://127.0.0.1:2008'] }))

app.get('/api/top', (_req, res) => {
  res.json({ items: [] })
})

// simple JSON DB for finished games
const DB_FILE = path.join(process.cwd(), 'games', 'clip-clop', 'server', 'games-db.json')
let gamesDb = new Map()
try {
  const raw = fs.readFileSync(DB_FILE, 'utf8')
  const arr = JSON.parse(raw)
  if (Array.isArray(arr)) {
    gamesDb = new Map(arr.map((g) => [g.roomId, g]))
  }
} catch {}
function persistDb() {
  try {
    const arr = Array.from(gamesDb.values())
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true })
    fs.writeFileSync(DB_FILE, JSON.stringify(arr, null, 2))
  } catch {}
}

app.get('/api/game/:roomId', (req, res) => {
  const roomId = req.params.roomId
  const g = gamesDb.get(roomId)
  if (!g) return res.status(404).json({ error: 'not_found' })
  return res.json(g)
})

app.post('/api/game/finish', (req, res) => {
  const { roomId, blueLives, redLives } = req.body || {}
  if (!roomId || typeof blueLives !== 'number' || typeof redLives !== 'number') {
    return res.status(400).json({ error: 'bad_request' })
  }
  const finishedAt = Date.now()
  const rec = { roomId, blueLives, redLives, finishedAt }
  gamesDb.set(roomId, rec)
  persistDb()
  return res.json({ ok: true })
})

const port = 2001
const server = app.listen(port, () => {})

const wss = new WebSocketServer({ server })


const waiting = []
const rooms = new Map()

function send(ws, msg) {
  try {
    ws.send(JSON.stringify(msg))
  } catch {}
}

wss.on('connection', (ws) => {
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
      
      return
    }
    if (t === 'find_game') {
      send(ws, { type: 'queued' })
      
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
          
        }
      }
  } else if (t === 'paddle') {
      const { roomId, nx, ny, x, y, role } = msg
      const rm = rooms.get(roomId)
      if (!rm) {
        return
      }
      const targets = [rm.a, rm.b].filter((c) => c && c !== ws && c.readyState === 1)
      
      for (const target of targets) {
        send(target, { type: 'opponent_paddle', roomId, role, nx: -nx, ny, x, y })
      }
  } else if (t === 'ball') {
    const { roomId, x, y, depth, vx, vy } = msg
    const rm = rooms.get(roomId)
    if (!rm) return
    const peer = ws === rm.a ? rm.b : rm.a
    if (peer && peer.readyState === 1) send(peer, { type: 'ball_state', x, y, depth, vx, vy })
    return
  } else if (t === 'lives') {
    const { roomId, blueLives, redLives } = msg
    const rm = rooms.get(roomId)
    if (!rm) return
    const peer = ws === rm.a ? rm.b : rm.a
    if (peer && peer.readyState === 1) send(peer, { type: 'lives', blueLives, redLives })
  } else if (t === 'goal') {
    const { roomId, side } = msg
    const rm = rooms.get(roomId)
    if (!rm) return
    const peer = ws === rm.a ? rm.b : rm.a
    if (peer && peer.readyState === 1) send(peer, { type: 'goal', side })
  } else if (t === 'server') {
    const { roomId, server } = msg
    const rm = rooms.get(roomId)
    if (!rm) return
    const peer = ws === rm.a ? rm.b : rm.a
    if (peer && peer.readyState === 1) send(peer, { type: 'server', server })
  } else if (t === 'serve') {
    const { roomId } = msg
    const rm = rooms.get(roomId)
    if (!rm) return
    const peer = ws === rm.a ? rm.b : rm.a
    if (peer && peer.readyState === 1) send(peer, { type: 'serve' })
  }
})
  ws.on('close', () => {
    // remove from waiting
    const i = waiting.indexOf(ws)
    if (i >= 0) waiting.splice(i, 1)
    // tear down room
    for (const [roomId, rm] of rooms.entries()) {
      if (rm.a === ws || rm.b === ws) {
        rooms.delete(roomId)
        const peer = rm.a === ws ? rm.b : rm.a
        if (peer && peer.readyState === 1) send(peer, { type: 'peer_left' })
        
      }
    }
  })
})
