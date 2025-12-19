import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Notification, NotificationsState } from '../../types/notifications'

const initialState: NotificationsState = {
	notifications: [],
	unreadCount: 0,
	isConnected: false,
}

const notificationsSlice = createSlice({
	name: 'notifications',
	initialState,
	reducers: {
		setNotifications: (state, action: PayloadAction<Notification[]>) => {
			state.notifications = action.payload
		},
		addNotification: (state, action: PayloadAction<Notification>) => {
			state.notifications.unshift(action.payload) // Добавляем в начало
			if (!action.payload.isRead) {
				state.unreadCount += 1
			}
		},
		markAsRead: (state, action: PayloadAction<string>) => {
			const notification = state.notifications.find(
				(n: Notification) => n.id === action.payload,
			)
			if (notification && !notification.isRead) {
				notification.isRead = true
				state.unreadCount = Math.max(0, state.unreadCount - 1)
			}
		},
		markAllAsRead: (state) => {
			state.notifications.forEach((notification: Notification) => {
				notification.isRead = true
			})
			state.unreadCount = 0
		},
		setUnreadCount: (state, action: PayloadAction<number>) => {
			state.unreadCount = action.payload
		},
		setConnected: (state, action: PayloadAction<boolean>) => {
			state.isConnected = action.payload
		},
		clearNotifications: (state) => {
			state.notifications = []
			state.unreadCount = 0
		},
	},
})

export const {
	setNotifications,
	addNotification,
	markAsRead,
	markAllAsRead,
	setUnreadCount,
	setConnected,
	clearNotifications,
} = notificationsSlice.actions

export default notificationsSlice.reducer
