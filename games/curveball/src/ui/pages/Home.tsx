import React from 'react'
import { Link } from 'react-router-dom'
import Arena from '../components/Arena'

export default function Home() {
  return (
    <div className="screen">
      <div className="orient">
        <Arena showBall={false} aspect={1.55} />
        <div className="title-overlay">CURVEBALL</div>
        <div className="center">
          <div className="menu">
            <Link to="/game" className="btn">Start game</Link>
            <Link to="/high-scores" className="btn">High score</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
