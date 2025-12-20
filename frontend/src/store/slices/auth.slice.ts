import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, AuthUser } from '../types/auth.types'
import { authApi } from '../api/auth.api'
import { userApi } from '../api/user.api'
import { trainerApi } from '../api/trainer.api'
import { progressApi } from '../api/progress.api'
import { nutritionApi } from '../api/nutrition.api'
import { resetAllChats } from './chat.slice'

const initialState: AuthState = {
	user: null,
	token: localStorage.getItem('token'),
	isAuthenticated: !!localStorage.getItem('token'),
	isLoading: false,
}

// Полный logout с очисткой всего
export const performLogout = createAsyncThunk(
	'auth/performLogout',
	async (_, { dispatch }) => {
		// 1. Пробуем вызвать API logout (удалит refresh token на сервере)
		try {
			await dispatch(authApi.endpoints.logout.initiate()).unwrap()
		} catch (error) {
			// Игнорируем ошибки - всё равно очищаем локально
			if (import.meta.env.DEV) {
				console.error('Logout API error (ignored):', error)
			}
		}

		// 2. Очищаем весь localStorage
		localStorage.removeItem('token')
		localStorage.removeItem('chat_state') // Очищаем данные чата

		// 3. Сбрасываем кэш всех RTK Query API
		dispatch(authApi.util.resetApiState())
		dispatch(userApi.util.resetApiState())
		dispatch(trainerApi.util.resetApiState())
		dispatch(progressApi.util.resetApiState())
		dispatch(nutritionApi.util.resetApiState())

		// 4. Сбрасываем состояние чата
		dispatch(resetAllChats())

		return true
	},
)

// Отмена тренера с обновлением состояния
export const performCancelTrainer = createAsyncThunk(
	'auth/performCancelTrainer',
	async (_, { dispatch }) => {
		const result = await dispatch(userApi.endpoints.cancelTrainer.initiate()).unwrap()
		// Обновляем локальное состояние
		dispatch(updateUser({ trainer: null }))
		// Инвалидируем кэш планов питания, так как они удаляются при отмене тренера
		dispatch(nutritionApi.util.invalidateTags(['AssignedPlan', 'Day']))
		return result
	},
)

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
		// Простой logout (для внутреннего использования)
		logout: (state) => {
			state.user = null
			state.token = null
			state.isAuthenticated = false
			localStorage.removeItem('token')
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload
		},
		// Полный сброс состояния
		resetAuth: (state) => {
			state.user = null
			state.token = null
			state.isAuthenticated = false
			state.isLoading = false
		},
	},
	extraReducers: (builder) => {
		// Обработка performLogout
		builder
			.addCase(performLogout.pending, (state) => {
				state.isLoading = true
			})
			.addCase(performLogout.fulfilled, (state) => {
				state.user = null
				state.token = null
				state.isAuthenticated = false
				state.isLoading = false
			})
			.addCase(performLogout.rejected, (state) => {
				// Всё равно выходим даже при ошибке
				state.user = null
				state.token = null
				state.isAuthenticated = false
				state.isLoading = false
			})
		// Обработка performCancelTrainer
		builder
			.addCase(performCancelTrainer.pending, (state) => {
				state.isLoading = true
			})
			.addCase(performCancelTrainer.fulfilled, (state) => {
				state.isLoading = false
			})
			.addCase(performCancelTrainer.rejected, (state) => {
				state.isLoading = false
			})
	},
})

export const {
	setCredentials,
	setToken,
	setUser,
	updateUser,
	logout,
	setLoading,
	resetAuth,
} = authSlice.actions
export default authSlice.reducer
