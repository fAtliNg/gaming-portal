import React, { useMemo, useRef, useState } from 'react'
import { Root, Card, Title, Section, Avatar, Actions, Button, Input } from './styled.ts'
import { Typography, Snackbar, Alert } from '@mui/material'
import { useAppSelector, useAppDispatch } from '../../store/hooks.ts'
import { updateAvatar } from '../../store/slices/authSlice.ts'
import { apiUpdateAvatar } from '../../api/auth.ts'
import { useNavigate } from 'react-router-dom'
import { t } from '../../i18n/strings.ts'

export default function Account() {
  const { user } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [avatarLocal, setAvatarLocal] = useState<string | null>(user?.avatarBase64 ?? null)
  const lang = user?.language
  const avatarSrc = useMemo(
    () => (avatarLocal ? `data:image/*;base64,${avatarLocal}` : undefined),
    [avatarLocal]
  )
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const resizeImage = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const max = 512
          const ratio = Math.min(max / img.width, max / img.height, 1)
          const w = Math.round(img.width * ratio)
          const h = Math.round(img.height * ratio)
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject(new Error('canvas'))
          ctx.drawImage(img, 0, 0, w, h)
          let url = canvas.toDataURL('image/webp', 0.8)
          if (!url.startsWith('data:image/webp')) url = canvas.toDataURL('image/jpeg', 0.8)
          const base64 = url.split(',')[1] || url
          resolve(base64)
        }
        img.onerror = () => reject(new Error('image'))
        img.src = reader.result as string
      }
      reader.onerror = () => reject(new Error('reader'))
      reader.readAsDataURL(file)
    })

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    const maxSize = 5 * 1024 * 1024
    if (!allowed.includes(file.type)) {
      setErrorMsg('Допустимы только изображения: PNG, JPEG, WEBP или GIF')
      setSnackbarOpen(true)
      return
    }
    if (file.size > maxSize) {
      setErrorMsg('Файл слишком большой. Максимальный размер: 5 МБ')
      setSnackbarOpen(true)
      return
    }
    try {
      const base64 = await resizeImage(file)
      const approxBytes = Math.ceil((base64.length * 3) / 4)
      if (approxBytes > 10 * 1024 * 1024) {
        setErrorMsg('После обработки изображение слишком большое')
        setSnackbarOpen(true)
        return
      }
      setAvatarLocal(base64)
    } catch (_e) {
      setErrorMsg('Не удалось обработать изображение')
      setSnackbarOpen(true)
    }
  }

  const onRemove = () => setAvatarLocal(null)

  const onCancel = () => navigate('/')

  const onSave = async () => {
    if (!user?.email) return
    const updated = await apiUpdateAvatar(user.email, avatarLocal ?? null)
    dispatch(updateAvatar(updated.avatarBase64 ?? null))
    navigate('/')
  }

  return (
    <Root>
      <Card>
        <Title variant="h5">{t(lang, 'account.title')}</Title>
        <Typography variant="subtitle2" color="text.secondary">
          {t(lang, 'account.section.main')}
        </Typography>
        <Section>
          <div>
            <Avatar src={avatarSrc} />
            <div style={{ marginTop: 8 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={onFileChange}
                style={{ display: 'none' }}
              />
              <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
                {t(lang, 'account.upload')}
              </Button>
              {avatarLocal && (
                <Button variant="text" color="error" onClick={onRemove} style={{ marginLeft: 8 }}>
                  {t(lang, 'account.remove')}
                </Button>
              )}
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 16 }}>
              <Typography variant="body2">{t(lang, 'account.name')}</Typography>
              <Input value={user?.name || ''} disabled placeholder="Ваше имя" />
            </div>
            <div>
              <Typography variant="body2">{t(lang, 'account.email')}</Typography>
              <Input value={user?.email || ''} disabled placeholder="youremail@example.com" />
            </div>
          </div>
        </Section>
        <Actions>
          <Button onClick={onCancel}>{t(lang, 'common.cancel')}</Button>
          <Button variant="contained" onClick={onSave} disableElevation>
            {t(lang, 'common.save')}
          </Button>
        </Actions>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
            {errorMsg}
          </Alert>
        </Snackbar>
      </Card>
    </Root>
  )
}
