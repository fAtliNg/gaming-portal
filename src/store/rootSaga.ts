import { all, takeLatest, put, call, delay } from 'redux-saga/effects'
import { increment, incrementAsync } from './slices/counterSlice'
import {
  registerRequest,
  registerSuccess,
  registerFailure,
  RegisterPayload,
  loginRequest,
  loginSuccess,
  loginFailure,
} from './slices/authSlice'
import { apiRegister, apiLogin } from '../api/auth'
import type { PayloadAction } from '@reduxjs/toolkit'

function* handleIncrementAsync() {
  yield delay(300)
  yield put(increment())
}

function* watchIncrementAsync() {
  yield takeLatest(incrementAsync.type, handleIncrementAsync)
}

function* registerFlow(action: PayloadAction<RegisterPayload>) {
  try {
    const { email, password, name } = action.payload
    const data: {
      id: number
      email: string
      name?: string | null
      avatarBase64?: string | null
      role?: 'admin' | 'developer' | 'user'
      language?: 'ru' | 'en'
    } = yield call(apiRegister, email, password, name)
    const displayName = name || data.name || data.email.split('@')[0]
    yield put(
      registerSuccess({
        name: displayName,
        email: data.email,
        avatarBase64: data.avatarBase64 ?? null,
        role: data.role,
        language: data.language ?? 'ru',
      })
    )
  } catch (e) {
    const anyErr = e as unknown as { response?: { data?: { error?: string } } }
    const message =
      anyErr?.response?.data?.error || (e instanceof Error ? e.message : 'Ошибка регистрации')
    yield put(registerFailure(message))
  }
}

function* loginFlow(action: PayloadAction<{ email: string; password: string }>) {
  try {
    const { email, password } = action.payload
    const data: {
      id: number
      email: string
      name?: string | null
      avatarBase64?: string | null
      role?: 'admin' | 'developer' | 'user'
      language?: 'ru' | 'en'
    } = yield call(apiLogin, email, password)
    yield put(
      loginSuccess({
        email: data.email,
        name: data.name ?? null,
        avatarBase64: data.avatarBase64 ?? null,
        role: data.role,
        language: data.language ?? 'ru',
      })
    )
  } catch (e) {
    const anyErr = e as unknown as { response?: { data?: { error?: string } } }
    const message =
      anyErr?.response?.data?.error || (e instanceof Error ? e.message : 'Ошибка входа')
    yield put(loginFailure(message))
  }
}

export default function* rootSaga() {
  yield all([
    watchIncrementAsync(),
    takeLatest(registerRequest.type, registerFlow),
    takeLatest(loginRequest.type, loginFlow),
  ])
}
// Optional avatar update flow (could be used later)
//
