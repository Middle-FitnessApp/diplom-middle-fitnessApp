export interface Trainer {
	id: string
	name: string
	age: number
	phone: string
	telegram: string
	avatarUrl?: string
}

export interface ClientInTrainerProfile {
	id: string
	name: string
	avatarUrl?: string
	starred: boolean
	unreadMessages: number
	hasNewReport: boolean
}
