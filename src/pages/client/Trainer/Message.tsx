import React from 'react'
import clsx from 'clsx'

export type MessageType = {
	id: number
	text: string
	createdAt: string
	sender: 'client' | 'trainer'
	imageUrl?: string
}

type MessageProps = {
	msg: MessageType
	onPreview: (url: string) => void
}

export const Message: React.FC<MessageProps> = ({ msg, onPreview }) => (
	<div
		className={clsx(
			'w-fit min-w-[120px] max-w-[65%] px-4 py-3',
			msg.sender === 'client' ? 'ml-auto' : 'mr-auto',
		)}
		style={{
			borderRadius: 15,
			background: '#ffffff',
			border: '1.5px solid #dbe4ee',
			boxShadow: '0 2px 8px 0 rgba(90,120,150,0.04)',
			color: '#000000',
			transition: 'background 0.2s',
			position: 'relative',
		}}
	>
		<div
			style={{
				fontSize: 12,
				color: '#8d8d8d',
				position: 'absolute',
				top: 8,
				right: 16,
			}}
		>
			{msg.createdAt}
		</div>
		<div style={{ marginTop: 18 }}>{msg.text}</div>
		{msg.imageUrl && (
			<div style={{ marginTop: 10 }}>
				<img
					src={msg.imageUrl}
					alt='attachment'
					style={{
						width: 120,
						borderRadius: 8,
						border: '1px solid #dde4ee',
						cursor: 'pointer',
					}}
					onClick={() => onPreview(msg.imageUrl!)}
				/>
			</div>
		)}
	</div>
)
