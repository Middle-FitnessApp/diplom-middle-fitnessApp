import { io, Socket } from 'socket.io-client'
import { API_BASE_URL } from '../config/api.config'
import type { MessageType } from '../types'

export interface ServerToClientEvents {
	new_message: (message: MessageType) => void
	user_typing: (data: { chatId: string; userId: string }) => void
	user_stopped_typing: (data: { chatId: string; userId: string }) => void
	chat_updated: () => void
}

export interface ClientToServerEvents {
	join_chat: (chatId: string) => void
	leave_chat: (chatId: string) => void
	typing_start: (chatId: string) => void
	typing_stop: (chatId: string) => void
}

class SocketService {
	private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
	private reconnectAttempts = 0
	private maxReconnectAttempts = 5
	private reconnectDelay = 1000

	connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.socket?.connected) {
				resolve()
				return
			}

			const token = localStorage.getItem('token')
			if (!token) {
				reject(new Error('No access token found'))
				return
			}

			this.socket = io(API_BASE_URL, {
				auth: {
					token,
				},
				transports: ['websocket', 'polling'],
				upgrade: true,
				rememberUpgrade: true,
				timeout: 20000,
			})

			this.socket.on('connect', () => {
				this.reconnectAttempts = 0
				resolve()
			})

			this.socket.on('disconnect', (reason) => {
				if (reason === 'io server disconnect') {
					// Сервер отключил, не переподключаемся автоматически
					this.socket?.disconnect()
				} else {
					// Попытка переподключения
					this.handleReconnect()
				}
			})

			this.socket.on('connect_error', (error) => {
				this.handleReconnect()
				if (this.reconnectAttempts >= this.maxReconnectAttempts) {
					reject(error)
				}
			})
		})
	}

	private handleReconnect() {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++
			setTimeout(() => {
				this.socket?.connect()
			}, this.reconnectDelay * this.reconnectAttempts)
		}
	}

	disconnect() {
		if (this.socket) {
			this.socket.disconnect()
			this.socket = null
		}
	}

	// Методы для отправки событий
	joinChat(chatId: string) {
		this.socket?.emit('join_chat', chatId)
	}

	leaveChat(chatId: string) {
		this.socket?.emit('leave_chat', chatId)
	}

	startTyping(chatId: string) {
		this.socket?.emit('typing_start', chatId)
	}

	stopTyping(chatId: string) {
		this.socket?.emit('typing_stop', chatId)
	}

	// Подписка на события (использовать напрямую socket.on в компонентах)
	getSocket() {
		return this.socket
	}

	get isConnected(): boolean {
		return this.socket?.connected ?? false
	}

	get socketId(): string | undefined {
		return this.socket?.id
	}
}

export const socketService = new SocketService()
