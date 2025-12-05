import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Root,
  Card,
  Title,
  Form,
  Grid,
  Label,
  Input,
  SubmitButton,
  Footnote,
  Divider,
  LinkNav,
} from './styled.ts'
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRequest } from '../../store/slices/authSlice.ts'
import { t } from '../../i18n/strings.ts'

type FormValues = { email: string; password: string }

export default function SignIn() {
  const dispatch = useAppDispatch()
  const { status, error, user } = useAppSelector((s) => s.auth || { status: 'idle' })
  const navigate = useNavigate()
  const lang = user?.language
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({ mode: 'onChange', defaultValues: { email: '', password: '' } })

  const onSubmit = (data: FormValues) => {
    dispatch(loginRequest({ email: data.email, password: data.password }))
  }

  useEffect(() => {
    if (status === 'success') navigate('/')
  }, [status, navigate])

  return (
    <Root>
      <Card>
        <Title variant="h5">{t(lang, 'signin.title')}</Title>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Grid>
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
            {error && (
              <Title variant="body2" color="error">
                {error}
              </Title>
            )}
            <SubmitButton
              type="submit"
              disabled={!isValid || status === 'loading'}
              variant="contained"
              disableElevation
            >
              {status === 'loading' ? 'Входим…' : t(lang, 'signin.submit')}
            </SubmitButton>
            <Footnote>
              <LinkNav to="/reset">{t(lang, 'signin.forgot')}</LinkNav>
            </Footnote>
            <Divider />
            <Footnote>
              Нет аккаунта? <LinkNav to="/register">{t(lang, 'register.submit')}</LinkNav>
            </Footnote>
          </Grid>
        </Form>
      </Card>
    </Root>
  )
}
