import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './ui/App'
import { ThemeProvider } from 'styled-components'
import GlobalStyle from './ui/globalStyles'
import theme from './ui/theme'

const container = document.getElementById('root') as HTMLElement
createRoot(container).render(
    <HashRouter>
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <App />
        </ThemeProvider>
    </HashRouter>
)
