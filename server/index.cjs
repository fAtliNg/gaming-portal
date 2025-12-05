const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const db = require('./db.cjs')

const app = express()
app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173' }))

function now() {
  return new Date().toISOString()
}

app.post('/api/register', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !/.+@.+\..+/.test(email) || !password || password.length < 6) {
    return res.status(400).json({ error: 'Некорректные данные' })
  }
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'Ошибка базы данных' })
    if (row) return res.status(409).json({ error: 'Пользователь уже существует' })
    const hash = bcrypt.hashSync(password, 10)
    db.run(
      'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)',
      [email, hash, now()],
      function (insertErr) {
        if (insertErr) return res.status(500).json({ error: 'Ошибка сохранения' })
        return res.status(201).json({ id: this.lastID, email })
      }
    )
  })
})

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Некорректные данные' })
  db.get('SELECT id, email, password_hash FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'Ошибка базы данных' })
    if (!row) return res.status(401).json({ error: 'Неверный логин или пароль' })
    const ok = bcrypt.compareSync(password, row.password_hash)
    if (!ok) return res.status(401).json({ error: 'Неверный логин или пароль' })
    return res.json({ id: row.id, email: row.email })
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
