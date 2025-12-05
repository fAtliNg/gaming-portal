import styled from 'styled-components'
import { Paper, Typography, Button, Divider as MDivider, TextField } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export const Root = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: radial-gradient(120% 120% at 50% 0%, #f6f9ff 0%, #eef3ff 60%, #e9f0ff 100%);
`

export const Card = styled(Paper)`
  width: 420px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 32px;
`

export const Title = styled(Typography)`
  margin: 0 0 24px 0;
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
`

export const Form = styled.form``

export const Grid = styled.div`
  display: grid;
  gap: 20px;
`

export const Label = styled(Typography)`
  font-size: 12px;
  color: #444;
  margin-bottom: 8px;
`

export const Input = styled(TextField)`
  width: 100%;
  & .MuiOutlinedInput-root {
    border-radius: 10px;
  }
  & .MuiOutlinedInput-input {
    height: 44px;
    padding: 12px;
    box-sizing: border-box;
  }
`

export const SubmitButton = styled(Button)`
  width: 100%;
  border-radius: 10px;
  height: 44px;
  background-color: #1e66f5;
  &:hover {
    background-color: #1559d8;
  }
  &:disabled {
    background-color: #98b7f3;
    color: #fff;
  }
`

export const Footnote = styled(Typography)`
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  margin: 0;
`

export const Divider = styled(MDivider)`
  margin: 20px 0 0;
`

export const LinkNav = styled(RouterLink)`
  cursor: pointer;
  color: #1e66f5;
  text-decoration: none;
`
