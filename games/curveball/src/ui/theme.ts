import { DefaultTheme } from 'styled-components'

const theme: DefaultTheme = {
  colors: {
    bg: '#0b0f1a',
    text: '#e6f0ff',
    btnBg: '#f7fbff',
    btnText: '#0b0f1a',
    panelBorder: '#cfe8ff',
    panelBg: 'rgba(8,12,20,0.75)',
    panelShadowOuter: 'rgba(207,232,255,0.22)',
    panelShadowInner: 'rgba(207,232,255,0.18)',
    overlayTitleText: '#e6f0ff',
    hudText: '#9bd3ff',
    hudTextGlow: 'rgba(155, 211, 255, 0.28)',
    neonTeal: 'rgb(140, 240, 235)',
    neonTealGlow: 'rgba(140, 240, 235, 0.28)',
    collisionDebug: 'rgba(140, 240, 235, 0.8)',
    collisionMissBorder: 'rgba(233, 91, 91, 0.9)',
    collisionMissGlow: 'rgba(233, 91, 91, 0.4)',
    ballShadowGood: 'rgba(34, 198, 122, 0.28)',
    ballShadowMiss: 'rgba(213, 74, 74, 0.38)',
    ballInnerLight: 'rgba(255,255,255,0.32)',
    ballInnerLightMiss: 'rgba(255,255,255,0.24)',
    paddleBg: 'rgba(160, 170, 180, 0.28)',
    paddleBorderBlue: '#3a6cff',
    paddleBlueShadowInset: 'rgba(58,108,255,0.35)',
    paddleBlueLine: 'rgba(58,108,255,0.75)',
    opponentBorderRed: '#d54a4a',
    opponentRedShadowInset: 'rgba(213,74,74,0.38)',
    opponentRedLine: 'rgba(213,74,74,0.8)',
    centerBg: 'rgba(0,0,0,0.18)',
    hitCenterBg: 'rgba(213, 74, 74, 0.42)',
    hitCenterShadow: 'rgba(213, 74, 74, 0.32)',
    hitWhiteBg: 'rgba(255, 255, 255, 0.75)',
    lifeDotShadow: 'rgba(255,255,255,0.12)',
    lifeDotBorder: 'rgba(255,255,255,0.35)',
    lifeDotBorderRed: 'rgba(233, 91, 91, 0.7)',
    lifeDotBorderBlue: 'rgba(58, 108, 255, 0.7)',
    fsToggleBg: 'rgba(255,255,255,0.10)',
    fsToggleText: '#e6f0ff',
    fsToggleBorder: 'rgba(255,255,255,0.24)',
    fsToggleHoverBg: 'rgba(255,255,255,0.16)',
    shadowDark: 'rgba(0,0,0,0.3)',
    btnShadow: 'rgba(0,0,0,0.35)'
  },
  gradients: {
    ballGreen: 'radial-gradient(circle at 35% 35%, #dbffe9 0%, #b8ffda 28%, #8cf7c3 52%, #62e6a7 75%, #22c67a 92%, #149e60 100%)',
    ballMiss: 'radial-gradient(circle at 35% 35%, #ffe0e0 0%, #ffc4c4 28%, #ff9c9c 52%, #f26a6a 75%, #d54a4a 92%, #b83838 100%)',
    lifeBlue: 'radial-gradient(circle at 35% 35%, #e0ecff 0%, #bfd5ff 40%, #8bb4ff 80%, #3a6cff 100%)',
    lifeRed: 'radial-gradient(circle at 35% 35%, #ffd9d9 0%, #ffb3b3 48%, #e26e6e 92%, #d54a4a 100%)'
  }
}

export default theme
