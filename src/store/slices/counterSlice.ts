import { createSlice } from '@reduxjs/toolkit'

const initialState = { value: 0 }

const slice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.value += 1
    },
    decrement(state) {
      state.value -= 1
    },
    incrementAsync(_state) {},
  },
})

export const { increment, decrement, incrementAsync } = slice.actions
export default slice.reducer
