import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import db from './db.js'
import type sqlite3 from 'sqlite3'

const app = express()
app.use(express.json({ limit: '10mb' }))
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
    ]
    if (!origin) return callback(null, true)
    return callback(null, allowed.includes(origin))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined
  const allowed = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ]
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  next()
})

function now() {
  return new Date().toISOString()
}

app.post('/api/register', (req, res) => {
  const { email, password, name } = (req.body || {}) as {
    email?: string
    password?: string
    name?: string
  }
  if (!email || !/.+@.+\..+/.test(email) || !password || password.length < 6) {
    return res.status(400).json({ error: 'Некорректные данные' })
  }
  db.get(
    'SELECT id FROM users WHERE email = ?',
    [email],
    (err: Error | null, row: { id: number } | undefined) => {
      if (err) return res.status(500).json({ error: 'Ошибка базы данных' })
      if (row) return res.status(409).json({ error: 'Пользователь уже существует' })
      const hash = bcrypt.hashSync(password, 10)
      const sid = crypto.randomBytes(32).toString('hex')
      db.run(
        'INSERT INTO users (email, password_hash, created_at, name, session_token, role, language) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [email, hash, now(), name || null, sid, 'user', 'ru'],
        function (insertErr: Error | null) {
          if (insertErr) return res.status(500).json({ error: 'Ошибка сохранения' })
          const id = (this as unknown as sqlite3.RunResult).lastID
          setSid(res, sid)
          return res
            .status(201)
            .json({ id, email, name: name || null, role: 'user', language: 'ru' })
        }
      )
    }
  )
})

app.post('/api/login', (req, res) => {
  const { email, password } = (req.body || {}) as { email?: string; password?: string }
  if (!email || !password) return res.status(400).json({ error: 'Некорректные данные' })
  db.get(
    'SELECT id, email, password_hash, name, avatar_base64, role, language FROM users WHERE email = ?',
    [email],
    (
      err: Error | null,
      row:
        | {
            id: number
            email: string
            password_hash: string
            name?: string | null
            avatar_base64?: string | null
            role?: string | null
            language?: string | null
          }
        | undefined
    ) => {
      if (err) return res.status(500).json({ error: 'Ошибка базы данных' })
      if (!row) return res.status(401).json({ error: 'Неверный логин или пароль' })
      const ok = bcrypt.compareSync(password, row.password_hash)
      if (!ok) return res.status(401).json({ error: 'Неверный логин или пароль' })
      const sid = crypto.randomBytes(32).toString('hex')
      db.run('UPDATE users SET session_token = ? WHERE id = ?', [sid, row.id], (updateErr) => {
        if (updateErr) return res.status(500).json({ error: 'Ошибка сохранения' })
        setSid(res, sid)
        return res.json({
          id: row.id,
          email: row.email,
          name: row.name || null,
          avatarBase64: row.avatar_base64 || null,
          role: row.role || 'user',
          language: row.language || 'ru',
        })
      })
    }
  )
})

app.put('/api/account', (req, res) => {
  const { email, avatarBase64 } = (req.body || {}) as {
    email?: string
    avatarBase64?: string | null
  }
  if (!email) return res.status(400).json({ error: 'Некорректные данные' })
  db.run(
    'UPDATE users SET avatar_base64 = ? WHERE email = ?',
    [avatarBase64 || null, email],
    function (err: Error | null) {
      if (err) return res.status(500).json({ error: 'Ошибка сохранения' })
      if ((this as unknown as sqlite3.RunResult).changes === 0)
        return res.status(404).json({ error: 'Пользователь не найден' })
      db.get(
        'SELECT id, email, name, avatar_base64 FROM users WHERE email = ?',
        [email],
        (
          getErr: Error | null,
          row:
            | { id: number; email: string; name?: string | null; avatar_base64?: string | null }
            | undefined
        ) => {
          if (getErr) return res.status(500).json({ error: 'Ошибка базы данных' })
          if (!row) return res.status(404).json({ error: 'Пользователь не найден' })
          return res.json({
            id: row.id,
            email: row.email,
            name: row.name || null,
            avatarBase64: row.avatar_base64 || null,
          })
        }
      )
    }
  )
})

const port = Number(process.env.PORT) || 3000
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
function parseSid(req: express.Request) {
  const raw = req.headers.cookie || ''
  const sidPair = raw
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith('sid='))
  return sidPair ? sidPair.split('=')[1] : undefined
}

function setSid(res: express.Response, sid: string) {
  res.cookie('sid', sid, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
  })
}

