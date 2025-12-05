import client from './client'

export async function apiRegister(email: string, password: string, name?: string) {
  const res = await client.post('/register', { email, password, name })
  return res.data as {
    id: number
    email: string
    name?: string | null
    avatarBase64?: string | null
    role?: 'admin' | 'developer' | 'user'
    language?: 'ru' | 'en'
  }
}

export async function apiLogin(email: string, password: string) {
  const res = await client.post('/login', { email, password })
  return res.data as {
    id: number
    email: string
    name?: string | null
    avatarBase64?: string | null
    role?: 'admin' | 'developer' | 'user'
    language?: 'ru' | 'en'
  }
}

export async function apiUpdateAvatar(email: string, avatarBase64: string | null) {
  const res = await client.put('/account', { email, avatarBase64 })
  return res.data as {
    id: number
    email: string
    name?: string | null
    avatarBase64?: string | null
    language?: 'ru' | 'en'
  }
}

export async function apiSession() {
  const res = await client.get('/session')
  return res.data as {
    id: number
    email: string
    name?: string | null
    avatarBase64?: string | null
    role?: 'admin' | 'developer' | 'user'
    language?: 'ru' | 'en'
  }
}

export async function apiLogout() {
  const res = await client.post('/logout')
  return res.data as { ok: boolean }
}

export async function apiUpdateLanguage(language: 'ru' | 'en') {
  const res = await client.put('/language', { language })
  return res.data as { ok: boolean; language: 'ru' | 'en' }
}
