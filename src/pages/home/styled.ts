import styled from 'styled-components'
import {
  AppBar as MAppBar,
  Toolbar as MToolbar,
  Typography,
  Box,
  Menu,
  Divider,
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import GroupIcon from '@mui/icons-material/Group'

export const Root = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`

export const AppBar = styled(MAppBar)`
  background: #fff;
  color: #111827;
  box-shadow: none;
  border-bottom: 1px solid #e5e7eb;
`

export const Toolbar = styled(MToolbar)`
  min-height: 56px;
`

export const Grow = styled(Box)`
  flex: 1;
`

export const Hello = styled(Typography)`
  padding: 24px;
`

export const BellIcon = styled(NotificationsIcon)``
export const UsersIcon = styled(GroupIcon)``

export const Right = styled(Box)`
  display: flex;
  gap: 8px;
  align-items: center;
`

export const Lang = styled(Box)`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  font-size: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
`

export const MenuStyled = styled(Menu)``
export const DividerStyled = styled(Divider)``
