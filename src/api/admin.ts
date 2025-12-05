import client from './client'

export async function apiListUsers(params: { q?: string; page?: number; limit?: number }) {
  const res = await client.get('/users', { params })
  return res.data as {
    items: Array<{
      id: number
      email: string
      name: string
      avatarBase64?: string | null
      role: 'admin' | 'developer' | 'user'
    }>
    total: number
    page: number
    limit: number
  }
}

export async function apiUpdateUserRole(id: number, role: 'admin' | 'developer' | 'user') {
  const res = await client.put(`/users/${id}/role`, { role })
  return res.data as {
    id: number
    email: string
    name: string
    avatarBase64?: string | null
    role: 'admin' | 'developer' | 'user'
  }
}

export type GameStatus = 'Опубликована' | 'Разработка'

export async function apiListGames(params: { q?: string; page?: number; limit?: number }) {
  const res = await client.get('/games', { params })
  return res.data as {
    items: Array<{
      uuid: string
      name: string
      author: string
      host: string
      port: number
      status: GameStatus
      iconBase64?: string | null
      imageBase64?: string | null
      description?: string | null
    }>
    total: number
    page: number
    limit: number
  }
}

export async function apiUpdateGameStatus(uuid: string, status: GameStatus) {
  const res = await client.put(`/games/${uuid}/status`, { status })
  return res.data as {
    uuid: string
    name: string
    author: string
    host: string
    port: number
    status: GameStatus
    iconBase64?: string | null
    imageBase64?: string | null
    description?: string | null
  }
}

export async function apiCreateGame(payload: {
  name: string
  host: string
  port: number
  iconBase64?: string | null
  imageBase64?: string | null
  description?: string | null
}) {
  const res = await client.post('/games', payload)
  return res.data as {
    uuid: string
    name: string
    author: string
    host: string
    port: number
    status: GameStatus
    iconBase64?: string | null
    imageBase64?: string | null
    description?: string | null
  }
}

export async function apiGetGame(uuid: string) {
  const res = await client.get(`/games/${uuid}`)
  return res.data as {
    uuid: string
    name: string
    author: string
    host: string
    port: number
    status: GameStatus
    iconBase64?: string | null
    imageBase64?: string | null
    description?: string | null
  }
}

export async function apiGetUserById(id: number) {
  const res = await client.get(`/users/${id}`)
  return res.data as {
    id: number
    email: string
    name?: string | null
    avatarBase64?: string | null
    role?: 'admin' | 'developer' | 'user'
    language?: 'ru' | 'en'
  }
}

export async function apiGetRating(gameUuid: string, userId: number) {
  const res = await client.get(`/ratings/${gameUuid}/${userId}`)
  return res.data as { userId: number; gameUuid: string; rating: number }
}

export async function apiUpdateGame(
  uuid: string,
  payload: {
    name: string
    host: string
    port: number
    iconBase64?: string | null
    imageBase64?: string | null
    description?: string | null
  }
) {
  const res = await client.put(`/games/${uuid}`, payload)
  return res.data as {
    uuid: string
    name: string
    author: string
    host: string
    port: number
    status: GameStatus
    iconBase64?: string | null
    imageBase64?: string | null
    description?: string | null
  }
}
