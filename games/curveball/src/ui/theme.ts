import { DefaultTheme } from 'styled-components'

const theme: DefaultTheme = {
  colors: {
    bg: '#000',
    text: '#fff',
    btnBg: '#fff',
    btnText: '#000',
    panelBorder: '#fff',
    panelBg: 'rgba(0,0,0,0.75)',
    panelShadowOuter: 'rgba(255,255,255,0.22)',
    panelShadowInner: 'rgba(255,255,255,0.18)',
    overlayTitleText: '#fff',
    hudText: '#78e7ff',
    hudTextGlow: 'rgba(120, 231, 255, 0.35)',
    neonTeal: 'rgb(155, 252, 251)',
    neonTealGlow: 'rgba(155, 252, 251, 0.35)',
    collisionDebug: 'rgba(155, 252, 251, 0.9)',
    collisionMissBorder: 'rgba(255, 80, 80, 0.95)',
    collisionMissGlow: 'rgba(255, 80, 80, 0.45)',
    ballShadowGood: 'rgba(33, 243, 107, 0.35)',
    ballShadowMiss: 'rgba(255, 80, 80, 0.45)',
    ballInnerLight: 'rgba(255,255,255,0.35)',
    ballInnerLightMiss: 'rgba(255,255,255,0.28)',
    paddleBg: 'rgba(160, 160, 160, 0.35)',
    paddleBorderBlue: '#2151ff',
    paddleBlueShadowInset: 'rgba(33,81,255,0.4)',
    paddleBlueLine: 'rgba(33,81,255,0.8)',
    opponentBorderRed: '#bd1a1a',
    opponentRedShadowInset: 'rgba(189,26,26,0.45)',
    opponentRedLine: 'rgba(189,26,26,0.85)',
    centerBg: 'rgba(0,0,0,0.2)',
    hitCenterBg: 'rgba(189, 26, 26, 0.45)',
    hitCenterShadow: 'rgba(189, 26, 26, 0.35)',
    hitWhiteBg: 'rgba(255, 255, 255, 0.8)',
    lifeDotShadow: 'rgba(255,255,255,0.15)',
    lifeDotBorder: 'rgba(255,255,255,0.4)',
    lifeDotBorderRed: 'rgba(255, 80, 80, 0.75)',
    lifeDotBorderBlue: 'rgba(33, 81, 255, 0.75)',
    fsToggleBg: 'rgba(255,255,255,0.12)',
    fsToggleText: '#fff',
    fsToggleBorder: 'rgba(255,255,255,0.28)',
    fsToggleHoverBg: 'rgba(255,255,255,0.18)',
    shadowDark: 'rgba(0,0,0,0.35)',
    btnShadow: 'rgba(0,0,0,0.45)'
  },
  gradients: {
    ballGreen: 'radial-gradient(circle at 35% 35%, #c9ff9e 0%, #9eff8e 28%, #6cf576 52%, #2cdf50 75%, #0fbf42 92%, #0a9b36 100%)',
    ballMiss: 'radial-gradient(circle at 35% 35%, #ffd0d0 0%, #ffb0b0 28%, #ff8a8a 52%, #ff6b6b 75%, #e84848 92%, #c02020 100%)',
    lifeBlue: 'radial-gradient(circle at 35% 35%, #c0d4ff 0%, #96b6ff 40%, #558bff 80%, #2151ff 100%)',
    lifeRed: 'radial-gradient(circle at 35% 35%, #ffd0d0 0%, #ff8080 48%, #e84848 92%, #c02020 100%)'
  }
}

export default theme
