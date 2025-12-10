import React from 'react'
import clsx from 'clsx'
import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	ExclamationCircleOutlined,
} from '@ant-design/icons'
import type { MessageType } from '../../types'

type MessageProps = {
	msg: MessageType
	onPreview: (url: string) => void
	role: 'client' | 'trainer'
}

export const Message: React.FC<MessageProps> = ({ msg, onPreview, role }) => {
	const renderStatusIcon = () => {
		if (msg.sender.id !== role) return null // Показывать статус только для своих сообщений

		switch (msg.status) {
			case 'sending':
				return (
					<ClockCircleOutlined className='message-status-icon message-status-sending' />
				)
			case 'sent':
				return <CheckCircleOutlined className='message-status-icon message-status-sent' />
			case 'error':
				return (
					<ExclamationCircleOutlined className='message-status-icon message-status-error' />
				)
			default:
				return null
		}
	}

	return (
		<div
			className={clsx(
				'message-bubble',
				msg.sender.id === role ? 'message-bubble-own' : 'message-bubble-other',
				msg.status === 'error' && 'message-bubble-error',
			)}
		>
			<div className='message-timestamp'>{msg.createdAt}</div>
			<div className='message-content'>
				<span className='message-text'>{msg?.text}</span>
				{renderStatusIcon()}
			</div>
			{msg?.imageUrl && (
				<div>
					<img
						src={msg?.imageUrl}
						alt='attachment'
						className={clsx(
							'message-image',
							msg.status === 'sending' && 'message-image-sending',
						)}
						onClick={() => onPreview(msg.imageUrl!)}
					/>
				</div>
			)}
		</div>
	)
}
