import styled from 'styled-components'
import {
  Box,
  Card as MCard,
  Typography,
  TextField,
  Select,
  Avatar as MAvatar,
  TablePagination,
  Table as MTable,
} from '@mui/material'

export const Root = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px 1fr;
  background: #f8fafc;
`

export const Sidebar = styled(Box)`
  background: #111827;
  color: #fff;
  padding: 16px;
`

export const Content = styled(Box)`
  padding: 24px;
`

export const Card = styled(MCard)`
  padding: 16px;
  border-radius: 16px;
`

export const Title = styled(Typography)`
  margin-bottom: 12px;
`

export const Search = styled(TextField)`
  margin-bottom: 16px;
  width: 100%;
`

export const Table = styled(MTable)``
export const Avatar = styled(MAvatar)`
  width: 40px;
  height: 40px;
`

export const RoleSelect = styled(Select)`
  min-width: 140px;
`

export const Pagination = styled(TablePagination)``
