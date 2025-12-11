import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Game from './pages/Game'
import HighScores from './pages/HighScores'

export default function App() {
  console.log(23423)
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/high-scores" element={<HighScores />} />
    </Routes>
  )
}
