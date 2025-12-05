import React, { useEffect, useState } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { Box, Typography, IconButton, Avatar, Badge, Button, MenuItem, TextField, Paper, Divider } from '@mui/material'
import { apiGetGame, apiGetRating, apiGetUserById } from '../../api/admin.ts'
import { useAppSelector, useAppDispatch } from '../../store/hooks.ts'
import { reset, updateLanguage } from '../../store/slices/authSlice.ts'
import { apiLogout, apiUpdateLanguage } from '../../api/auth.ts'
import {
  Root,
  AppBar,
  Toolbar,
  Grow,
  Right,
  BellIcon,
  UsersIcon,
  Lang,
  MenuStyled,
  DividerStyled,
} from '../home/styled.ts'

export default function GamePage() {
  const { uuid } = useParams()
  const { user } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null)
  const langOpen = Boolean(langAnchor)
  const handleLangClick = (e: React.MouseEvent<HTMLElement>) => setLangAnchor(e.currentTarget)
  const handleLangClose = () => setLangAnchor(null)
  const nameUser = user?.name || (user?.email ? user.email.split('@')[0] : '')
  const avatarSrc = user?.avatarBase64 ? `data:image/*;base64,${user.avatarBase64}` : undefined

  const [game, setGame] = useState<{
    name: string
    host: string
    port: number
  } | null>(null)
  const [finding, setFinding] = useState(false)
  const [partyInfo, setPartyInfo] = useState<{
    partyUuid?: string
    userXId?: number
    userOId?: number
    ratings?: { x?: { rating: number; delta: number }; o?: { rating: number; delta: number } }
  }>({})
  const [receivedPartyUuid, setReceivedPartyUuid] = useState<string>('')
  const [players, setPlayers] = useState<{
    me?: { id: number; name: string; rating: number; delta?: number }
    opp?: { id: number; name: string; rating: number; delta?: number }
  }>({})
  const [result, setResult] = useState<'x' | 'o' | 'draw' | ''>('')
  const [chat, setChat] = useState<Array<{ id: number; userId: number; userName: string; message: string; createdAt: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [partyPlayers, setPartyPlayers] = useState<{ x?: { id: number; name: string }; o?: { id: number; name: string } }>({})
  const [partyMeta, setPartyMeta] = useState<{ createdAt?: string; finishedAt?: string } | {}>({})

  useEffect(() => {
    if (!uuid) return
      ; (async () => {
        console.log('[game-page] load game', uuid)
        const g = await apiGetGame(uuid).catch(() => undefined)
        if (g) setGame({ name: g.name, host: g.host, port: g.port })
        console.log('[game-page] game loaded', g)
      })()
  }, [uuid])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const data = e.data || {}
      console.log('[game-page] message', { origin: e.origin, data })
      if (data?.type === 'party_start') {
        const { partyUuid, userXId, userOId } = data
        if (receivedPartyUuid && receivedPartyUuid === partyUuid) {
          console.log('[game-page] party_start duplicate, skip', { partyUuid })
          return
        }
        console.log('[game-page] party_start', { partyUuid, userXId, userOId })
        setReceivedPartyUuid(partyUuid)
        setPartyInfo({ partyUuid, userXId, userOId })
        try {
          const url = new URL(window.location.href)
          url.searchParams.set('party_uuid', partyUuid)
          console.log('[game-page] pushState party_uuid', partyUuid)
          window.history.pushState({}, '', url.toString())
        } catch { }
        setFinding(false)
          ; (async () => {
            const meId = user?.id
            const oppId = meId === userXId ? userOId : userXId
            console.log('[game-page] fetch ratings for', { meId, oppId })
            const meRating = meId
              ? (await apiGetRating(uuid!, meId).catch(() => ({ rating: 1500 }))).rating
              : 1500
            const oppRating = oppId
              ? (await apiGetRating(uuid!, oppId).catch(() => ({ rating: 1500 }))).rating
              : 1500
            const meUser = meId
              ? await apiGetUserById(meId!).catch(() => ({ name: 'Вы' }))
              : { name: 'Вы' }
            const oppUser = oppId
              ? await apiGetUserById(oppId!).catch(() => ({ name: 'Соперник' }))
              : { name: 'Соперник' }
            const xUser = await apiGetUserById(userXId!).catch(() => ({ name: 'Игрок X' }))
            const oUser = await apiGetUserById(userOId!).catch(() => ({ name: 'Игрок O' }))
            const xRating = userXId
              ? (await apiGetRating(uuid!, userXId).catch(() => ({ rating: 1500 }))).rating
              : 1500
            const oRating = userOId
              ? (await apiGetRating(uuid!, userOId).catch(() => ({ rating: 1500 }))).rating
              : 1500
            console.log('[game-page] ratings loaded', { meRating, oppRating })
            setPlayers({
              me: { id: meId || 0, name: meUser.name || 'Вы', rating: meRating },
              opp: { id: oppId || 0, name: oppUser.name || 'Соперник', rating: oppRating },
            })
            setPartyPlayers({ x: { id: userXId, name: xUser?.name || 'Игрок X' }, o: { id: userOId, name: oUser?.name || 'Игрок O' } })
            setPartyInfo((p) => ({
              ...p,
              ratings: {
                x: { rating: xRating, delta: 0 },
                o: { rating: oRating, delta: 0 },
              },
            }))
          })()
      }
      if (data?.type === 'ratings') {
        const { partyUuid, result } = data
        console.log('[game-page] party_end', { partyUuid, result })
        setReceivedPartyUuid('')
        setPartyInfo({})
        setFinding(false)
        setResult((result as any) || '')
        try {
          const url = new URL(window.location.href)
          url.searchParams.delete('party_uuid')
          console.log('[game-page] remove party_uuid from url')
          window.history.pushState({}, '', url.toString())
        } catch { }
      }
      if (data?.type === 'find_game') {
        console.log('[game-page] find_game from iframe')
        setReceivedPartyUuid('')
        setPartyInfo({})
        setFinding(true)
      }
      if (data?.type === 'ratings') {
        const { userX, userO } = data
        console.log('[game-page] ratings update', { userX, userO })
        setPartyInfo((p) => ({
          ...p,
          ratings: {
            x: {
              rating: (userX?.rating as number | undefined) ?? (p as any)?.ratings?.x?.rating ?? 1500,
              delta: (userX?.delta as number | undefined) ?? (p as any)?.ratings?.x?.delta ?? 0,
            },
            o: {
              rating: (userO?.rating as number | undefined) ?? (p as any)?.ratings?.o?.rating ?? 1500,
              delta: (userO?.delta as number | undefined) ?? (p as any)?.ratings?.o?.delta ?? 0,
            },
          },
        }))
      }
      if (data?.type !== 'party_start' && data?.type !== 'ratings') {
        console.log('[game-page] message passthrough', data)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [user?.id, uuid])

  useEffect(() => {
    const loadChat = async () => {
      if (!partyInfo.partyUuid) return
      try {
        const r = await fetch(`http://localhost:3000/api/chat/${partyInfo.partyUuid}`, { credentials: 'include' })
        const data = await r.json()
        if (Array.isArray(data?.items)) setChat(data.items)
      } catch { }
    }
    loadChat()
    const id = setInterval(loadChat, 3000)
    return () => clearInterval(id)
  }, [partyInfo.partyUuid])

  useEffect(() => {
    const loadPartyMeta = async () => {
      if (!partyInfo.partyUuid) return
      try {
        const r = await fetch(`http://localhost:11692/api/party/${partyInfo.partyUuid}`)
        const d = await r.json()
        setPartyMeta({ createdAt: d.createdAt, finishedAt: d.finishedAt })
      } catch { }
    }
    loadPartyMeta()
  }, [partyInfo.partyUuid])

  const timeAgo = (iso?: string) => {
    if (!iso) return ''
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'только что'
    if (m < 60) return `${m} мин назад`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h} ч назад`
    const d = Math.floor(h / 24)
    return `${d} дн назад`
  }

  const sendChat = async () => {
    const text = chatInput.trim()
    if (!text || !partyInfo.partyUuid) return
    try {
      await fetch('http://localhost:3000/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ partyUuid: partyInfo.partyUuid, message: text }),
      })
      setChatInput('')
      const r = await fetch(`http://localhost:3000/api/chat/${partyInfo.partyUuid}`, { credentials: 'include' })
      const data = await r.json()
      if (Array.isArray(data?.items)) setChat(data.items)
    } catch { }
  }

  return (
    <Root>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="body1">Logo</Typography>
          <Grow />
          <Right>
            {user ? (
              <>
                <IconButton>
                  <Badge color="error" variant="dot">
                    <BellIcon />
                  </Badge>
                </IconButton>
                <IconButton>
                  <UsersIcon />
                </IconButton>
                <DividerStyled orientation="vertical" flexItem />
                <Lang onClick={handleLangClick} role="button" aria-label="language">
                  {user?.language === 'en' ? '🇬🇧' : '🇷🇺'}
                </Lang>
                <MenuStyled
                  anchorEl={langAnchor}
                  open={langOpen}
                  onClose={handleLangClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  MenuListProps={{ autoFocusItem: false }}
                >
                  <MenuItem
                    selected={user?.language === 'en'}
                    onClick={async () => {
                      await apiUpdateLanguage('en').catch(() => { })
                      dispatch(updateLanguage('en'))
                      handleLangClose()
                    }}
                  >
                    <span style={{ fontSize: 18, marginRight: 8 }}>🇬🇧</span> English
                  </MenuItem>
                  <MenuItem
                    selected={user?.language !== 'en'}
                    onClick={async () => {
                      await apiUpdateLanguage('ru').catch(() => { })
                      dispatch(updateLanguage('ru'))
                      handleLangClose()
                    }}
                  >
                    <span style={{ fontSize: 18, marginRight: 8 }}>🇷🇺</span> Русский
                  </MenuItem>
                </MenuStyled>
                <IconButton onClick={handleAvatarClick} size="small">
                  <Avatar sx={{ width: 32, height: 32 }} src={avatarSrc}>
                    {nameUser?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <MenuStyled
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2">{nameUser || 'Пользователь'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <DividerStyled />
                  <MenuItem component={RouterLink} to="/account">
                    Аккаунт
                  </MenuItem>
                  <DividerStyled />
                  <MenuItem
                    onClick={async () => {
                      handleClose()
                      await apiLogout().catch(() => { })
                      dispatch(reset())
                    }}
                  >
                    Выйти
                  </MenuItem>
                </MenuStyled>
              </>
            ) : (
              <Button component={RouterLink} to="/signin" variant="contained">
                Войти
              </Button>
            )}
          </Right>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {game && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '280px minmax(600px, 1fr) 280px', gap: 2 }}>
            <Box>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 700 }}>{game.name}</Typography>
                <Typography variant="caption" color="text.secondary">{timeAgo((partyMeta as any).finishedAt || (partyMeta as any).createdAt)}</Typography>
                <Divider sx={{ my: 1 }} />
                {partyPlayers.x && partyPlayers.o && (
                  <Box sx={{ display: 'grid', gap: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: partyInfo.partyUuid && !result ? '#16a34a' : '#9ca3af' }} />
                      <Box sx={{ fontSize: 12, px: 0.75, py: 0.25, borderRadius: 10, bgcolor: '#e5e7eb', color: '#22d3ee' }}>X</Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{partyPlayers.x.name}</Typography>
                      <Typography variant="body2" color="text.secondary">({(partyInfo as any)?.ratings?.x?.rating || 1500})</Typography>
                      {typeof (partyInfo as any)?.ratings?.x?.delta === 'number' && (
                        <Typography variant="body2" sx={{ color: ((partyInfo as any)?.ratings?.x?.delta || 0) > 0 ? '#16a34a' : ((partyInfo as any)?.ratings?.x?.delta || 0) < 0 ? '#dc2626' : '#6b7280' }}>
                          {((partyInfo as any)?.ratings?.x?.delta || 0) > 0 ? `+${(partyInfo as any)?.ratings?.x?.delta}` : (partyInfo as any)?.ratings?.x?.delta}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: partyInfo.partyUuid && !result ? '#16a34a' : '#9ca3af' }} />
                      <Box sx={{ fontSize: 12, px: 0.75, py: 0.25, borderRadius: 10, bgcolor: '#e5e7eb', color: '#a3e635' }}>O</Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{partyPlayers.o.name}</Typography>
                      <Typography variant="body2" color="text.secondary">({(partyInfo as any)?.ratings?.o?.rating || 1500})</Typography>
                      {typeof (partyInfo as any)?.ratings?.o?.delta === 'number' && (
                        <Typography variant="body2" sx={{ color: ((partyInfo as any)?.ratings?.o?.delta || 0) > 0 ? '#16a34a' : ((partyInfo as any)?.ratings?.o?.delta || 0) < 0 ? '#dc2626' : '#6b7280' }}>
                          {((partyInfo as any)?.ratings?.o?.delta || 0) > 0 ? `+${(partyInfo as any)?.ratings?.o?.delta}` : (partyInfo as any)?.ratings?.o?.delta}
                        </Typography>
                      )}
                    </Box>
                    {result && (
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                        {result === 'draw' ? 'Ничья' : result === 'x' ? `${partyPlayers.x?.name || 'Игрок X'} победил` : `${partyPlayers.o?.name || 'Игрок O'} победил`}
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, height: '50vh', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Чат</Typography>
                <Box sx={{ flex: 1, overflowY: 'auto', mb: 1 }}>
                  {chat.map((m) => (
                    <Box key={m.id} sx={{ mb: 0.75 }}>
                      <Typography variant="caption" color="text.secondary">{new Date(m.createdAt).toLocaleTimeString()}</Typography>
                      <Typography variant="body2"><strong>{m.userName}:</strong> {m.message}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField size="small" fullWidth value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Сообщение" />
                  <Button variant="contained" onClick={sendChat} disabled={!partyInfo.partyUuid || !chatInput.trim()}>Отправить</Button>
                </Box>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2">TODO</Typography>
                <Typography variant="caption" color="text.secondary">Здесь будет дополнительный блок</Typography>
              </Paper>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <iframe
                title={game.name}
                src={`http://${game.host}:${game.port}/?game_uuid=${uuid}${finding && !partyInfo.partyUuid ? '&find=1' : ''}${partyInfo.partyUuid ? `&party_uuid=${partyInfo.partyUuid}` : ''}`}
                onLoad={() => console.log('[game-page] iframe load')}
                style={{ width: '100%', height: '70vh', border: 'none' }}
              />
              {console.log('[game-page] iframe src', `http://${game.host}:${game.port}/?game_uuid=${uuid}${finding && !partyInfo.partyUuid ? '&find=1' : ''}${partyInfo.partyUuid ? `&party_uuid=${partyInfo.partyUuid}` : ''}`)}
            </Box>

            <Box>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2">TODO</Typography>
                <Typography variant="caption" color="text.secondary">Здесь будет функционал справа</Typography>
              </Paper>
            </Box>
          </Box>
        )}
      </Box>
    </Root>
  )
}
