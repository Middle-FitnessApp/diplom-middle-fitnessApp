import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { MessageType, ChatType } from '../../types'

interface ChatState {
	// Список чатов пользователя
	chats: ChatType[]
	// Сообщения по chatId
	messages: Record<string, MessageType[]>
	// Количество непрочитанных сообщений по chatId
	unreadCount: Record<string, number>
	// Индикатор печати по chatId
	typing: Record<string, boolean>
	// Активный чат (для управления непрочитанными)
	activeChatId: string | null
}

// Загружаем из localStorage при инициализации
const loadFromStorage = (): ChatState => {
	try {
		const saved = localStorage.getItem('chat_state')
		if (saved) {
			const parsed = JSON.parse(saved)
			return {
				chats: parsed.chats || [],
				messages: parsed.messages || {},
				unreadCount: parsed.unreadCount || {},
				typing: {},
				activeChatId: null,
			}
		}
	} catch (e) {
		console.error('Failed to load chat state from localStorage', e)
	}
	return { chats: [], messages: {}, unreadCount: {}, typing: {}, activeChatId: null }
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
		// Установить список чатов
		setChats: (state, action: PayloadAction<ChatType[]>) => {
			state.chats = action.payload
			// Синхронизировать unreadCount с данными сервера
			action.payload.forEach((chat) => {
				state.unreadCount[chat.id] = chat.unreadCount
			})
			saveToStorage(state)
		},

		// Установить активный чат
		setActiveChat: (state, action: PayloadAction<string | null>) => {
			state.activeChatId = action.payload
			// Если есть активный чат, сбросить его непрочитанные
			if (action.payload) {
				state.unreadCount[action.payload] = 0
			}
			saveToStorage(state)
		},

		// Добавить сообщение
		addMessage: (
			state,
			action: PayloadAction<{ chatId: string; message: MessageType }>,
		) => {
			const { chatId, message } = action.payload
			if (!state.messages[chatId]) {
				state.messages[chatId] = []
			}
			state.messages[chatId].push(message)
			// Если сообщение входящее и чат не активен, увеличить непрочитанные
			if (message.senderId !== 'current-user' && chatId !== state.activeChatId) {
				state.unreadCount[chatId] = (state.unreadCount[chatId] || 0) + 1
			}
			saveToStorage(state)
		},

		// Получить сообщение через WebSocket
		receiveMessage: (
			state,
			action: PayloadAction<{ chatId: string; message: MessageType }>,
		) => {
			const { chatId, message } = action.payload
			if (!state.messages[chatId]) {
				state.messages[chatId] = []
			}
			state.messages[chatId].push(message)
			// Увеличить непрочитанные только если чат не активен
			if (chatId !== state.activeChatId) {
				state.unreadCount[chatId] = (state.unreadCount[chatId] || 0) + 1
			}
			saveToStorage(state)
		},

		// Обновить индикатор печати
		updateTyping: (
			state,
			action: PayloadAction<{ chatId: string; isTyping: boolean }>,
		) => {
			const { chatId, isTyping } = action.payload
			state.typing[chatId] = isTyping
		},

		// Установить все сообщения для чата (например при загрузке с сервера)
		setMessages: (
			state,
			action: PayloadAction<{ chatId: string; messages: MessageType[] }>,
		) => {
			const { chatId, messages } = action.payload
			state.messages[chatId] = messages
			// При загрузке с сервера все сообщения считаются прочитанными
			state.unreadCount[chatId] = 0
			saveToStorage(state)
		},

		// Увеличить счётчик непрочитанных (устаревший, используем receiveMessage)
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

		// Отметить сообщения как прочитанные на сервере (опционально)
		markMessagesAsRead: (
			state,
			action: PayloadAction<{ chatId: string; messageIds: string[] }>,
		) => {
			const { chatId, messageIds } = action.payload
			// Обновить локальные сообщения
			if (state.messages[chatId]) {
				state.messages[chatId].forEach((msg) => {
					if (messageIds.includes(msg.id)) {
						msg.isRead = true
					}
				})
			}
			saveToStorage(state)
		},

		// Очистить чат
		clearChat: (state, action: PayloadAction<string>) => {
			const chatId = action.payload
			delete state.messages[chatId]
			delete state.unreadCount[chatId]
			delete state.typing[chatId]
			saveToStorage(state)
		},

		// Обновить статус сообщения
		updateMessageStatus: (
			state,
			action: PayloadAction<{
				chatId: string
				messageId: string
				status: 'sending' | 'sent' | 'error'
			}>,
		) => {
			const { chatId, messageId, status } = action.payload
			if (state.messages[chatId]) {
				const message = state.messages[chatId].find((msg) => msg.id === messageId)
				if (message) {
					message.status = status
				}
			}
		},

		// Полный сброс всех чатов (при logout)
		resetAllChats: (state) => {
			state.chats = []
			state.messages = {}
			state.unreadCount = {}
			state.typing = {}
			state.activeChatId = null
			localStorage.removeItem('chat_state')
		},
	},
})

export const {
	setChats,
	setActiveChat,
	addMessage,
	receiveMessage,
	updateTyping,
	setMessages,
	incrementUnread,
	markAsRead,
	markMessagesAsRead,
	updateMessageStatus,
	clearChat,
	resetAllChats,
} = chatSlice.actions

export default chatSlice.reducer
