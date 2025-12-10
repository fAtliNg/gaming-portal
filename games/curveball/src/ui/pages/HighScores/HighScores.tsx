import React from 'react'
import { Link } from 'react-router-dom'
import Arena from '../../components/Arena'

export default function HighScores() {
  return (
    <div className="screen">
      <div className="orient">
        <Arena showBall={false} aspect={1.55} />
        <div className="highscores-area">
          <div className="hs-panel">
            <div className="hs-title">HIGH SCORES</div>
            <div className="hs-table">
              <div className="hs-header">
                <div className="col level">LEVEL</div>
                <div className="col score">SCORE</div>
                <div className="col name">NAME</div>
              </div>
            </div>
          </div>
          <Link to="/" className="btn hs-mainmenu">MAIN MENU</Link>
        </div>
      </div>
    </div>
  )
}
