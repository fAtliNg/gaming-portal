import styled, { keyframes } from 'styled-components'

export const Screen = styled.div`
  position: relative;
  min-height: 100dvh;
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
`

export const Orient = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`

export const FsControls = styled.div`
  position: absolute;
  top: clamp(8px, calc(var(--tunnel-w) * 0.012), 14px);
  right: clamp(28px, calc(var(--tunnel-w) * 0.08), 80px);
  display: flex;
  gap: 10px;
  z-index: 8;
`

export const FsToggle = styled.button`
  appearance: none;
  background: ${({ theme }) => theme.colors.fsToggleBg};
  color: ${({ theme }) => theme.colors.fsToggleText};
  border: 1px solid ${({ theme }) => theme.colors.fsToggleBorder};
  border-radius: 12px;
  padding: 6px 8px;
  cursor: pointer;
  opacity: 0.8;
  box-shadow: 0 6px 16px ${({ theme }) => theme.colors.shadowDark};
  transition: opacity 160ms ease, transform 120ms ease, background 160ms ease;
  &:hover { opacity: 1; background: ${({ theme }) => theme.colors.fsToggleHoverBg}; }
  &:active { transform: translateY(1px); }
  & > svg { width: clamp(18px, calc(var(--tunnel-w) * 0.025), 24px); height: clamp(18px, calc(var(--tunnel-w) * 0.025), 24px); display: block; }
`

export const GameArea = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: var(--tunnel-top);
  width: var(--tunnel-w);
  height: var(--tunnel-h);
  pointer-events: auto;
  touch-action: none;
`

export const HudLeft = styled.div`
  position: absolute;
  top: clamp(8px, calc(var(--tunnel-w) * 0.012), 14px);
  left: clamp(28px, calc(var(--tunnel-w) * 0.08), 80px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: clamp(6px, calc(var(--tunnel-w) * 0.012), 12px);
  z-index: 7;
`

export const HudRight = styled.div`
  position: absolute;
  top: clamp(8px, calc(var(--tunnel-w) * 0.012), 14px);
  right: clamp(28px, calc(var(--tunnel-w) * 0.08), 80px);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: clamp(6px, calc(var(--tunnel-w) * 0.012), 12px);
  z-index: 7;
`

export const HudLevel = styled.div`
  font-family: 'Orbitron', system-ui;
  font-weight: 900;
  font-size: clamp(18px, calc(var(--tunnel-w) * 0.034), 36px);
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.hudText};
  text-shadow: 0 0 10px ${({ theme }) => theme.colors.hudTextGlow};
`

export const HudScore = styled.div`
  font-family: 'Orbitron', system-ui;
  font-weight: 900;
  font-size: clamp(18px, calc(var(--tunnel-w) * 0.034), 36px);
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.hudText};
  text-shadow: 0 0 10px ${({ theme }) => theme.colors.hudTextGlow};
`

export const HudLives = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(6px, calc(var(--tunnel-w) * 0.012), 12px);
`

export const LifeDot = styled.div<{ $variant?: 'red' | 'blue' }>`
  width: clamp(10px, calc(var(--tunnel-w) * 0.02), 18px);
  height: clamp(10px, calc(var(--tunnel-w) * 0.02), 18px);
  border-radius: 50%;
  box-shadow: 0 0 12px ${({ theme }) => theme.colors.lifeDotShadow};
  border: 2px solid ${({ theme }) => theme.colors.lifeDotBorder};
  background: ${({ $variant, theme }) => ($variant === 'red' ? theme.gradients.lifeRed : theme.gradients.lifeBlue)};
  border-color: ${({ $variant, theme }) => ($variant === 'red' ? theme.colors.lifeDotBorderRed : theme.colors.lifeDotBorderBlue)};
