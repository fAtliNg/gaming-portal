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

type FormValues = { email: string }

export default function Reset() {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({ mode: 'onChange', defaultValues: { email: '' } })

  const onSubmit = (data: FormValues) => {
    // TODO: интеграция с восстановлением пароля
    console.log('reset', data)
  }

  return (
    <Root>
      <Card>
        <Title variant="h5">Восстановление пароля</Title>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Grid>
            <div>
              <Label variant="body2">Электронная почта</Label>
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
            <SubmitButton type="submit" disabled={!isValid} variant="contained" disableElevation>
              Отправить ссылку для восстановления
            </SubmitButton>
            <Divider />
            <Footnote>
              Вспомнили пароль? <LinkNav to="/signin">Войти</LinkNav>
            </Footnote>
          </Grid>
        </Form>
      </Card>
    </Root>
  )
}
