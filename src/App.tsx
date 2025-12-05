import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material'
const HomePage = lazy(() => import('./pages/home/Home.tsx'))
const RegisterPage = lazy(() => import('./pages/register/Register.tsx'))
const SignInPage = lazy(() => import('./pages/signin/SignIn.tsx'))
const ResetPage = lazy(() => import('./pages/reset/Reset.tsx'))
const AccountPage = lazy(() => import('./pages/account/Account.tsx'))
const AdminPage = lazy(() => import('./pages/admin/Admin.tsx'))
const GamePage = lazy(() => import('./pages/game/GamePage.tsx'))

const theme = createTheme({
  shape: { borderRadius: 10 },
  palette: { primary: { main: '#1E66F5' } },
  typography: { fontSize: 14 },
})

function Layout() {
  return <Outlet />
}

export default function App() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    ;(async () => {
      const data = await apiSession().catch(() => undefined)
      if (data?.email) {
        dispatch(
          loginSuccess({
            email: data.email,
            name: data.name ?? null,
            avatarBase64: data.avatarBase64 ?? null,
            role: data.role,
            language: data.language,
          })
        )
      }
    })()
  }, [dispatch])
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Suspense
          fallback={
            <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
              <CircularProgress />
            </Box>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route element={<Layout />}>
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/reset" element={<ResetPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/games" element={<GamesPage />} />
              <Route path="/admin/games/new" element={<GameFormPage />} />
              <Route path="/admin/games/:uuid/edit" element={<GameFormPage />} />
              <Route path="/game/:uuid" element={<GamePage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
import { useAppDispatch } from './store/hooks.ts'
import { loginSuccess } from './store/slices/authSlice.ts'
import { apiSession } from './api/auth.ts'
const GamesPage = React.lazy(() => import('./pages/admin/Games.tsx'))
const GameFormPage = React.lazy(() => import('./pages/admin/GameForm.tsx'))
