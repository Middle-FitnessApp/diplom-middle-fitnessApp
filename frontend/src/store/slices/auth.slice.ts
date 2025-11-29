import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, AuthUser } from '../types/auth.types'

const initialState: AuthState = {
	user: null,
	token: localStorage.getItem('token'),
	isAuthenticated: !!localStorage.getItem('token'),
	isLoading: false,
}

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setCredentials: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
			state.user = action.payload.user
			state.token = action.payload.token
			state.isAuthenticated = true
			localStorage.setItem('token', action.payload.token)
		},
		setToken: (state, action: PayloadAction<string>) => {
			state.token = action.payload
			state.isAuthenticated = true
			if (typeof window !== 'undefined') {
				localStorage.setItem('token', action.payload)
			}
		},
		setUser: (state, action: PayloadAction<AuthUser>) => {
			state.user = action.payload
		},
		updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
			if (state.user) {
				state.user = { ...state.user, ...action.payload }
			}
		},
		logout: (state) => {
			state.user = null
			state.token = null
			state.isAuthenticated = false
			localStorage.removeItem('token')
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload
		},
	},
	extraReducers: (builder) => {
		// Можно добавить обработку экшенов из authApi если нужно
	},
})

export const { setCredentials, setToken, setUser, updateUser, logout, setLoading } =
	authSlice.actions
export default authSlice.reducer
