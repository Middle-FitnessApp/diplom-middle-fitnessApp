export type NotificationType = 'REPORT' | 'COMMENT' | 'PLAN' | 'MESSAGE'

export interface Notification {
	id: string
	userId: string
	type: NotificationType
	message: string
	isRead: boolean
	createdAt: string
}

export interface NotificationsResponse {
	notifications: Notification[]
	unreadCount: number
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

export interface NotificationsState {
	notifications: Notification[]
	unreadCount: number
	isConnected: boolean
}
