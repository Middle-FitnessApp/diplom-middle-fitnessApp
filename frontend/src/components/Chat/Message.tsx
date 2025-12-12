import React from 'react'
import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	ExclamationCircleOutlined,
} from '@ant-design/icons'
import type { MessageType } from '../../types'
import { useThemeClasses } from '../../store/hooks'

type MessageProps = {
	msg: MessageType
	onPreview: (url: string) => void
	currentUserId?: string
}

export const Message: React.FC<MessageProps> = ({ msg, onPreview, currentUserId }) => {
	const classes = useThemeClasses()
	const isOwnMessage = msg.sender.id === currentUserId

	// Классы для сообщений
	const baseClasses =
		'p-3 rounded-xl max-w-[65%] min-w-[120px] mb-2 shadow-md flex flex-col break-words'

	const ownMessageClasses = isOwnMessage
		? `${baseClasses} bg-blue-500 text-white ml-auto mr-0 self-end border-2 border-blue-500`
		: `${baseClasses} ${
				classes.isDark
					? 'bg-slate-700 text-slate-100 border-slate-600'
					: 'bg-white text-black border-gray-300'
		  } ml-0 mr-auto self-start border-2`

	// Форматируем время
	const formatTime = (dateString: string) => {
		const date = new Date(dateString)
		const hours = date.getHours().toString().padStart(2, '0')
		const minutes = date.getMinutes().toString().padStart(2, '0')
		return `${hours}:${minutes}`
	}

	const renderStatusIcon = () => {
		if (!isOwnMessage) return null

		switch (msg.status) {
			case 'sending':
				return <ClockCircleOutlined className='text-white/80 ml-2' />
			case 'sent':
				return <CheckCircleOutlined className='text-white/80 ml-2' />
			case 'error':
				return <ExclamationCircleOutlined className='text-red-300 ml-2' />
			default:
				return null
		}
	}

	return (
		<div className={ownMessageClasses}>
			{msg?.text && (
				<div className='flex items-center justify-between'>
					<span className='flex-1'>{msg.text}</span>
					{renderStatusIcon()}
				</div>
			)}
			{msg?.imageUrl && (
				<div>
					<img
						src={msg.imageUrl}
						alt='attachment'
						className='max-w-48 max-h-48 rounded-lg mt-2 cursor-pointer'
						onClick={() => onPreview(msg.imageUrl!)}
					/>
				</div>
			)}
			<div
				className={`text-xs mt-1 text-right ${
					isOwnMessage ? 'text-white/80' : classes.textSecondary
				}`}
			>
				{formatTime(msg.createdAt)}
			</div>
		</div>
	)
}
