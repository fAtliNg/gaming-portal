import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts'
import { registerRequest, reset } from '../../store/slices/authSlice.ts'
import { useForm, Controller } from 'react-hook-form'
import {
  Root,
  Card,
  Title,
  Form,
  Grid,
  Label,
  Input,
  ErrorText,
  SubmitButton,
  Footnote,
  Divider,
  LinkNav,
} from './styled.ts'
import { useNavigate } from 'react-router-dom'
import { t } from '../../i18n/strings.ts'

type FormValues = { name: string; email: string; password: string }

export default function Register() {
  const dispatch = useAppDispatch()
  const { status, error, user } = useAppSelector((s) => s.auth || { status: 'idle' })
  const navigate = useNavigate()
  const lang = user?.language
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: { name: '', email: '', password: '' },
  })

  const onSubmit = (data: FormValues) => {
    dispatch(registerRequest({ name: data.name, email: data.email, password: data.password }))
  }

  useEffect(() => {
    if (status === 'success') navigate('/')
  }, [status, navigate])

  return (
    <Root>
      <Card>
        <Title variant="h5">{t(lang, 'register.title')}</Title>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Grid>
            <div>
              <Label variant="body2">{t(lang, 'register.name')}</Label>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: 'Введите имя пользователя',
                  minLength: { value: 2, message: 'Минимум 2 символа' },
                }}
                render={({ field }) => (
                  <Input
                    type="text"
                    placeholder="Ваше имя"
                    {...field}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </div>
            <div>
              <Label variant="body2">{t(lang, 'register.email')}</Label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: 'Введите email',
                  pattern: { value: /.+@.+\..+/, message: 'Введите корректный email' },
                }}
                render={({ field }) => (
                  <Input
                    type="email"
                    placeholder="youremail@example.com"
                    {...field}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </div>
            <div>
              <Label variant="body2">{t(lang, 'register.password')}</Label>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: 'Введите пароль',
                  minLength: { value: 6, message: 'Минимум 6 символов' },
                }}
                render={({ field }) => (
                  <Input
                    type="password"
                    placeholder="******"
                    {...field}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />
            </div>
            {error && <ErrorText>{error}</ErrorText>}
            <SubmitButton
              type="submit"
              disabled={!isValid || status === 'loading'}
              variant="contained"
              disableElevation
            >
              {status === 'loading' ? 'Создание…' : t(lang, 'register.submit')}
            </SubmitButton>
            <Footnote>Нажимая «Создать аккаунт», вы соглашаетесь с правилами.</Footnote>
            <Divider />
            <Footnote>
              Уже есть аккаунт?{' '}
              <LinkNav to="/signin" onClick={() => dispatch(reset())}>
                {t(lang, 'signin.submit')}
              </LinkNav>
            </Footnote>
          </Grid>
        </Form>
      </Card>
    </Root>
  )
}
