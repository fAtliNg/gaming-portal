import React, { useEffect, useRef, useState } from 'react'
import { Root, Sidebar, Content, Card, Title } from './styled.ts'
import {
  Box,
  Typography,
  List,
  ListItemButton,
  Button,
  TextField,
  Grid,
  Avatar as MAvatar,
} from '@mui/material'
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks.ts'
import { apiCreateGame, apiGetGame, apiUpdateGame } from '../../api/admin.ts'
import { t } from '../../i18n/strings.ts'

export default function GameForm() {
  const { user } = useAppSelector((s) => s.auth)
  const isAdmin = user?.role === 'admin'
  const location = useLocation()
  const navigate = useNavigate()
  const { uuid } = useParams()
  const isEdit = !!uuid
  const lang = user?.language

  const [name, setName] = useState('')
  const [host, setHost] = useState('')
  const [port, setPort] = useState<number | ''>('')
  const [iconBase64, setIconBase64] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [description, setDescription] = useState<string>('')
  const iconInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAdmin) return
    if (isEdit && uuid) {
      ;(async () => {
        const g = await apiGetGame(uuid)
        setName(g.name)
        setHost(g.host)
        setPort(g.port)
        setIconBase64(g.iconBase64 || null)
        setImageBase64(g.imageBase64 || null)
        setDescription(g.description || '')
      })()
    }
  }, [isAdmin, isEdit, uuid])

  const toB64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result).split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const onIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setIconBase64(await toB64(f))
  }
  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setImageBase64(await toB64(f))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !host || typeof port !== 'number' || !iconBase64 || !imageBase64) return
    if (isEdit && uuid) {
      await apiUpdateGame(uuid, { name, host, port, iconBase64, imageBase64, description })
    } else {
      await apiCreateGame({ name, host, port, iconBase64, imageBase64, description })
    }
    navigate('/admin/games')
  }

  if (!isAdmin) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5">{t(lang, 'common.notFound')}</Typography>
      </Box>
    )
  }

  return (
    <Root>
      <Sidebar>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t(lang, 'header.admin')}
        </Typography>
        <List>
          <ListItemButton
            component={RouterLink}
            to="/admin"
            selected={location.pathname === '/admin'}
          >
            {t(lang, 'admin.sidebar.users')}
          </ListItemButton>
          <ListItemButton
            component={RouterLink}
            to="/admin/games"
            selected={location.pathname.startsWith('/admin/games')}
          >
            {t(lang, 'admin.sidebar.games')}
          </ListItemButton>
        </List>
      </Sidebar>
      <Content>
        <Title variant="h4">
          {isEdit ? t(lang, 'games.form.title.edit') : t(lang, 'games.form.title.create')}
        </Title>
        <Card>
          <form onSubmit={onSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t(lang, 'games.form.icon')}
                </Typography>
                <MAvatar
                  src={iconBase64 ? `data:image/*;base64,${iconBase64}` : undefined}
                  sx={{ width: 80, height: 80 }}
                />
                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onIconChange}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  onClick={() => iconInputRef.current?.click()}
                  sx={{ mt: 1 }}
                >
                  {t(lang, 'games.form.upload')}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={8}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t(lang, 'games.form.image')}
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: 160,
                    borderRadius: 2,
                    bgcolor: '#f3f4f6',
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {imageBase64 ? (
                    <img
                      src={`data:image/*;base64,${imageBase64}`}
                      alt="preview"
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {t(lang, 'common.previewEmpty')}
                    </Typography>
                  )}
                </Box>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  onClick={() => imageInputRef.current?.click()}
                  sx={{ mt: 1 }}
                >
                  {t(lang, 'games.form.upload')}
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t(lang, 'games.form.name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t(lang, 'games.form.host')}
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t(lang, 'games.form.port')}
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value) || '')}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t(lang, 'games.form.description')}
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button onClick={() => navigate('/admin/games')}>
                    {t(lang, 'common.cancel')}
                  </Button>
                  <Button variant="contained" type="submit" disableElevation>
                    {isEdit ? t(lang, 'common.save') : t(lang, 'common.create')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Content>
    </Root>
  )
}
