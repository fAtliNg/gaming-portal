import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  html, body, #root { height: 100%; }
  html, body { overflow: hidden; }
  body { margin: 0; background: ${({ theme }) => theme.colors.bg}; color: ${({ theme }) => theme.colors.text}; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif; }

  .portrait, .landscape, html, body, #root, .screen { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
  .screen { position: relative; min-height: 100dvh; height: 100dvh; width: 100vw; overflow: hidden; transform-origin: center center; }
  .center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
  .menu { display: flex; flex-direction: column; gap: clamp(12px, calc(var(--tunnel-w) * 0.02), 20px); align-items: center; }
  .title-overlay { position: absolute; left: 50%; transform: translateX(-50%); top: calc(var(--tunnel-top) + var(--tunnel-h) * 0.115); width: var(--tunnel-w); text-align: center; font-family: 'Orbitron', system-ui; font-weight: 900; font-size: var(--title-fs); letter-spacing: var(--title-ls); text-transform: uppercase; color: ${({ theme }) => theme.colors.overlayTitleText}; white-space: nowrap; }
  .btn { appearance: none; background: ${({ theme }) => theme.colors.btnBg}; color: ${({ theme }) => theme.colors.btnText}; border: none; border-radius: 16px; text-decoration: none; padding: clamp(7px, calc(var(--tunnel-w) * 0.01), 11px) clamp(8px, calc(var(--tunnel-w) * 0.012), 12px); font-family: 'Orbitron', system-ui; font-weight: 700; font-size: clamp(12px, calc(var(--tunnel-w) * 0.028), 22px); cursor: pointer; letter-spacing: 0.16em; text-transform: uppercase; width: clamp(170px, calc(var(--tunnel-w) * 0.28), 360px); text-align: center; box-shadow: 0 6px 16px ${({ theme }) => theme.colors.btnShadow}; }
  .btn:active { transform: translateY(1px); }

  .game-area { position: absolute; left: 50%; transform: translateX(-50%); top: var(--tunnel-top); width: var(--tunnel-w); height: var(--tunnel-h); pointer-events: auto; touch-action: none; }
  .highscores-area { position: absolute; left: 50%; transform: translateX(-50%); top: var(--tunnel-top); width: var(--tunnel-w); height: var(--tunnel-h); pointer-events: auto; }
  .hs-panel { position: absolute; left: 50%; transform: translateX(-50%); top: calc(var(--tunnel-h) * 0.08); width: calc(var(--tunnel-w) * 0.88); height: calc(var(--tunnel-h) * 0.76); border: 3px solid ${({ theme }) => theme.colors.panelBorder}; border-radius: 16px; background: ${({ theme }) => theme.colors.panelBg}; box-shadow: 0 0 10px ${({ theme }) => theme.colors.panelShadowOuter}, inset 0 0 6px ${({ theme }) => theme.colors.panelShadowInner}; }
  .hs-title { position: absolute; left: 50%; transform: translateX(-50%); top: clamp(20px, calc(var(--tunnel-h) * 0.06), 60px); width: 100%; text-align: center; font-family: 'Orbitron', system-ui; font-weight: 900; font-size: clamp(24px, calc(var(--tunnel-w) * 0.08), 80px); letter-spacing: 0.18em; color: ${({ theme }) => theme.colors.text}; }
  .hs-table { position: absolute; left: 50%; transform: translateX(-50%); top: clamp(100px, calc(var(--tunnel-h) * 0.24), 140px); width: calc(100% - clamp(40px, calc(var(--tunnel-w) * 0.06), 80px)); height: calc(100% - clamp(160px, calc(var(--tunnel-h) * 0.26), 220px)); }
  .hs-header { display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: center; font-family: 'Orbitron', system-ui; font-weight: 900; font-size: clamp(16px, calc(var(--tunnel-w) * 0.04), 42px); letter-spacing: 0.18em; color: ${({ theme }) => theme.colors.text}; }
  .hs-header .col { text-align: center; }
  .hs-mainmenu { position: absolute; left: 50%; transform: translateX(-50%); bottom: clamp(12px, calc(var(--tunnel-h) * 0.06), 28px); }
  .hs-mainmenu:active { transform: translateX(-50%) translateY(1px); }
  .level-overlay { position: absolute; left: 50%; transform: translateX(-50%); top: calc(var(--tunnel-h) * 0.16); width: var(--tunnel-w); text-align: center; font-family: 'Orbitron', system-ui; font-weight: 900; font-size: clamp(28px, calc(var(--tunnel-w) * 0.12), 110px); letter-spacing: 0.18em; color: ${({ theme }) => theme.colors.text}; }
  .game-over-overlay { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: var(--tunnel-w); text-align: center; font-family: 'Orbitron', system-ui; font-weight: 900; font-size: clamp(32px, calc(var(--tunnel-w) * 0.14), 130px); letter-spacing: 0.18em; color: ${({ theme }) => theme.colors.text}; text-shadow: 0 0 10px ${({ theme }) => theme.colors.neonTealGlow}; z-index: 9; pointer-events: none; }
  .depth-highlight { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: var(--tunnel-w); height: var(--tunnel-h); border: 2px solid ${({ theme }) => theme.colors.neonTeal}; box-shadow: 0 0 10px ${({ theme }) => theme.colors.neonTealGlow}, inset 0 0 8px rgba(155, 252, 251, 0.25); z-index: 1; }
  .collision-debug { position: absolute; transform: translate(-50%, -50%); border: 2px dashed ${({ theme }) => theme.colors.collisionDebug}; box-shadow: 0 0 10px ${({ theme }) => theme.colors.neonTealGlow}; pointer-events: none; z-index: 6; }
  .collision-debug.miss { border-color: ${({ theme }) => theme.colors.collisionMissBorder}; box-shadow: 0 0 10px ${({ theme }) => theme.colors.collisionMissGlow}; }
  .ball { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); --ballD: clamp(40px, calc(var(--tunnel-w) * 0.10), 120px); width: var(--ballD); height: var(--ballD); border-radius: 50%; background: ${({ theme }) => theme.gradients.ballGreen}; box-shadow: 0 0 24px ${({ theme }) => theme.colors.ballShadowGood}, inset 0 12px 18px ${({ theme }) => theme.colors.ballInnerLight}; z-index: 3; }
  .ball.miss { background: ${({ theme }) => theme.gradients.ballMiss}; box-shadow: 0 0 24px ${({ theme }) => theme.colors.ballShadowMiss}, inset 0 12px 18px ${({ theme }) => theme.colors.ballInnerLightMiss}; }
  .paddle { position: absolute; transform: translate(-50%, -50%); --pW: calc(var(--tunnel-w) / 5); width: var(--pW); height: calc(var(--pW) * 2 / 3); background: ${({ theme }) => theme.colors.paddleBg}; border-radius: 22px; border: 3px solid ${({ theme }) => theme.colors.paddleBorderBlue}; box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.paddleBlueShadowInset} inset; --pcw: 24%; --pch: 28%; z-index: 4; }
  .p-center { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: var(--pcw); height: var(--pch); border: 2px solid ${({ theme }) => theme.colors.paddleBorderBlue}; border-radius: 6px; background: ${({ theme }) => theme.colors.centerBg}; }
  .p-v-top { position: absolute; left: 50%; transform: translateX(-50%); top: 0; width: 2px; height: calc((100% - var(--pch)) / 2); background: ${({ theme }) => theme.colors.paddleBlueLine}; }
  .p-v-bottom { position: absolute; left: 50%; transform: translateX(-50%); top: calc(50% + var(--pch) / 2); width: 2px; height: calc((100% - var(--pch)) / 2); background: ${({ theme }) => theme.colors.paddleBlueLine}; }
  .p-h-left { position: absolute; top: 50%; transform: translateY(-50%); left: 0; height: 2px; width: calc((100% - var(--pcw)) / 2); background: ${({ theme }) => theme.colors.paddleBlueLine}; }
  .p-h-right { position: absolute; top: 50%; transform: translateY(-50%); left: calc(50% + var(--pcw) / 2); height: 2px; width: calc((100% - var(--pcw)) / 2); background: ${({ theme }) => theme.colors.paddleBlueLine}; }

  .paddle-opponent { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); --p2W: calc(var(--inner-w) / 5); width: var(--p2W); height: calc(var(--p2W) * 2 / 3); background: ${({ theme }) => theme.colors.paddleBg}; border-radius: 18px; border: 3px solid ${({ theme }) => theme.colors.opponentBorderRed}; box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.opponentRedShadowInset} inset; --pcw: 24%; --pch: 28%; z-index: 2; }
  .p2-center { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: var(--pcw); height: var(--pch); border: 2px solid ${({ theme }) => theme.colors.opponentBorderRed}; border-radius: 6px; background: ${({ theme }) => theme.colors.centerBg}; }
  .p2-v-top { position: absolute; left: 50%; transform: translateX(-50%); top: 0; width: 2px; height: calc((100% - var(--pch)) / 2); background: ${({ theme }) => theme.colors.opponentRedLine}; }
  .p2-v-bottom { position: absolute; left: 50%; transform: translateX(-50%); top: calc(50% + var(--pch) / 2); width: 2px; height: calc((100% - var(--pch)) / 2); background: ${({ theme }) => theme.colors.opponentRedLine}; }
  .p2-h-left { position: absolute; top: 50%; transform: translateY(-50%); left: 0; height: 2px; width: calc((100% - var(--pcw)) / 2); background: ${({ theme }) => theme.colors.opponentRedLine}; }
  .p2-h-right { position: absolute; top: 50%; transform: translateY(-50%); left: calc(50% + var(--pcw) / 2); height: 2px; width: calc((100% - var(--pcw)) / 2); background: ${({ theme }) => theme.colors.opponentRedLine}; }

  .p-hit, .p2-hit { pointer-events: none; will-change: opacity, transform; animation: hitPulse 240ms ease-out forwards; }
  @keyframes hitPulse { 0% { opacity: 0; transform: scale(0.96); } 30% { opacity: 0.9; transform: scale(1.0); } 100% { opacity: 0; transform: scale(1.05); } }
  @keyframes centerFade { 0% { opacity: 0; } 30% { opacity: 0.9; } 100% { opacity: 0; } }

  .p-hit.center { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: var(--pcw); height: var(--pch); border-radius: 6px; background: ${({ theme }) => theme.colors.hitCenterBg}; box-shadow: inset 0 0 18px ${({ theme }) => theme.colors.hitCenterShadow}; animation: centerFade 240ms ease-out forwards; z-index: 2; }
  .p-hit.bottom-left { position: absolute; left: 0; top: 50%; width: 50%; height: 50%; background: ${({ theme }) => theme.colors.hitWhiteBg}; border-radius: 0 0 0 22px; }
  .p-hit.bottom-right { position: absolute; left: 50%; top: 50%; width: 50%; height: 50%; background: ${({ theme }) => theme.colors.hitWhiteBg}; border-radius: 0 0 22px 0; }
  .p-hit.top-left { position: absolute; left: 0; top: 0; width: 50%; height: 50%; background: ${({ theme }) => theme.colors.hitWhiteBg}; border-radius: 22px 0 0 0; }
  .p-hit.top-right { position: absolute; left: 50%; top: 0; width: 50%; height: 50%; background: ${({ theme }) => theme.colors.hitWhiteBg}; border-radius: 0 22px 0 0; }

  .p2-hit.center { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: var(--pcw); height: var(--pch); border-radius: 6px; background: ${({ theme }) => theme.colors.hitCenterBg}; box-shadow: inset 0 0 18px ${({ theme }) => theme.colors.hitCenterShadow}; animation: centerFade 240ms ease-out forwards; z-index: 2; }
  .p2-hit.bottom-left { position: absolute; left: 0; top: 50%; width: 50%; height: 50%; background: ${({ theme }) => theme.colors.hitWhiteBg}; border-radius: 0 0 0 18px; }
  .p2-hit.bottom-right { position: absolute; left: 50%; top: 50%; width: 50%; height: 50%; background: ${({ theme }) => theme.colors.hitWhiteBg}; border-radius: 0 0 18px 0; }
  .p2-hit.top-left { position: absolute; left: 0; top: 0; width: 50%; height: 50%; background: ${({ theme }) => theme.colors.hitWhiteBg}; border-radius: 18px 0 0 0; }
  .p2-hit.top-right { position: absolute; left: 50%; top: 0; width: 50%; height: 50%; background: ${({ theme }) => theme.colors.hitWhiteBg}; border-radius: 0 18px 0 0; }

  .hud-left, .hud-right { position: absolute; top: clamp(8px, calc(var(--tunnel-w) * 0.012), 14px); display: flex; flex-direction: column; align-items: flex-start; gap: clamp(6px, calc(var(--tunnel-w) * 0.012), 12px); z-index: 7; }
  .hud-left { left: clamp(28px, calc(var(--tunnel-w) * 0.08), 80px); }
  .hud-right { right: clamp(28px, calc(var(--tunnel-w) * 0.08), 80px); align-items: flex-end; }
  .hud-level { font-family: 'Orbitron', system-ui; font-weight: 900; font-size: clamp(18px, calc(var(--tunnel-w) * 0.034), 36px); letter-spacing: 0.18em; color: ${({ theme }) => theme.colors.hudText}; text-shadow: 0 0 10px ${({ theme }) => theme.colors.hudTextGlow}; }
  .hud-score { font-family: 'Orbitron', system-ui; font-weight: 900; font-size: clamp(18px, calc(var(--tunnel-w) * 0.034), 36px); letter-spacing: 0.18em; color: ${({ theme }) => theme.colors.hudText}; text-shadow: 0 0 10px ${({ theme }) => theme.colors.hudTextGlow}; }
  .hud-lives { display: flex; align-items: center; gap: clamp(6px, calc(var(--tunnel-w) * 0.012), 12px); }
  .life-dot { width: clamp(10px, calc(var(--tunnel-w) * 0.02), 18px); height: clamp(10px, calc(var(--tunnel-w) * 0.02), 18px); border-radius: 50%; box-shadow: 0 0 12px ${({ theme }) => theme.colors.lifeDotShadow}; border: 2px solid ${({ theme }) => theme.colors.lifeDotBorder}; }
  .life-dot.red { background: ${({ theme }) => theme.gradients.lifeRed}; border-color: ${({ theme }) => theme.colors.lifeDotBorderRed}; }
  .life-dot.blue { background: ${({ theme }) => theme.gradients.lifeBlue}; border-color: ${({ theme }) => theme.colors.lifeDotBorderBlue}; }

  @media (orientation: portrait) { }
  .orient { position: absolute; width: 100%; height: 100%; }

  .fs-controls { position: absolute; top: clamp(8px, calc(var(--tunnel-w) * 0.012), 14px); right: clamp(28px, calc(var(--tunnel-w) * 0.08), 80px); display: flex; gap: 10px; z-index: 8; }
  .fs-toggle { appearance: none; background: ${({ theme }) => theme.colors.fsToggleBg}; color: ${({ theme }) => theme.colors.fsToggleText}; border: 1px solid ${({ theme }) => theme.colors.fsToggleBorder}; border-radius: 12px; padding: 6px 8px; cursor: pointer; opacity: 0.8; box-shadow: 0 6px 16px ${({ theme }) => theme.colors.shadowDark}; transition: opacity 160ms ease, transform 120ms ease, background 160ms ease; }
  .fs-toggle:hover { opacity: 1; background: ${({ theme }) => theme.colors.fsToggleHoverBg}; }
  .fs-toggle:active { transform: translateY(1px); }
  .fs-toggle svg { width: clamp(18px, calc(var(--tunnel-w) * 0.025), 24px); height: clamp(18px, calc(var(--tunnel-w) * 0.025), 24px); display: block; }
`

export default GlobalStyle