app.get('/api/session', (req, res) => {
  const sid = parseSid(req)
  if (!sid) return res.status(401).json({ error: 'Нет сессии' })
  db.get(
    'SELECT id, email, name, avatar_base64, role, language FROM users WHERE session_token = ?',
    [sid],
    (
      err: Error | null,
      row:
        | {
            id: number
            email: string
            name?: string | null
            avatar_base64?: string | null
            role?: string | null
            language?: string | null
          }
        | undefined
    ) => {
      if (err) return res.status(500).json({ error: 'Ошибка базы данных' })
      if (!row) return res.status(401).json({ error: 'Нет сессии' })
      return res.json({
        id: row.id,
        email: row.email,
        name: row.name || null,
        avatarBase64: row.avatar_base64 || null,
        role: row.role || 'user',
        language: row.language || 'ru',
      })
    }
  )
})

app.post('/api/logout', (req, res) => {
  const sid = parseSid(req)
  if (sid) {
    db.run('UPDATE users SET session_token = NULL WHERE session_token = ?', [sid], () => {})
  }
  res.clearCookie('sid')
  return res.json({ ok: true })
})
app.get('/api/users', (req, res) => {
  const q = (req.query.q as string) || ''
  const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '10', 10), 1), 100)
  const offset = (page - 1) * limit
  const like = `%${q}%`
  db.all(
    'SELECT id, email, name, avatar_base64, role FROM users WHERE email LIKE ? OR name LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?',
    [like, like, limit, offset],
    (
      err: Error | null,
      rows:
        | Array<{
            id: number
            email: string
            name?: string | null
            avatar_base64?: string | null
            role?: string | null
          }>
        | undefined
    ) => {
      if (err) return res.status(500).json({ error: 'Ошибка базы данных' })
      db.get(
        'SELECT COUNT(*) as c FROM users WHERE email LIKE ? OR name LIKE ?',
        [like, like],
        (cntErr: Error | null, cntRow: { c: number } | undefined) => {
          if (cntErr) return res.status(500).json({ error: 'Ошибка базы данных' })
          const items = (rows || []).map((r) => ({
            id: r.id,
            email: r.email,
            name: r.name || '',
            avatarBase64: r.avatar_base64 || null,
            role: r.role || 'user',
          }))
          return res.json({ items, total: cntRow?.c || 0, page, limit })
        }
      )
    }
  )
})
app.put('/api/users/:id/role', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const { role } = (req.body || {}) as { role?: string }
  const allowed = ['admin', 'developer', 'user']
  if (!allowed.includes(role || '')) return res.status(400).json({ error: 'Некорректная роль' })
  db.run('UPDATE users SET role = ? WHERE id = ?', [role, id], function (err: Error | null) {
    if (err) return res.status(500).json({ error: 'Ошибка сохранения' })
    if ((this as unknown as sqlite3.RunResult).changes === 0)
      return res.status(404).json({ error: 'Пользователь не найден' })
    db.get(
      'SELECT id, email, name, avatar_base64, role FROM users WHERE id = ?',
      [id],
      (
        getErr: Error | null,
        row:
          | {
              id: number
              email: string
              name?: string | null
              avatar_base64?: string | null
              role?: string | null
            }
          | undefined
      ) => {
        if (getErr) return res.status(500).json({ error: 'Ошибка базы данных' })
        if (!row) return res.status(404).json({ error: 'Пользователь не найден' })
        return res.json({
          id: row.id,
          email: row.email,
          name: row.name || '',
          avatarBase64: row.avatar_base64 || null,
          role: row.role || 'user',
        })
      }
    )
  })
})

app.get('/api/games', (req, res) => {
  const q = (req.query.q as string) || ''
  const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '10', 10), 1), 100)
  const offset = (page - 1) * limit
  const like = `%${q}%`
  db.all(
    'SELECT uuid, name, author, host, port, status, icon_base64, image_base64, description FROM games WHERE name LIKE ? OR author LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?',
    [like, like, limit, offset],
    (
      err: Error | null,
      rows:
        | Array<{
            uuid: string
            name: string
            author: string
            host: string
            port: number
            status: string
            icon_base64?: string | null
            image_base64?: string | null
            description?: string | null
          }>
        | undefined
    ) => {
      if (err) return res.status(500).json({ error: 'Ошибка базы данных' })
      db.get(
        'SELECT COUNT(*) as c FROM games WHERE name LIKE ? OR author LIKE ?',
        [like, like],
        (cntErr: Error | null, cntRow: { c: number } | undefined) => {
          if (cntErr) return res.status(500).json({ error: 'Ошибка базы данных' })
          const items = (rows || []).map((r) => ({
            uuid: r.uuid,
            name: r.name,
            author: r.author,
            host: r.host,
            port: r.port,
            status: r.status || 'Разработка',
            iconBase64: r.icon_base64 || null,
            imageBase64: r.image_base64 || null,
            description: (r as unknown as { description?: string | null }).description || null,
          }))
          return res.json({ items, total: cntRow?.c || 0, page, limit })
        }
      )
    }
  )
})

