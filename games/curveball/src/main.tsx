import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './ui/App'
import ThemeModeProvider from './ui/ThemeModeProvider'

const container = document.getElementById('root') as HTMLElement
createRoot(container).render(
    <HashRouter>
        <ThemeModeProvider>
            <App />
        </ThemeModeProvider>
    </HashRouter>
)
