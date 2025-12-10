import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      bg: string
      text: string
      btnBg: string
      btnText: string
      panelBorder: string
      panelBg: string
      panelShadowOuter: string
      panelShadowInner: string
      overlayTitleText: string
      hudText: string
      hudTextGlow: string
      neonTeal: string
      neonTealGlow: string
      collisionDebug: string
      collisionMissBorder: string
      collisionMissGlow: string
      ballShadowGood: string
      ballShadowMiss: string
      ballInnerLight: string
      ballInnerLightMiss: string
      paddleBg: string
      paddleBorderBlue: string
      paddleBlueShadowInset: string
      paddleBlueLine: string
      opponentBorderRed: string
      opponentRedShadowInset: string
      opponentRedLine: string
      centerBg: string
      hitCenterBg: string
      hitCenterShadow: string
      hitWhiteBg: string
      lifeDotShadow: string
      lifeDotBorder: string
      lifeDotBorderRed: string
      lifeDotBorderBlue: string
      fsToggleBg: string
      fsToggleText: string
      fsToggleBorder: string
      fsToggleHoverBg: string
      shadowDark: string
      btnShadow: string
    }
    gradients: {
      ballGreen: string
      ballMiss: string
      lifeBlue: string
      lifeRed: string
    }
  }
}