app.get('/api/games/:uuid', (req, res) => {
  const { uuid } = req.params
  db.get(
    'SELECT uuid, name, author, host, port, status, icon_base64, image_base64, description FROM games WHERE uuid = ?',
    [uuid],
    (
      err: Error | null,
      row:
        | {
            uuid: string
            name: string
            author: string
            host: string
            port: number
            status: string
            icon_base64?: string | null
            image_base64?: string | null
            description?: string | null
          }
        | undefined
    ) => {
      if (err) return res.status(500).json({ error: 'Ошибка базы данных' })
      if (!row) return res.status(404).json({ error: 'Игра не найдена' })
      return res.json({
        uuid: row.uuid,
        name: row.name,
        author: row.author,
        host: row.host,
        port: row.port,
        status: row.status || 'Разработка',
        iconBase64: row.icon_base64 || null,
        imageBase64: row.image_base64 || null,
        description: row.description || null,
      })
    }
  )
})

app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id || '0', 10)
  if (!id) return res.status(400).json({ error: 'Некорректные данные' })
  db.get(
    'SELECT id, email FROM users WHERE id = ?',
    [id],
    (err: Error | null, row: { id: number; email: string } | undefined) => {
      if (err) return res.status(500).json({ error: 'Ошибка базы данных' })
      if (!row) return res.status(404).json({ error: 'Пользователь не найден' })
      return res.json({ id: row.id, email: row.email })
    }
  )
})

app.get('/api/ratings/:gameUuid/:userId', (req, res) => {
  const { gameUuid, userId } = req.params
  const uid = parseInt(userId || '0', 10)
  if (!uid || !gameUuid) return res.status(400).json({ error: 'Некорректные данные' })
  db.get(
    'SELECT rating FROM ratings WHERE user_id = ? AND game_uuid = ?',
    [uid, gameUuid],
    (err: Error | null, row: { rating: number } | undefined) => {
      if (err) return res.status(500).json({ error: 'Ошибка базы данных' })
      const rating = row?.rating ?? 1500
      return res.json({ userId: uid, gameUuid, rating })
    }
  )
})

app.get('/api/chat/:partyUuid', (req, res) => {
  const { partyUuid } = req.params
  const limit = Math.min(Math.max(parseInt(String(req.query.limit || '50'), 10), 1), 200)
  const offset = Math.max(parseInt(String(req.query.offset || '0'), 10), 0)
  if (!partyUuid) return res.status(400).json({ error: 'Некорректные данные' })
  db.all(
    'SELECT c.id, c.party_uuid, c.user_id, u.name, u.email, c.message, c.created_at FROM chat_messages c LEFT JOIN users u ON u.id = c.user_id WHERE c.party_uuid = ? ORDER BY c.created_at ASC LIMIT ? OFFSET ?',
    [partyUuid, limit, offset],
    (err: Error | null, rows: Array<{ id: number; party_uuid: string; user_id: number; name?: string | null; email: string; message: string; created_at: string }> | undefined) => {
      if (err) return res.status(500).json({ error: 'Ошибка базы данных' })
      const items = (rows || []).map((r) => ({
        id: r.id,
        partyUuid: r.party_uuid,
        userId: r.user_id,
        userName: r.name || r.email.split('@')[0],
        message: r.message,
        createdAt: r.created_at,
      }))
      return res.json({ items })
    }
  )
})

