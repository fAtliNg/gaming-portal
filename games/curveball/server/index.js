import express from 'express'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors({ origin: ['http://localhost:2006', 'http://127.0.0.1:2006'] }))

app.get('/api/top', (_req, res) => {
  res.json({ items: [] })
})

const port = 2001
app.listen(port, () => {
  console.log(`Curveball backend on http://localhost:${port}`)
})
