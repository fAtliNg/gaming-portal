import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  html, body, #root { height: 100%; }
  html, body { overflow: hidden; }
  body { margin: 0; background: ${({ theme }) => theme.colors.bg}; color: ${({ theme }) => theme.colors.text}; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif; }

  .portrait, .landscape, html, body, #root { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
`

export default GlobalStyle
