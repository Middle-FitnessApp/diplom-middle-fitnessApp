import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQueryWithReauth } from './baseQuery'
import { API_ENDPOINTS } from '../../config/api.config'

export interface Message {
	id: string
	chatId: string
	senderId: string
	text: string
	imageUrl?: string
	createdAt: string
	isRead: boolean
	sender: {
		id: string
		name: string
		photo?: string
	}
}

export interface Chat {
	id: string
	trainerId: string
	clientId: string
	createdAt: string
	updatedAt: string
	client?: {
		id: string
		name: string
		photo?: string
	}
	trainer?: {
		id: string
		name: string
		photo?: string
	}
	lastMessage?: Message | null
	unreadCount: number
	isFavorite?: boolean
}

export interface ChatListResponse {
	chats: Chat[]
}

export interface SendMessageResponse {
	message: Message
}

export interface GetMessagesResponse {
	messages: Message[]
	total: number
	page: number
	limit: number
}

export const chatApi = createApi({
	reducerPath: 'chatApi',
	baseQuery: createBaseQueryWithReauth(API_ENDPOINTS.chat),
	tagTypes: ['Messages', 'Chats'],
	endpoints: (builder) => ({
		getChats: builder.query<ChatListResponse, void>({
			query: () => '/',
			providesTags: ['Chats'],
		}),

		getMessages: builder.query<
			GetMessagesResponse,
			{ chatId: string; page?: number; limit?: number }
		>({
			query: ({ chatId, ...params }) => ({
				url: `/${chatId}/messages`,
				params,
			}),
			providesTags: ['Messages'],
		}),

		sendMessage: builder.mutation<
			SendMessageResponse,
			{ chatId?: string; text?: string; image?: File }
		>({
			query: ({ chatId, ...body }) => {
				const formData = new FormData()
				if (body.text) formData.append('text', body.text)
				if (body.image) formData.append('image', body.image)
				if (chatId) formData.append('chatId', chatId)

				return {
					url: '/messages',
					method: 'POST',
					body: formData,
				}
			},
			invalidatesTags: ['Messages', 'Chats'],
		}),
	}),
})

export const { useGetChatsQuery, useGetMessagesQuery, useSendMessageMutation } = chatApi
