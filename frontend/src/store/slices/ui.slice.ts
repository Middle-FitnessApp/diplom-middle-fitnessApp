import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type Theme = 'light' | 'dark'

interface Notification {
	id: string
	type: 'info' | 'success' | 'warning' | 'error'
	message: string
	read: boolean
}

interface UIState {
	isSidebarOpen: boolean
	currentPage: string
	notifications: Notification[]
	theme: Theme
}

// Получаем сохранённую тему из localStorage или определяем по системным настройкам
const getInitialTheme = (): Theme => {
	if (typeof window === 'undefined') return 'light'
	
	const savedTheme = localStorage.getItem('theme') as Theme | null
	if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
		return savedTheme
	}
	
	// Проверяем системные настройки
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		return 'dark'
	}
	
	return 'light'
}

// Применяем тему к документу
const applyTheme = (theme: Theme) => {
	if (typeof document === 'undefined') return
	
	const root = document.documentElement
	if (theme === 'dark') {
		root.classList.add('dark')
	} else {
		root.classList.remove('dark')
	}
}

const initialTheme = getInitialTheme()
// Применяем начальную тему сразу
applyTheme(initialTheme)

const initialState: UIState = {
	isSidebarOpen: false,
	currentPage: 'Главная',
	notifications: [],
	theme: initialTheme,
}

const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		toggleSidebar: (state) => {
			state.isSidebarOpen = !state.isSidebarOpen
		},
		setCurrentPage: (state, action: PayloadAction<string>) => {
			state.currentPage = action.payload
		},
		addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'read'>>) => {
			state.notifications.push({
				...action.payload,
				id: Date.now().toString(),
				read: false,
			})
		},
		markNotificationAsRead: (state, action: PayloadAction<string>) => {
			const notification = state.notifications.find((n) => n.id === action.payload)
			if (notification) {
				notification.read = true
			}
		},
		setTheme: (state, action: PayloadAction<Theme>) => {
			state.theme = action.payload
			// Сохраняем в localStorage
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('theme', action.payload)
			}
			// Применяем тему к документу
			applyTheme(action.payload)
		},
		toggleTheme: (state) => {
			const newTheme: Theme = state.theme === 'light' ? 'dark' : 'light'
			state.theme = newTheme
			// Сохраняем в localStorage
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('theme', newTheme)
			}
			// Применяем тему к документу
			applyTheme(newTheme)
		},
	},
})

export const {
	toggleSidebar,
	setCurrentPage,
	addNotification,
	markNotificationAsRead,
	setTheme,
	toggleTheme,
} = uiSlice.actions

export default uiSlice.reducer
