import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import sqlite3 from 'sqlite3'

const sqlite = sqlite3.verbose()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbPath = path.join(__dirname, '..', 'data.db')
const db = new sqlite.Database(dbPath)

db.serialize(() => {
  db.run(
    'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL)'
  )
  db.run('ALTER TABLE users ADD COLUMN name TEXT', () => {})
  db.run('ALTER TABLE users ADD COLUMN avatar_base64 TEXT', () => {})
  db.run('ALTER TABLE users ADD COLUMN role TEXT', () => {})
  db.run('ALTER TABLE users ADD COLUMN language TEXT', () => {})
  db.run('ALTER TABLE users ADD COLUMN session_token TEXT', () => {})
  db.run('UPDATE users SET role = COALESCE(role, "user")')
  db.run(
    'UPDATE users SET role = "admin" WHERE LOWER(email) LIKE "admin@%" OR LOWER(name) = "admin"'
  )
  db.run('UPDATE users SET language = COALESCE(language, "ru")')

  db.run(
    'CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT UNIQUE NOT NULL, name TEXT NOT NULL, author TEXT NOT NULL, host TEXT NOT NULL, port INTEGER NOT NULL, status TEXT NOT NULL DEFAULT "Разработка", icon_base64 TEXT, image_base64 TEXT, created_at TEXT NOT NULL)'
  )
  db.all('PRAGMA table_info(games)', [], (err, rows: Array<{ name: string }> | undefined) => {
    if (!err && Array.isArray(rows) && !rows.find((r) => r.name === 'description')) {
      db.run('ALTER TABLE games ADD COLUMN description TEXT', () => {})
    }
  })

  db.run(
    'CREATE TABLE IF NOT EXISTS ratings (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, game_uuid TEXT NOT NULL, rating INTEGER NOT NULL DEFAULT 1500, UNIQUE(user_id, game_uuid))'
  )
  db.run(
    'CREATE TABLE IF NOT EXISTS chat_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, party_uuid TEXT NOT NULL, user_id INTEGER NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL)'
  )
  db.run(
    'CREATE INDEX IF NOT EXISTS idx_chat_party_created ON chat_messages (party_uuid, created_at)'
  )
  const tttUuid = '11111111-1111-1111-1111-111111111192'
  const iconB64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6vG9kAAAAASUVORK5CYII='
  const imageB64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6vG9kAAAAASUVORK5CYII='
  db.run(
    'INSERT OR IGNORE INTO games (uuid, name, author, host, port, status, icon_base64, image_base64, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      tttUuid,
      'Крестики-нолики',
      'system',
      'localhost',
      1192,
      'Опубликована',
      iconB64,
      imageB64,
      'Классическая игра на поле 3×3. Сыграй против бота. Бот старается выигрывать или блокировать твои ходы.',
      new Date().toISOString(),
    ],
    () => {}
  )
  const curveUuid = '11111111-1111-1111-1111-111111112000'
  db.run(
    'INSERT OR IGNORE INTO games (uuid, name, author, host, port, status, icon_base64, image_base64, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      curveUuid,
      'Curveball',
      'system',
      'localhost',
      2000,
      'Опубликована',
      iconB64,
      imageB64,
      '3D-пинг-понг в тоннеле с вращением мяча, уровнями и бонусами.',
      new Date().toISOString(),
    ],
    () => {}
  )
})

export default db
