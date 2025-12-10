import styled from 'styled-components'
import { Link } from 'react-router-dom'

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

export const HighscoresArea = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: var(--tunnel-top);
  width: var(--tunnel-w);
  height: var(--tunnel-h);
  pointer-events: auto;
`

export const Panel = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: calc(var(--tunnel-h) * 0.08);
  width: calc(var(--tunnel-w) * 0.88);
  height: calc(var(--tunnel-h) * 0.76);
  border: 3px solid ${({ theme }) => theme.colors.panelBorder};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.panelBg};
  box-shadow: 0 0 10px ${({ theme }) => theme.colors.panelShadowOuter}, inset 0 0 6px ${({ theme }) => theme.colors.panelShadowInner};
`

export const Title = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: clamp(20px, calc(var(--tunnel-h) * 0.06), 60px);
  width: 100%;
  text-align: center;
  font-family: 'Orbitron', system-ui;
  font-weight: 900;
  font-size: clamp(24px, calc(var(--tunnel-w) * 0.08), 80px);
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.text};
`

export const Table = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: clamp(100px, calc(var(--tunnel-h) * 0.24), 140px);
  width: calc(100% - clamp(40px, calc(var(--tunnel-w) * 0.06), 80px));
  height: calc(100% - clamp(160px, calc(var(--tunnel-h) * 0.26), 220px));
`

export const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  font-family: 'Orbitron', system-ui;
  font-weight: 900;
  font-size: clamp(16px, calc(var(--tunnel-w) * 0.04), 42px);
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.text};
  & .col { text-align: center; }
`

export const MainMenuBtn = styled(Link)`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: clamp(12px, calc(var(--tunnel-h) * 0.06), 28px);
  appearance: none;
  background: ${({ theme }) => theme.colors.btnBg};
  color: ${({ theme }) => theme.colors.btnText};
  border: none;
  border-radius: 16px;
  text-decoration: none;
  padding: clamp(7px, calc(var(--tunnel-w) * 0.01), 11px) clamp(8px, calc(var(--tunnel-w) * 0.012), 12px);
  font-family: 'Orbitron', system-ui;
  font-weight: 700;
  font-size: clamp(12px, calc(var(--tunnel-w) * 0.028), 22px);
  cursor: pointer;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  width: clamp(170px, calc(var(--tunnel-w) * 0.28), 360px);
  text-align: center;
  box-shadow: 0 6px 16px ${({ theme }) => theme.colors.btnShadow};
  &:active { transform: translateX(-50%) translateY(1px); }
`

