export type ChatUploadFile = {
	uid: string
	name: string
	url: string
	originFileObj?: File
}

export type MessageType = {
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

export type ChatType = {
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
	lastMessage?: MessageType | null
	unreadCount: number
	isFavorite?: boolean
}

export type ChatListResponse = {
	chats: ChatType[]
}

export type MessagesResponse = {
	messages: MessageType[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

export type SendMessageResponse = {
	message: MessageType
}
