import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type RegisterPayload = {
  name?: string
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

type Role = 'admin' | 'developer' | 'user'
type AuthState = {
  status: 'idle' | 'loading' | 'success' | 'error'
  error?: string
  user?: {
    name: string
    email: string
    avatarBase64?: string | null
    role?: Role
    language?: 'ru' | 'en'
  }
}

const initialState: AuthState = { status: 'idle' }

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerRequest(state, _action: PayloadAction<RegisterPayload>) {
      state.status = 'loading'
      state.error = undefined
    },
    registerSuccess(
      state,
      action: PayloadAction<{
        name: string
        email: string
        avatarBase64?: string | null
        role?: Role
        language?: 'ru' | 'en'
      }>
    ) {
      state.status = 'success'
      state.user = action.payload
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.status = 'error'
      state.error = action.payload
    },
    loginRequest(state, _action: PayloadAction<LoginPayload>) {
      state.status = 'loading'
      state.error = undefined
    },
    loginSuccess(
      state,
      action: PayloadAction<{
        name?: string | null
        email: string
        avatarBase64?: string | null
        role?: Role
        language?: 'ru' | 'en'
      }>
    ) {
      state.status = 'success'
      const displayName = action.payload.name ?? action.payload.email.split('@')[0]
      state.user = {
        name: displayName,
        email: action.payload.email,
        avatarBase64: action.payload.avatarBase64 ?? null,
        role: action.payload.role,
        language: action.payload.language ?? 'ru',
      }
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.status = 'error'
      state.error = action.payload
    },
    reset(state) {
      state.status = 'idle'
      state.error = undefined
      state.user = undefined
    },
    updateAvatar(state, action: PayloadAction<string | null>) {
      if (state.user) state.user.avatarBase64 = action.payload ?? null
    },
    updateLanguage(state, action: PayloadAction<'ru' | 'en'>) {
      if (state.user) state.user.language = action.payload
    },
  },
})

export const {
  registerRequest,
  registerSuccess,
  registerFailure,
  loginRequest,
  loginSuccess,
  loginFailure,
  reset,
  updateAvatar,
  updateLanguage,
} = slice.actions
export default slice.reducer
