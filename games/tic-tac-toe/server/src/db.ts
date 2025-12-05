import path from 'path'
import { fileURLToPath } from 'url'
import sqlite3 from 'sqlite3'

const sqlite = sqlite3.verbose()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, '..', 'data.db')
const db = new sqlite.Database(dbPath)

db.serialize(() => {
  db.run(
    'CREATE TABLE IF NOT EXISTS parties (id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT UNIQUE NOT NULL, game_uuid TEXT NOT NULL, player_x_id INTEGER NOT NULL, player_o_id INTEGER NOT NULL, moves TEXT NOT NULL, status TEXT NOT NULL, result TEXT, created_at TEXT NOT NULL, finished_at TEXT)'
  )
})

export default db
