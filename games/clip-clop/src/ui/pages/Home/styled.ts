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
  transform-origin: center center;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
`

export const Orient = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`

export const TitleOverlay = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: calc(var(--tunnel-top) + var(--tunnel-h) * 0.115);
  width: var(--tunnel-w);
  text-align: center;
  font-family: 'Orbitron', system-ui;
  font-weight: 900;
  font-size: var(--title-fs);
  letter-spacing: var(--title-ls);
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.overlayTitleText};
  white-space: nowrap;
`

export const Center = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(12px, calc(var(--tunnel-w) * 0.02), 20px);
  align-items: center;
`

export const BtnLink = styled(Link)`
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
  &:active { transform: translateY(1px); }
`

