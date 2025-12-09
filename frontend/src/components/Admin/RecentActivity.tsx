import React from 'react'
import { Card, Timeline, Typography, Avatar, Empty } from 'antd'
import { UserAddOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { TrainerInvite } from '../../store/api/trainer.api'

const { Text } = Typography

interface RecentActivityProps {
	invites: TrainerInvite[]
	acceptedClients: Array<{
		id: string
		name: string
		avatarUrl?: string
	}>
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
	invites,
	acceptedClients,
}) => {
	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffMins = Math.floor(diffMs / 60000)
		const diffHours = Math.floor(diffMs / 3600000)
		const diffDays = Math.floor(diffMs / 86400000)

		if (diffMins < 1) return 'только что'
		if (diffMins < 60) return `${diffMins} мин. назад`
		if (diffHours < 24) return `${diffHours} ч. назад`
		if (diffDays < 7) return `${diffDays} дн. назад`
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
		})
	}

	// Создаём timeline items из приглашений
	const timelineItems = invites.slice(0, 5).map((invite) => ({
		dot: (
			<Avatar
				size={32}
				style={{
					background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
				}}
				icon={<UserAddOutlined />}
			/>
		),
		children: (
			<div className='ml-2'>
				<Text strong>{invite.client.name}</Text>
				<Text type='secondary' className='block text-xs'>
					Отправил заявку · {formatDate(invite.createdAt)}
				</Text>
			</div>
		),
	}))

	// Добавляем принятых клиентов (если есть)
	const acceptedItems = acceptedClients.slice(0, 3).map((client) => ({
		dot: (
			<Avatar
				size={32}
				style={{
					background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
				}}
				icon={<CheckCircleOutlined />}
			/>
		),
		children: (
			<div className='ml-2'>
				<Text strong>{client.name}</Text>
				<Text type='secondary' className='block text-xs'>
					Принят в работу
				</Text>
			</div>
		),
	}))

	const allItems = [...timelineItems, ...acceptedItems]

	return (
		<Card
			title={<span className='text-lg font-semibold'>📋 Недавняя активность</span>}
			className='shadow-lg'
			styles={{
				body: {
					padding: '16px',
					maxHeight: '400px',
					overflow: 'auto',
				},
			}}
		>
			{allItems.length === 0 ? (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<Text type='secondary'>Нет недавней активности</Text>}
				/>
			) : (
				<Timeline items={allItems} />
			)}
		</Card>
	)
}
