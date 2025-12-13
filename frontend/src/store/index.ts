import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
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

const notificationsPersistConfig = {
	key: 'notifications',
	storage,
	whitelist: ['unreadCount'], // Сохраняем только unreadCount
}

export const store = configureStore({
	reducer: {
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
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
			},
		}).concat(
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

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
