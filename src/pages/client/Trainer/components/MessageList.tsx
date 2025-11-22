import React, { useEffect, useRef } from 'react'
import type { MessageType } from '../../../../types'
import { Message } from './'

type MessageListProps = {
	messages: MessageType[]
	onPreview: (url: string) => void
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onPreview }) => {
	const messagesEndRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	return (
		<div
			className='flex-1 px-6 py-6 overflow-y-auto'
			style={{
				background: '#72a9c9',
				display: 'flex',
				flexDirection: 'column',
				gap: '18px',
				borderBottom: '1.5px solid #dbe4ee',
				borderRadius: 18,
				marginBottom: '0.5rem',
			}}
		>
			{messages.map((msg) => (
				<Message key={msg.id} msg={msg} onPreview={onPreview} />
			))}
			<div ref={messagesEndRef} />
		</div>
	)
}
