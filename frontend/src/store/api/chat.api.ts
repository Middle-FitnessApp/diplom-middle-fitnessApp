import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_ENDPOINTS } from '../../config/api.config'

export interface Message {
	id: string
	senderId: string
	receiverId: string
	message: string
	timestamp: string
	read: boolean
	senderName: string
	senderAvatar?: string
}

export interface Chat {
	id: string
	participant1: string
	participant2: string
	messages: Message[]
}

export const chatApi = createApi({
	reducerPath: 'chatApi',
	baseQuery: fetchBaseQuery({
		baseUrl: API_ENDPOINTS.chat,
		credentials: 'include',
		prepareHeaders: (headers) => {
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
			if (token) {
				headers.set('authorization', `Bearer ${token}`)
			}
			return headers
		},
	}),
	tagTypes: ['Messages'],
	endpoints: (builder) => ({
		getMessages: builder.query<Message[], { userId1: string; userId2: string }>({
			query: ({ userId1, userId2 }) => `/${userId1}/${userId2}`,
			providesTags: ['Messages'],
		}),

		sendMessage: builder.mutation<
			Message,
			{
				senderId: string
				receiverId: string
				message: string
				senderName: string
				senderAvatar?: string
			}
		>({
			query: (messageData) => ({
				url: '/send',
				method: 'POST',
				body: messageData,
			}),
			invalidatesTags: ['Messages'],
		}),

		markMessagesAsRead: builder.mutation<void, { userId: string; contactId: string }>({
			query: ({ userId, contactId }) => ({
				url: '/mark-read',
				method: 'POST',
				body: { userId, contactId },
			}),
			invalidatesTags: ['Messages'],
		}),

		getTrainerChats: builder.query<Chat[], string>({
			query: (trainerId) => `/trainer/${trainerId}/chats`,
			providesTags: ['Messages'],
		}),
	}),
})

export const {
	useGetMessagesQuery,
	useSendMessageMutation,
	useMarkMessagesAsReadMutation,
	useGetTrainerChatsQuery,
} = chatApi
