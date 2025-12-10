import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
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
			{ chatId: string; text?: string; image?: File }
		>({
			query: ({ chatId, ...body }) => {
				const formData = new FormData()
				if (body.text) formData.append('text', body.text)
				if (body.image) formData.append('image', body.image)

				return {
					url: `/${chatId}/messages`,
					method: 'POST',
					body: formData,
				}
			},
			invalidatesTags: ['Messages', 'Chats'],
		}),
	}),
})

export const { useGetChatsQuery, useGetMessagesQuery, useSendMessageMutation } = chatApi
