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

const initialState: ChatState = {
	chats: [],
	messages: {},
	unreadCount: {},
	typing: {},
	activeChatId: null,
}

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
		},

		// Установить активный чат
		setActiveChat: (state, action: PayloadAction<string | null>) => {
			state.activeChatId = action.payload
			// Если есть активный чат, сбросить его непрочитанные
			if (action.payload) {
				state.unreadCount[action.payload] = 0
			}
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
			// Проверяем, нет ли уже сообщения с таким id (избегаем дубликатов)
			const exists = state.messages[chatId].some((msg) => msg.id === message.id)
			if (!exists) {
				state.messages[chatId].push(message)
				// Увеличить непрочитанные только если чат не активен
				if (chatId !== state.activeChatId) {
					state.unreadCount[chatId] = (state.unreadCount[chatId] || 0) + 1
				}
			}
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
		},

		// Увеличить счётчик непрочитанных (устаревший, используем receiveMessage)
		incrementUnread: (state, action: PayloadAction<string>) => {
			const chatId = action.payload
			state.unreadCount[chatId] = (state.unreadCount[chatId] || 0) + 1
		},

		// Сбросить непрочитанные (когда открыли чат)
		markAsRead: (state, action: PayloadAction<string>) => {
			const chatId = action.payload
			state.unreadCount[chatId] = 0
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
		},

		// Очистить чат
		clearChat: (state, action: PayloadAction<string>) => {
			const chatId = action.payload
			delete state.messages[chatId]
			delete state.unreadCount[chatId]
			delete state.typing[chatId]
		},

		// Обновить статус сообщения
		updateMessageStatus: (
			state,
			action: PayloadAction<{
				chatId: string
				messageId: string
				status: 'sending' | 'sent' | 'error'
				newChatId?: string // Для перемещения сообщения в другой чат
			}>,
		) => {
			const { chatId, messageId, status, newChatId } = action.payload
			if (state.messages[chatId]) {
				const messageIndex = state.messages[chatId].findIndex(
					(msg) => msg.id === messageId,
				)
				if (messageIndex !== -1) {
					const message = state.messages[chatId][messageIndex]
					message.status = status

					// Если указан newChatId, перемещаем сообщение в другой чат
					if (newChatId && newChatId !== chatId) {
						// Удаляем из старого чата
						state.messages[chatId].splice(messageIndex, 1)
						// Обновляем chatId в сообщении
						message.chatId = newChatId
						// Добавляем в новый чат
						if (!state.messages[newChatId]) {
							state.messages[newChatId] = []
						}
						state.messages[newChatId].push(message)
					}
				}
			}
		},

		// Заменить временное сообщение на реальное
		replaceMessage: (
			state,
			action: PayloadAction<{
				chatId: string
				tempMessageId: string
				realMessage: MessageType
			}>,
		) => {
			const { chatId, tempMessageId, realMessage } = action.payload
			if (state.messages[chatId]) {
				const messageIndex = state.messages[chatId].findIndex(
					(msg) => msg.id === tempMessageId,
				)
				if (messageIndex !== -1) {
					// Заменяем временное сообщение на реальное
					state.messages[chatId][messageIndex] = realMessage
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
	replaceMessage,
	clearChat,
	resetAllChats,
} = chatSlice.actions

export default chatSlice.reducer
