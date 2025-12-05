import React, { useEffect, useState } from 'react'
import {
  Root,
  Sidebar,
  Content,
  Card,
  Title,
  Search,
  Table,
  Avatar,
  RoleSelect,
  Pagination,
} from './styled.ts'
import {
  List,
  ListItemButton,
  Divider,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Button,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks.ts'
import { apiListGames, apiUpdateGameStatus, type GameStatus } from '../../api/admin.ts'
import { t } from '../../i18n/strings.ts'

export default function Games() {
  const { user } = useAppSelector((s) => s.auth)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [rows, setRows] = useState<
    Array<{
      uuid: string
      name: string
      author: string
      host: string
      port: number
      status: GameStatus
      iconBase64?: string | null
    }>
  >([])
  const [total, setTotal] = useState(0)
  const isAdmin = user?.role === 'admin'
  const location = useLocation()
  const navigate = useNavigate()
  const lang = user?.language

  useEffect(() => {
    if (!isAdmin) return
    ;(async () => {
      const data = await apiListGames({ q, page: page + 1, limit })
      setRows(data.items)
      setTotal(data.total)
    })()
  }, [q, page, limit, isAdmin])

  const onChangeStatus = async (uuid: string, status: GameStatus) => {
    const updated = await apiUpdateGameStatus(uuid, status)
    setRows((prev) => prev.map((r) => (r.uuid === uuid ? { ...r, status: updated.status } : r)))
  }

  const iconSrc = (b64?: string | null) => (b64 ? `data:image/*;base64,${b64}` : undefined)

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title variant="h4">{t(lang, 'games.title')}</Title>
          <Button variant="contained" component={RouterLink} to="/admin/games/new" disableElevation>
            {t(lang, 'games.create')}
          </Button>
        </Box>
        <Card>
          <Search
            placeholder={t(lang, 'games.search')}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(0)
            }}
          />
          <Divider sx={{ my: 1 }} />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="none" sx={{ width: 48 }}></TableCell>
                <TableCell>{t(lang, 'games.col.name')}</TableCell>
                <TableCell>{t(lang, 'games.col.author')}</TableCell>
                <TableCell>{t(lang, 'games.col.address')}</TableCell>
                <TableCell>{t(lang, 'games.col.status')}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.uuid} hover>
                  <TableCell padding="none" sx={{ width: 48 }}>
                    <Avatar src={iconSrc(r.iconBase64)}>{r.name?.[0]?.toUpperCase()}</Avatar>
                  </TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.author}</TableCell>
                  <TableCell>{`${r.host}:${r.port}`}</TableCell>
                  <TableCell>
                    <RoleSelect
                      value={r.status}
                      onChange={(e) => onChangeStatus(r.uuid, e.target.value as GameStatus)}
                      size="small"
                    >
                      <MenuItem value="Опубликована">{t(lang, 'games.status.published')}</MenuItem>
                      <MenuItem value="Разработка">{t(lang, 'games.status.development')}</MenuItem>
                    </RoleSelect>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/games/${r.uuid}/edit`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            count={total}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              setLimit(parseInt(e.target.value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </Card>
      </Content>
    </Root>
  )
}