app.post('/api/chat/send', (req, res) => {
  const { partyUuid, message } = (req.body || {}) as { partyUuid?: string; message?: string }
  if (!partyUuid || !message || typeof message !== 'string' || !message.trim())
    return res.status(400).json({ error: 'Некорректные данные' })
  const sid = parseSid(req)
  if (!sid) return res.status(401).json({ error: 'Нет сессии' })
  db.get(
    'SELECT id FROM users WHERE session_token = ?',
    [sid],
    (getErr: Error | null, row: { id: number } | undefined) => {
      if (getErr) return res.status(500).json({ error: 'Ошибка базы данных' })
      if (!row) return res.status(401).json({ error: 'Нет сессии' })
      const now = new Date().toISOString()
      db.run(
        'INSERT INTO chat_messages (party_uuid, user_id, message, created_at) VALUES (?, ?, ?, ?)',
        [partyUuid, row.id, message.trim(), now],
        function (err2: Error | null) {
          if (err2) return res.status(500).json({ error: 'Ошибка сохранения' })
          return res.status(201).json({ ok: true, id: (this as unknown as sqlite3.RunResult).lastID })
        }
      )
    }
  )
})

app.post('/api/ratings/update', (req, res) => {
  const { gameUuid, partyUuid, userXId, userOId, result } = (req.body || {}) as {
    gameUuid?: string
    partyUuid?: string
    userXId?: number
    userOId?: number
    result?: 'x' | 'o' | 'draw'
  }
  if (!gameUuid || !partyUuid || !userXId || !userOId || !result)
    return res.status(400).json({ error: 'Некорректные данные' })

  const K = 32
  db.serialize(() => {
    db.run('INSERT OR IGNORE INTO ratings (user_id, game_uuid, rating) VALUES (?, ?, 1500)', [
      userXId,
      gameUuid,
    ])
    db.run('INSERT OR IGNORE INTO ratings (user_id, game_uuid, rating) VALUES (?, ?, 1500)', [
      userOId,
      gameUuid,
    ])
    db.get(
      'SELECT rating FROM ratings WHERE user_id = ? AND game_uuid = ?',
      [userXId, gameUuid],
      (errX: Error | null, rowX: { rating: number } | undefined) => {
        if (errX) return res.status(500).json({ error: 'Ошибка базы данных' })
        db.get(
          'SELECT rating FROM ratings WHERE user_id = ? AND game_uuid = ?',
          [userOId, gameUuid],
          (errO: Error | null, rowO: { rating: number } | undefined) => {
            if (errO) return res.status(500).json({ error: 'Ошибка базы данных' })
            const RX = rowX?.rating ?? 1500
            const RO = rowO?.rating ?? 1500
            const EX = 1 / (1 + Math.pow(10, (RO - RX) / 400))
            const EO = 1 / (1 + Math.pow(10, (RX - RO) / 400))
            const SX = result === 'x' ? 1 : result === 'draw' ? 0.5 : 0
            const SO = result === 'o' ? 1 : result === 'draw' ? 0.5 : 0
            const newRX = Math.round(RX + K * (SX - EX))
            const newRO = Math.round(RO + K * (SO - EO))
            const deltaX = newRX - RX
            const deltaO = newRO - RO
            db.run('UPDATE ratings SET rating = ? WHERE user_id = ? AND game_uuid = ?', [
              newRX,
              userXId,
              gameUuid,
            ])
            db.run('UPDATE ratings SET rating = ? WHERE user_id = ? AND game_uuid = ?', [
              newRO,
              userOId,
              gameUuid,
            ])
            return res.json({
              partyUuid,
              gameUuid,
              userX: { id: userXId, rating: newRX, delta: deltaX },
              userO: { id: userOId, rating: newRO, delta: deltaO },
            })
          }
        )
      }
    )
  })
})

app.post('/api/games', (req, res) => {
  const { name, host, port, iconBase64, imageBase64, description } = (req.body || {}) as {
    name?: string
    host?: string
    port?: number
    iconBase64?: string | null
    imageBase64?: string | null
    description?: string | null
  }
  if (!name || !host || !port || typeof port !== 'number') {
    return res.status(400).json({ error: 'Некорректные данные' })
  }
  const sid = parseSid(req)
  if (!sid) return res.status(401).json({ error: 'Нет сессии' })
  db.get(
    'SELECT email, name, role FROM users WHERE session_token = ?',
    [sid],
    (
      getErr: Error | null,
      u: { email: string; name?: string | null; role?: string | null } | undefined
    ) => {
      if (getErr) return res.status(500).json({ error: 'Ошибка базы данных' })
      if (!u) return res.status(401).json({ error: 'Нет сессии' })
      const author = (u.name && u.name.trim()) || u.email.split('@')[0]
      const uuid = crypto.randomUUID()
      db.run(
        'INSERT INTO games (uuid, name, author, host, port, status, icon_base64, image_base64, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          uuid,
          name,
          author,
          host,
          port,
          'Разработка',
          iconBase64 || null,
          imageBase64 || null,
          description || null,
          now(),
        ],
        function (err2: Error | null) {
          if (err2) return res.status(500).json({ error: 'Ошибка сохранения' })
          return res.status(201).json({
            uuid,
            name,
            author,
            host,
            port,
            status: 'Разработка',
            iconBase64: iconBase64 || null,
            imageBase64: imageBase64 || null,
            description: description || null,
          })
        }
      )
    }
  )
})

