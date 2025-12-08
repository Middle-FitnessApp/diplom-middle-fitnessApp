import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { MessageType } from '../../types'

interface ChatState {
	// Сообщения по chatId (например `client_trainer` или `trainer_clientId`)
	messages: Record<string, MessageType[]>
	// Количество непрочитанных сообщений по chatId
	unreadCount: Record<string, number>
}

// Загружаем из localStorage при инициализации
const loadFromStorage = (): ChatState => {
	try {
		const saved = localStorage.getItem('chat_state')
		if (saved) {
			return JSON.parse(saved)
		}
	} catch (e) {
		console.error('Failed to load chat state from localStorage', e)
	}
	return { messages: {}, unreadCount: {} }
}

// Сохраняем в localStorage
const saveToStorage = (state: ChatState) => {
	try {
		localStorage.setItem('chat_state', JSON.stringify(state))
	} catch (e) {
		console.error('Failed to save chat state to localStorage', e)
	}
}

const initialState: ChatState = loadFromStorage()

export const chatSlice = createSlice({
	name: 'chat',
	initialState,
	reducers: {
		// Добавить сообщение
		addMessage: (
			state,
			action: PayloadAction<{ chatId: string; message: MessageType }>
		) => {
			const { chatId, message } = action.payload
			if (!state.messages[chatId]) {
				state.messages[chatId] = []
			}
			state.messages[chatId].push(message)
			saveToStorage(state)
		},

		// Установить все сообщения для чата (например при загрузке с сервера)
		setMessages: (
			state,
			action: PayloadAction<{ chatId: string; messages: MessageType[] }>
		) => {
			const { chatId, messages } = action.payload
			state.messages[chatId] = messages
			saveToStorage(state)
		},

		// Увеличить счётчик непрочитанных
		incrementUnread: (state, action: PayloadAction<string>) => {
			const chatId = action.payload
			state.unreadCount[chatId] = (state.unreadCount[chatId] || 0) + 1
			saveToStorage(state)
		},

		// Сбросить непрочитанные (когда открыли чат)
		markAsRead: (state, action: PayloadAction<string>) => {
			const chatId = action.payload
			state.unreadCount[chatId] = 0
			saveToStorage(state)
		},

		// Очистить чат
		clearChat: (state, action: PayloadAction<string>) => {
			const chatId = action.payload
			delete state.messages[chatId]
			delete state.unreadCount[chatId]
			saveToStorage(state)
		},

		// Полный сброс всех чатов (при logout)
		resetAllChats: (state) => {
			state.messages = {}
			state.unreadCount = {}
			localStorage.removeItem('chat_state')
		},
	},
})

export const { addMessage, setMessages, incrementUnread, markAsRead, clearChat, resetAllChats } =
	chatSlice.actions

export default chatSlice.reducer

