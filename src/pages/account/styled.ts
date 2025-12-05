import styled from 'styled-components'
import {
  Card as MCard,
  Typography,
  Box,
  Avatar as MAvatar,
  Button as MButton,
  TextField,
} from '@mui/material'

export const Root = styled.div`
  min-height: 100vh;
  padding: 24px;
  background: #f8fafc;
`

export const Card = styled(MCard)`
  padding: 24px;
  border-radius: 16px;
`

export const Title = styled(Typography)`
  margin-bottom: 16px;
`

export const Section = styled(Box)`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 24px;
  align-items: start;
  margin-top: 8px;
`

export const Avatar = styled(MAvatar)`
  width: 96px;
  height: 96px;
  border: 2px dashed #e5e7eb;
`

export const Actions = styled(Box)`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`

export const Button = styled(MButton)``

export const Input = styled(TextField)`
  width: 100%;
`
