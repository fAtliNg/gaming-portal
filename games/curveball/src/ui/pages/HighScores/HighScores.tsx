import React from 'react'
import Arena from '../../components/Arena'
import { Screen, Orient, HighscoresArea, Panel, Title, Table, Header, MainMenuBtn } from './styled'

export default function HighScores() {
  return (
    <Screen>
      <Orient>
        <Arena showBall={false} aspect={1.55} />
        <HighscoresArea>
          <Panel>
            <Title>HIGH SCORES</Title>
            <Table>
              <Header>
                <div className="col level">LEVEL</div>
                <div className="col score">SCORE</div>
                <div className="col name">NAME</div>
              </Header>
            </Table>
          </Panel>
          <MainMenuBtn to="/">MAIN MENU</MainMenuBtn>
        </HighscoresArea>
      </Orient>
    </Screen>
  )
}
