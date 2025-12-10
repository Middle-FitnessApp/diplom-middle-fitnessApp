import React from 'react'
import {
	CheckCircleOutlined,
	ClockCircleOutlined,
	ExclamationCircleOutlined,
} from '@ant-design/icons'
import type { MessageType } from '../../types'

type MessageProps = {
	msg: MessageType
	onPreview: (url: string) => void
	currentUserId?: string
}

export const Message: React.FC<MessageProps> = ({ msg, onPreview, currentUserId }) => {
	const isOwnMessage = msg.sender.id === currentUserId

	// Простые inline стили без CSS классов
	const baseStyle = {
		padding: '12px 16px',
		borderRadius: '15px',
		maxWidth: '65%',
		minWidth: '120px',
		marginBottom: '8px',
		boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
		display: 'flex',
		flexDirection: 'column' as const,
		wordWrap: 'break-word' as const,
	}

	const ownMessageStyle = {
		...baseStyle,
		backgroundColor: '#1890ff',
		color: 'white',
		marginLeft: 'auto',
		marginRight: '0',
		alignSelf: 'flex-end' as const,
		border: '1.5px solid #1890ff',
	}

	const otherMessageStyle = {
		...baseStyle,
		backgroundColor: '#ffffff',
		color: 'black',
		marginLeft: '0',
		marginRight: 'auto',
		alignSelf: 'flex-start' as const,
		border: '1.5px solid #dbe4ee',
	}

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
				return (
					<ClockCircleOutlined
						style={{ color: 'rgba(255,255,255,0.8)', marginLeft: '8px' }}
					/>
				)
			case 'sent':
				return (
					<CheckCircleOutlined
						style={{ color: 'rgba(255,255,255,0.8)', marginLeft: '8px' }}
					/>
				)
			case 'error':
				return (
					<ExclamationCircleOutlined style={{ color: '#ffccc7', marginLeft: '8px' }} />
				)
			default:
				return null
		}
	}

	return (
		<div style={isOwnMessage ? ownMessageStyle : otherMessageStyle}>
			{msg?.text && (
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<span style={{ flex: 1 }}>{msg.text}</span>
					{renderStatusIcon()}
				</div>
			)}
			{msg?.imageUrl && (
				<div>
					<img
						src={msg.imageUrl}
						alt='attachment'
						style={{
							maxWidth: '200px',
							maxHeight: '200px',
							borderRadius: '8px',
							marginTop: '8px',
							cursor: 'pointer',
						}}
						onClick={() => onPreview(msg.imageUrl!)}
					/>
				</div>
			)}
			<div
				style={{
					fontSize: '11px',
					marginTop: '4px',
					textAlign: 'right',
					color: isOwnMessage ? 'rgba(255,255,255,0.8)' : '#8c8c8c',
				}}
			>
				{formatTime(msg.createdAt)}
			</div>
		</div>
	)
}
