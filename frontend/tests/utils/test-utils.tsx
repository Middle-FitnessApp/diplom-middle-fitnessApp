/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ReactElement } from 'react'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { configureStore } from '@reduxjs/toolkit'
import {
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from 'redux-persist'
import authReducer from '../../src/store/slices/auth.slice'
import uiReducer from '../../src/store/slices/ui.slice'
import userReducer from '../../src/store/slices/user.slice'
import chatReducer from '../../src/store/slices/chat.slice'
import notificationsReducer from '../../src/store/slices/notifications.slice'
import { authApi } from '../../src/store/api/auth.api'
import { userApi } from '../../src/store/api/user.api'
import { nutritionApi } from '../../src/store/api/nutrition.api'
import { progressApi } from '../../src/store/api/progress.api'
import { trainerApi } from '../../src/store/api/trainer.api'
import { chatApi } from '../../src/store/api/chat.api'
import { notificationsApi } from '../../src/store/api/notifications.api'
import { errorMiddleware } from '../../src/store/middleware/errorMiddleware'

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
	preloadedState?: any
	store?: any
	initialEntries?: string[]
}

// Mock storage для тестов
const createMockStorage = () => {
	const store: Record<string, string> = {}

	return {
		getItem: async (key: string): Promise<string | null> => {
			return store[key] || null
		},
		setItem: async (key: string, value: string): Promise<void> => {
			store[key] = value.toString()
		},
		removeItem: async (key: string): Promise<void> => {
			delete store[key]
		},
	}
}

/**
 * Создаёт тестовый store с возможностью передачи начального состояния
 */
export function createTestStore(preloadedState?: any) {
	const mockStorage = createMockStorage()

	const notificationsPersistConfig = {
		key: 'notifications',
		storage: mockStorage,
		whitelist: ['unreadCount'],
	}

	return configureStore({
		reducer: {
			auth: authReducer,
			ui: uiReducer,
			user: userReducer,
			chat: chatReducer,
			notifications: persistReducer(
				notificationsPersistConfig,
				notificationsReducer,
			) as any,
			[authApi.reducerPath]: authApi.reducer,
			[userApi.reducerPath]: userApi.reducer,
			[nutritionApi.reducerPath]: nutritionApi.reducer,
			[progressApi.reducerPath]: progressApi.reducer,
			[trainerApi.reducerPath]: trainerApi.reducer,
			[chatApi.reducerPath]: chatApi.reducer,
			[notificationsApi.reducerPath]: notificationsApi.reducer,
		} as any,
		preloadedState,
		middleware: (getDefaultMiddleware: any) =>
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
			) as any,
	} as any)
}

/**
 * Кастомный рендер с провайдерами Redux и Router
 */
export function renderWithProviders(
	ui: ReactElement,
	{
		preloadedState,
		store = createTestStore(preloadedState),
		initialEntries = ['/'],
		...renderOptions
	}: ExtendedRenderOptions = {},
) {
	function Wrapper({ children }: { children: React.ReactNode }) {
		return (
			<MemoryRouter initialEntries={initialEntries}>
				<Provider store={store}>
					<ConfigProvider>{children}</ConfigProvider>
				</Provider>
			</MemoryRouter>
		)
	}

	return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

// Re-export всего из testing-library
export * from '@testing-library/react'
export { renderWithProviders as render }