app.put('/api/games/:uuid', (req, res) => {
  const { uuid } = req.params
  const { name, host, port, iconBase64, imageBase64, description } = (req.body || {}) as {
    name?: string
    host?: string
    port?: number
    iconBase64?: string | null
    imageBase64?: string | null
    description?: string | null
  }
  if (!name || !host || !port || typeof port !== 'number') {
    return res.status(400).json({ error: 'Некорректные данные' })
  }
  db.run(
    'UPDATE games SET name = ?, host = ?, port = ?, icon_base64 = ?, image_base64 = ?, description = ? WHERE uuid = ?',
    [name, host, port, iconBase64 || null, imageBase64 || null, description || null, uuid],
    function (err: Error | null) {
      if (err) return res.status(500).json({ error: 'Ошибка сохранения' })
      if ((this as unknown as sqlite3.RunResult).changes === 0)
        return res.status(404).json({ error: 'Игра не найдена' })
      db.get(
        'SELECT uuid, name, author, host, port, status, icon_base64, image_base64, description FROM games WHERE uuid = ?',
        [uuid],
        (
          getErr: Error | null,
          row:
            | {
                uuid: string
                name: string
                author: string
                host: string
                port: number
                status: string
                icon_base64?: string | null
                image_base64?: string | null
                description?: string | null
              }
            | undefined
        ) => {
          if (getErr) return res.status(500).json({ error: 'Ошибка базы данных' })
          if (!row) return res.status(404).json({ error: 'Игра не найдена' })
          return res.json({
            uuid: row.uuid,
            name: row.name,
            author: row.author,
            host: row.host,
            port: row.port,
            status: row.status || 'Разработка',
            iconBase64: row.icon_base64 || null,
            imageBase64: row.image_base64 || null,
            description: row.description || null,
          })
        }
      )
    }
  )
})

app.put('/api/games/:uuid/status', (req, res) => {
  const { uuid } = req.params
  const { status } = (req.body || {}) as { status?: string }
  const allowed = ['Опубликована', 'Разработка']
  if (!allowed.includes(status || '')) return res.status(400).json({ error: 'Некорректный статус' })
  db.run(
    'UPDATE games SET status = ? WHERE uuid = ?',
    [status, uuid],
    function (err: Error | null) {
      if (err) return res.status(500).json({ error: 'Ошибка сохранения' })
      if ((this as unknown as sqlite3.RunResult).changes === 0)
        return res.status(404).json({ error: 'Игра не найдена' })
      db.get(
        'SELECT uuid, name, author, host, port, status, icon_base64 FROM games WHERE uuid = ?',
        [uuid],
        (
          getErr: Error | null,
          row:
            | {
                uuid: string
                name: string
                author: string
                host: string
                port: number
                status: string
                icon_base64?: string | null
              }
            | undefined
        ) => {
          if (getErr) return res.status(500).json({ error: 'Ошибка базы данных' })
          if (!row) return res.status(404).json({ error: 'Игра не найдена' })
          return res.json({
            uuid: row.uuid,
            name: row.name,
            author: row.author,
            host: row.host,
            port: row.port,
            status: row.status || 'Разработка',
            iconBase64: row.icon_base64 || null,
          })
        }
      )
    }
  )
})
app.put('/api/language', (req, res) => {
  const { language } = (req.body || {}) as { language?: string }
  const allowed = ['ru', 'en']
  if (!allowed.includes(language || '')) return res.status(400).json({ error: 'Некорректный язык' })
  const sid = parseSid(req)
  if (!sid) return res.status(401).json({ error: 'Нет сессии' })
  db.get(
    'SELECT id FROM users WHERE session_token = ?',
    [sid],
    (getErr: Error | null, row: { id: number } | undefined) => {
      if (getErr) return res.status(500).json({ error: 'Ошибка базы данных' })
      if (!row) return res.status(401).json({ error: 'Нет сессии' })
      db.run(
        'UPDATE users SET language = ? WHERE id = ?',
        [language, row.id],
        function (err: Error | null) {
          if (err) return res.status(500).json({ error: 'Ошибка сохранения' })
          return res.json({ ok: true, language })
        }
      )
    }
  )
})