`

export const LevelOverlay = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: clamp(24px, 6vh, 72px);
  width: var(--tunnel-w);
  text-align: center;
  font-family: 'Orbitron', system-ui;
  font-weight: 900;
  font-size: clamp(28px, calc(var(--tunnel-w) * 0.12), 110px);
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.text};
  z-index: 8;
  pointer-events: none;
`

export const GameOverOverlay = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--tunnel-w);
  text-align: center;
  font-family: 'Orbitron', system-ui;
  font-weight: 900;
  font-size: clamp(32px, calc(var(--tunnel-w) * 0.14), 130px);
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.text};
  text-shadow: 0 0 10px ${({ theme }) => theme.colors.neonTealGlow};
  z-index: 9;
  pointer-events: none;
`

export const DepthHighlight = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--tunnel-w);
  height: var(--tunnel-h);
  border: 2px solid ${({ theme }) => theme.colors.neonTeal};
  box-shadow: 0 0 10px ${({ theme }) => theme.colors.neonTealGlow}, inset 0 0 8px rgba(155, 252, 251, 0.25);
  z-index: 1;
`

export const CollisionDebug = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  border: 2px dashed ${({ theme }) => theme.colors.collisionDebug};
  box-shadow: 0 0 10px ${({ theme }) => theme.colors.neonTealGlow};
  pointer-events: none;
  z-index: 6;
`

export const Ball = styled.div<{ $missed?: boolean }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  --ballD: clamp(40px, calc(var(--tunnel-w) * 0.10), 120px);
  width: var(--ballD);
  height: var(--ballD);
  border-radius: 50%;
  background: ${({ theme, $missed }) => ($missed ? theme.gradients.ballMiss : theme.gradients.ballGreen)};
  box-shadow: ${({ theme, $missed }) => ($missed ? `0 0 24px ${theme.colors.ballShadowMiss}, inset 0 12px 18px ${theme.colors.ballInnerLightMiss}` : `0 0 24px ${theme.colors.ballShadowGood}, inset 0 12px 18px ${theme.colors.ballInnerLight}`)};
  z-index: 3;
`

export const Paddle = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  --pW: calc(var(--tunnel-w) / 5);
  width: var(--pW);
  height: calc(var(--pW) * 2 / 3);
  background: ${({ theme }) => theme.colors.paddleBg};
  border-radius: 22px;
  border: 3px solid ${({ theme }) => theme.colors.paddleBorderBlue};
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.paddleBlueShadowInset} inset;
  --pcw: 24%;
  --pch: 28%;
  z-index: 4;
`

export const PaddleRed = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  --pW: calc(var(--tunnel-w) / 5);
  width: var(--pW);
  height: calc(var(--pW) * 2 / 3);
  background: ${({ theme }) => theme.colors.paddleBg};
  border-radius: 22px;
  border: 3px solid ${({ theme }) => theme.colors.opponentBorderRed};
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.opponentRedShadowInset} inset;
  --pcw: 24%;
  --pch: 28%;
  z-index: 4;
`

export const PCenter = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--pcw);
  height: var(--pch);
  border: 2px solid ${({ theme }) => theme.colors.paddleBorderBlue};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.centerBg};
`

export const PVTop = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  width: 2px;
  height: calc((100% - var(--pch)) / 2);
  background: ${({ theme }) => theme.colors.paddleBlueLine};
`

export const PVBottom = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: calc(50% + var(--pch) / 2);
  width: 2px;
  height: calc((100% - var(--pch)) / 2);
  background: ${({ theme }) => theme.colors.paddleBlueLine};
`

export const PHLeft = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  height: 2px;
  width: calc((100% - var(--pcw)) / 2);
  background: ${({ theme }) => theme.colors.paddleBlueLine};
`

export const PHRight = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: calc(50% + var(--pcw) / 2);
  height: 2px;
  width: calc((100% - var(--pcw)) / 2);
  background: ${({ theme }) => theme.colors.paddleBlueLine};
