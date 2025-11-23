export type ChatUploadFile = {
	uid: number
	name: string
	url: string
}

export type MessageType = {
	id: number
	text: string
	createdAt: string
	sender: 'client' | 'trainer'
	imageUrl?: string
}
