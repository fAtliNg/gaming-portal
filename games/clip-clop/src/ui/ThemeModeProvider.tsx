import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import GlobalStyle from './globalStyles'
import themes, { ThemeMode } from './themes'

type Ctx = {
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
  toggle: () => void
}

const ThemeModeContext = createContext<Ctx>({ mode: 'blue', setMode: () => { }, toggle: () => { } })

export function useThemeMode() {
  return useContext(ThemeModeContext)
}

export default function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('blue')
  useEffect(() => {
    try {
      const raw = localStorage.getItem('clip-clop-theme-mode') as any
      if (raw === 'blue' || raw === 'green') setMode(raw)
      else if (raw === 'midnight') setMode('blue')
      else if (raw === 'sage') setMode('green')
      else if (raw === 'dark') setMode('blue')
      else if (raw === 'light') setMode('green')
      else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        setMode(prefersDark ? 'blue' : 'green')
      }
    } catch { }
  }, [])
  useEffect(() => {
    try { localStorage.setItem('clip-clop-theme-mode', mode) } catch { }
  }, [mode])
  const value = useMemo<Ctx>(() => ({ mode, setMode, toggle: () => setMode((m) => (m === 'blue' ? 'green' : 'blue')) }), [mode])
  const theme = themes[mode]
  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
