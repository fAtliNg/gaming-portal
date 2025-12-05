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
} from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks.ts'
import { apiListUsers, apiUpdateUserRole } from '../../api/admin.ts'
import { t } from '../../i18n/strings.ts'

type Role = 'admin' | 'developer' | 'user'

export default function Admin() {
  const { user } = useAppSelector((s) => s.auth)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [rows, setRows] = useState<
    Array<{ id: number; email: string; name: string; avatarBase64?: string | null; role: Role }>
  >([])
  const [total, setTotal] = useState(0)

  const isAdmin = user?.role === 'admin'
  const lang = user?.language
  const location = useLocation()

  useEffect(() => {
    if (!isAdmin) return
    ;(async () => {
      const data = await apiListUsers({ q, page: page + 1, limit })
      setRows(data.items)
      setTotal(data.total)
    })()
  }, [q, page, limit, isAdmin])

  const onChangeRole = async (id: number, role: Role) => {
    const updated = await apiUpdateUserRole(id, role)
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, role: updated.role } : r)))
  }

  const avatarSrc = (b64?: string | null) => (b64 ? `data:image/*;base64,${b64}` : undefined)

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
        <Title variant="h4">{t(lang, 'admin.users.title')}</Title>
        <Card>
          <Search
            placeholder={t(lang, 'admin.users.search')}
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
                <TableCell>{t(lang, 'admin.users.col.avatar')}</TableCell>
                <TableCell>{t(lang, 'admin.users.col.name')}</TableCell>
                <TableCell>{t(lang, 'admin.users.col.email')}</TableCell>
                <TableCell>{t(lang, 'admin.users.col.role')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Avatar src={avatarSrc(r.avatarBase64)}>{r.name?.[0]?.toUpperCase()}</Avatar>
                  </TableCell>
                  <TableCell>{r.name || r.email.split('@')[0]}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>
                    <RoleSelect
                      value={r.role}
                      onChange={(e) => onChangeRole(r.id, e.target.value as Role)}
                      size="small"
                    >
                      <MenuItem value="admin">admin</MenuItem>
                      <MenuItem value="developer">developer</MenuItem>
                      <MenuItem value="user">user</MenuItem>
                    </RoleSelect>
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
