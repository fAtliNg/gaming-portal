import React, { useEffect, useState } from 'react'
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
} from './styled.ts'
import {
  IconButton,
  Avatar,
  Badge,
  Button,
  MenuItem,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
} from '@mui/material'
import { useAppSelector, useAppDispatch } from '../../store/hooks.ts'
import { reset, updateLanguage } from '../../store/slices/authSlice.ts'
import { apiLogout, apiUpdateLanguage } from '../../api/auth.ts'
import { Link as RouterLink } from 'react-router-dom'
import { t } from '../../i18n/strings.ts'
import { apiListGames } from '../../api/admin.ts'

export default function Home() {
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

  const name = user?.name || (user?.email ? user.email.split('@')[0] : '')
  const avatarSrc = user?.avatarBase64 ? `data:image/*;base64,${user.avatarBase64}` : undefined
  const lang = user?.language
  const [games, setGames] = useState<
    Array<{
      uuid: string
      name: string
      imageBase64?: string | null
      description?: string | null
    }>
  >([])

  useEffect(() => {
    ;(async () => {
      const data = await apiListGames({ page: 1, limit: 50 }).catch(() => ({ items: [] }))
      setGames(
        data.items.map((g) => ({
          uuid: g.uuid,
          name: g.name,
          imageBase64: g.imageBase64 || null,
          description: g.description || null,
        }))
      )
    })()
  }, [])

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
                      await apiUpdateLanguage('en').catch(() => {})
                      dispatch(updateLanguage('en'))
                      handleLangClose()
                    }}
                  >
                    <span style={{ fontSize: 18, marginRight: 8 }}>🇬🇧</span> English
                  </MenuItem>
                  <MenuItem
                    selected={user?.language !== 'en'}
                    onClick={async () => {
                      await apiUpdateLanguage('ru').catch(() => {})
                      dispatch(updateLanguage('ru'))
                      handleLangClose()
                    }}
                  >
                    <span style={{ fontSize: 18, marginRight: 8 }}>🇷🇺</span> Русский
                  </MenuItem>
                </MenuStyled>
                <IconButton onClick={handleAvatarClick} size="small">
                  <Avatar sx={{ width: 32, height: 32 }} src={avatarSrc}>
                    {name?.[0]?.toUpperCase() || 'U'}
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
                    <Typography variant="subtitle2">{name || 'Пользователь'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <DividerStyled />
                  {user?.role === 'admin' && (
                    <>
                      <MenuItem component={RouterLink} to="/admin">
                        {t(lang, 'header.adminPanel')}
                      </MenuItem>
                      <DividerStyled />
                    </>
                  )}
                  <MenuItem component={RouterLink} to="/account">
                    {t(lang, 'header.account')}
                  </MenuItem>
                  <DividerStyled />
                  <MenuItem
                    onClick={async () => {
                      handleClose()
                      await apiLogout().catch(() => {})
                      dispatch(reset())
                    }}
                  >
                    {t(lang, 'header.logout')}
                  </MenuItem>
                </MenuStyled>
              </>
            ) : (
              <Button component={RouterLink} to="/signin" variant="contained">
                {t(lang, 'header.signin')}
              </Button>
            )}
          </Right>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {games.map((g) => {
            const img = g.imageBase64 ? `data:image/*;base64,${g.imageBase64}` : undefined
            const desc = (g.description || '').trim()
            const short = desc.length > 160 ? desc.slice(0, 157) + '…' : desc
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={g.uuid}>
                <Card
                  component={RouterLink}
                  to={`/game/${g.uuid}`}
                  variant="outlined"
                  sx={{
                    textDecoration: 'none',
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: '#fff',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  {img && <CardMedia component="img" height="200" image={img} alt={g.name} />}
                  <CardContent>
                    <Typography variant="h5" sx={{ mb: 0.5 }}>
                      {g.name}
                    </Typography>
                    {short && (
                      <Typography variant="body2" color="text.secondary">
                        {short}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </Root>
  )
}
