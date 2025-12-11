import React from 'react'
import Arena from '../../components/Arena'
import { Screen, Orient, TitleOverlay, Center, Menu, BtnLink } from './styled'

export default function Home() {
  return (
    <Screen>
      <Orient>
        <Arena showBall={false} aspect={1.55} />
        <TitleOverlay>CLIP-CLOP</TitleOverlay>
        <Center>
          <Menu>
            <BtnLink to="/game">Start game</BtnLink>
            <BtnLink to="/high-scores">High score</BtnLink>
          </Menu>
        </Center>
      </Orient>
    </Screen>
  )
}