`

export const PaddleOpponent = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  --p2W: calc(var(--inner-w) / 5);
  width: var(--p2W);
  height: calc(var(--p2W) * 2 / 3);
  background: ${({ theme }) => theme.colors.paddleBg};
  border-radius: 18px;
  border: 3px solid ${({ theme }) => theme.colors.opponentBorderRed};
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.opponentRedShadowInset} inset;
  --pcw: 24%;
  --pch: 28%;
  z-index: 2;
`

export const PaddleOpponentBlue = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  --p2W: calc(var(--inner-w) / 5);
  width: var(--p2W);
  height: calc(var(--p2W) * 2 / 3);
  background: ${({ theme }) => theme.colors.paddleBg};
  border-radius: 18px;
  border: 3px solid ${({ theme }) => theme.colors.paddleBorderBlue};
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.paddleBlueShadowInset} inset;
  --pcw: 24%;
  --pch: 28%;
  z-index: 2;
`

export const P2Center = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--pcw);
  height: var(--pch);
  border: 2px solid ${({ theme }) => theme.colors.opponentBorderRed};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.centerBg};
`

export const P2VTop = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  width: 2px;
  height: calc((100% - var(--pch)) / 2);
  background: ${({ theme }) => theme.colors.opponentRedLine};
`

export const P2VBottom = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: calc(50% + var(--pch) / 2);
  width: 2px;
  height: calc((100% - var(--pch)) / 2);
  background: ${({ theme }) => theme.colors.opponentRedLine};
`

export const P2HLeft = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  height: 2px;
  width: calc((100% - var(--pcw)) / 2);
  background: ${({ theme }) => theme.colors.opponentRedLine};
`

export const P2HRight = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: calc(50% + var(--pcw) / 2);
  height: 2px;
  width: calc((100% - var(--pcw)) / 2);
  background: ${({ theme }) => theme.colors.opponentRedLine};
`

const hitPulse = keyframes`
  0% { opacity: 0; transform: scale(0.96); }
  30% { opacity: 0.9; transform: scale(1.0); }
  100% { opacity: 0; transform: scale(1.05); }
`

const centerFade = keyframes`
  0% { opacity: 0; }
  30% { opacity: 0.9; }
  100% { opacity: 0; }
`

export const PHits = styled.div`
  pointer-events: none;
  will-change: opacity, transform;
  animation: ${hitPulse} 240ms ease-out forwards;
`

export const PHitCenter = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--pcw);
  height: var(--pch);
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.hitCenterBg};
  box-shadow: inset 0 0 18px ${({ theme }) => theme.colors.hitCenterShadow};
  animation: ${centerFade} 240ms ease-out forwards;
  z-index: 2;
`

export const PHitBL = styled.div`
  position: absolute;
  left: 0;
  top: 50%;
  width: 50%;
  height: 50%;
  background: ${({ theme }) => theme.colors.hitWhiteBg};
  border-radius: 0 0 0 22px;
`

export const PHitBR = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 50%;
  height: 50%;
  background: ${({ theme }) => theme.colors.hitWhiteBg};
  border-radius: 0 0 22px 0;
`

export const PHitTL = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  height: 50%;
  background: ${({ theme }) => theme.colors.hitWhiteBg};
  border-radius: 22px 0 0 0;
`

export const PHitTR = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  width: 50%;
  height: 50%;
  background: ${({ theme }) => theme.colors.hitWhiteBg};
  border-radius: 0 22px 0 0;
`

export const P2HitCenter = styled(PHitCenter)``
export const P2HitBL = styled(PHitBL)`
  border-radius: 0 0 0 18px;
`
export const P2HitBR = styled(PHitBR)`
  border-radius: 0 0 18px 0;
`
export const P2HitTL = styled(PHitTL)`
  border-radius: 18px 0 0 0;
`
export const P2HitTR = styled(PHitTR)`
  border-radius: 0 18px 0 0;
`
