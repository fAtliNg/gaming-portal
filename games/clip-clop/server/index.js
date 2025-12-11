import express from 'express'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors({ origin: ['http://localhost:2008', 'http://127.0.0.1:2008'] }))

app.get('/api/top', (_req, res) => {
  res.json({ items: [] })
})

const port = 2001
app.listen(port, () => {
  console.log(`Clip-clop backend on http://localhost:${port}`)
})
