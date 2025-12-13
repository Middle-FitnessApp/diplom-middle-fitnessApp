import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQueryWithReauth } from './baseQuery'
import type { Notification, NotificationsResponse } from '../../types/notifications'
import { API_ENDPOINTS } from '../../config/api.config'

export const notificationsApi = createApi({
	reducerPath: 'notificationsApi',
	baseQuery: createBaseQueryWithReauth(API_ENDPOINTS.notification),
	tagTypes: ['Notifications'],
	endpoints: (builder) => ({
		getNotifications: builder.query<
			NotificationsResponse,
			{ page?: number; limit?: number; isRead?: boolean }
		>({
			query: ({ page = 1, limit = 10, isRead } = {}) => ({
				url: `/notifications?page=${page}&limit=${limit}${
					isRead !== undefined ? `&isRead=${isRead}` : ''
				}`,
				method: 'GET',
			}),
			providesTags: ['Notifications'],
		}),

		markAsRead: builder.mutation<Notification, string>({
			query: (notificationId) => ({
				url: `/notifications/${notificationId}/read`,
				method: 'PATCH',
			}),
			invalidatesTags: ['Notifications'],
		}),

		markAllAsRead: builder.mutation<{ message: string; updatedCount: number }, void>({
			query: () => ({
				url: '/notifications/mark-all-read',
				method: 'PATCH',
			}),
			invalidatesTags: ['Notifications'],
		}),

		getUnreadCount: builder.query<{ unreadCount: number }, void>({
			query: () => ({
				url: '/notifications/unread-count',
				method: 'GET',
			}),
			providesTags: ['Notifications'],
		}),
	}),
})

export const {
	useGetNotificationsQuery,
	useMarkAsReadMutation,
	useMarkAllAsReadMutation,
	useGetUnreadCountQuery,
} = notificationsApi
