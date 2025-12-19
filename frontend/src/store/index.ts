import { configureStore } from '@reduxjs/toolkit'
import type { ReducersMapObject } from '@reduxjs/toolkit'
import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from 'redux-persist'

type PersistPartial = {
	_persist: {
		version: number
		rehydrated: boolean
	}
}
import storage from 'redux-persist/lib/storage'
import authReducer from './slices/auth.slice'
import uiReducer from './slices/ui.slice'
import userReducer from './slices/user.slice'
import chatReducer from './slices/chat.slice'
import notificationsReducer from './slices/notifications.slice'
import { authApi } from './api/auth.api'
import { userApi } from './api/user.api'
import { nutritionApi } from './api/nutrition.api'
import { progressApi } from './api/progress.api'
import { trainerApi } from './api/trainer.api'
import { chatApi } from './api/chat.api'
import { notificationsApi } from './api/notifications.api'
import type { NotificationsState } from '../types/notifications'
import { errorMiddleware } from './middleware/errorMiddleware'
import type { AuthState } from './types/auth.types'
import type { UIState } from './slices/ui.slice'
import type { ChatState } from './slices/chat.slice'
import type { UserState } from './types/user.types'

export type RootState = {
	auth: AuthState
	ui: UIState
	user: UserState
	chat: ChatState
	notifications: NotificationsState & PersistPartial
	[authApi.reducerPath]: ReturnType<typeof authApi.reducer>
	[userApi.reducerPath]: ReturnType<typeof userApi.reducer>
	[nutritionApi.reducerPath]: ReturnType<typeof nutritionApi.reducer>
	[progressApi.reducerPath]: ReturnType<typeof progressApi.reducer>
	[trainerApi.reducerPath]: ReturnType<typeof trainerApi.reducer>
	[chatApi.reducerPath]: ReturnType<typeof chatApi.reducer>
	[notificationsApi.reducerPath]: ReturnType<typeof notificationsApi.reducer>
}

const notificationsPersistConfig = {
	key: 'notifications',
	storage,
	whitelist: ['unreadCount'], // Сохраняем только unreadCount
}

const rootReducer: ReducersMapObject<RootState> = {
	// Слайсы
	auth: authReducer,
	ui: uiReducer,
	user: userReducer,
	chat: chatReducer,
	notifications: persistReducer(notificationsPersistConfig, notificationsReducer),

	// RTK Query APIs
	[authApi.reducerPath]: authApi.reducer,
	[userApi.reducerPath]: userApi.reducer,
	[nutritionApi.reducerPath]: nutritionApi.reducer,
	[progressApi.reducerPath]: progressApi.reducer,
	[trainerApi.reducerPath]: trainerApi.reducer,
	[chatApi.reducerPath]: chatApi.reducer,
	[notificationsApi.reducerPath]: notificationsApi.reducer,
}

export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}).concat(
			errorMiddleware,
			authApi.middleware,
			userApi.middleware,
			nutritionApi.middleware,
			progressApi.middleware,
			trainerApi.middleware,
			chatApi.middleware,
			notificationsApi.middleware,
		),
})

export const persistor = persistStore(store)

export type AppDispatch = typeof store.dispatch
