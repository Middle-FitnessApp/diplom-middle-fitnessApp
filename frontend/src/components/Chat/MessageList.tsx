import React, { useEffect, useRef } from 'react'
import type { MessageType } from '../../types'
import { Message } from './Message'

type MessageListProps = {
	messages: MessageType[]
	onPreview: (url: string) => void
	role: 'client' | 'trainer'
}

export const MessageList: React.FC<MessageListProps> = ({
	messages,
	onPreview,
	role,
}) => {
	const messagesEndRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	return (
		<>
			{messages.map((msg) => (
				<Message key={msg.id} msg={msg} onPreview={onPreview} role={role} />
			))}
			<div ref={messagesEndRef} />
		</>
	)
}
