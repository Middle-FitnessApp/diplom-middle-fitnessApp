import React from 'react'
import { Card, Avatar, Button, Tooltip, Tag, Typography, Space } from 'antd'
import {
	UserOutlined,
	StarFilled,
	StarOutlined,
	MessageOutlined,
	EyeOutlined,
	PhoneOutlined,
	MailOutlined,
	CalendarOutlined,
	AppleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Text, Paragraph } = Typography

interface ClientCardProps {
	client: {
		id: string
		name: string
		avatarUrl?: string
		isFavorite: boolean
		hasNewReport?: boolean
		email?: string | null
		phone?: string | null
		age?: number
	}
	onToggleStar: (clientId: string) => void
	compact?: boolean
}

const API_URL = 'http://localhost:3000'

export const ClientCard: React.FC<ClientCardProps> = ({
	client,
	onToggleStar,
	compact = false,
}) => {
	const navigate = useNavigate()

	const getPhotoUrl = (photo?: string) => {
		if (!photo) return `${API_URL}/uploads/default/user.png`
		return photo.startsWith('http') ? photo : `${API_URL}${photo}`
	}

	const handleViewProfile = () => {
		navigate(`/admin/client/${client.id}`)
	}

	const handleOpenChat = () => {
		navigate(`/admin/chat/${client.id}`)
	}

	const handleAddNutrition = () => {
		navigate(`/admin/client/${client.id}/add-nutrition`)
	}

	if (compact) {
		return (
			<Card
				className="shadow-sm hover:shadow-md transition-all cursor-pointer"
				style={{ borderRadius: '12px' }}
				styles={{ body: { padding: '12px' } }}
				onClick={handleViewProfile}
			>
				<div className="flex items-center gap-3">
					<Avatar
						src={getPhotoUrl(client.avatarUrl)}
						icon={<UserOutlined />}
						size={40}
						style={{ border: '2px solid var(--border)' }}
					/>
					<div className="flex-1 min-w-0">
						<Text strong className="block truncate text-sm">
							{client.name}
						</Text>
						{client.age && (
							<Text type="secondary" className="text-xs">
								{client.age} лет
							</Text>
						)}
					</div>
					{client.isFavorite && (
						<StarFilled style={{ color: 'var(--warning)', fontSize: 16 }} />
					)}
				</div>
			</Card>
		)
	}

	return (
		<Card
			className="shadow-md hover:shadow-xl transition-all card-hover"
			style={{
				borderRadius: '16px',
				overflow: 'hidden',
			}}
			styles={{
				body: { padding: 0 },
			}}
		>
			{/* Header с градиентом */}
			<div
				className="p-4 relative"
				style={{
					background: client.isFavorite
						? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
						: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				}}
			>
				<div className="flex items-start gap-4">
					<Avatar
						src={getPhotoUrl(client.avatarUrl)}
						icon={<UserOutlined />}
						size={72}
						style={{
							border: '3px solid rgba(255,255,255,0.9)',
							boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
						}}
					/>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<Text
								strong
								className="text-white text-lg truncate"
								style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
							>
								{client.name}
							</Text>
							{client.hasNewReport && (
								<Tag color="green" className="ml-auto">
									📊 Новый отчёт
								</Tag>
							)}
						</div>
						<div className="flex flex-wrap gap-2 mt-2">
							{client.age && (
								<Tag
									icon={<CalendarOutlined />}
									style={{
										background: 'rgba(255,255,255,0.2)',
										border: 'none',
										color: '#fff',
									}}
								>
									{client.age} лет
								</Tag>
							)}
						</div>
					</div>
					<Tooltip title={client.isFavorite ? 'Убрать из избранных' : 'В избранное'}>
						<Button
							type="text"
							size="large"
							icon={
								client.isFavorite ? (
									<StarFilled style={{ color: '#ffd700', fontSize: 24 }} />
								) : (
									<StarOutlined style={{ color: '#fff', fontSize: 24 }} />
								)
							}
							onClick={(e) => {
								e.stopPropagation()
								onToggleStar(client.id)
							}}
							style={{ background: 'rgba(255,255,255,0.15)' }}
						/>
					</Tooltip>
				</div>
			</div>

			{/* Body */}
			<div className="p-4">
				{/* Контактная информация */}
				<div className="space-y-2 mb-4">
					{client.email && (
						<div className="flex items-center gap-2 text-sm">
							<MailOutlined style={{ color: 'var(--primary)' }} />
							<Text type="secondary" className="truncate">
								{client.email}
							</Text>
						</div>
					)}
					{client.phone && (
						<div className="flex items-center gap-2 text-sm">
							<PhoneOutlined style={{ color: 'var(--success)' }} />
							<Text type="secondary">{client.phone}</Text>
						</div>
					)}
				</div>

				{/* Действия */}
				<Space wrap className="w-full" style={{ justifyContent: 'space-between' }}>
					<Button
						type="primary"
						icon={<EyeOutlined />}
						onClick={handleViewProfile}
						style={{ borderRadius: '8px' }}
					>
						Профиль
					</Button>
					<Button
						icon={<MessageOutlined />}
						onClick={handleOpenChat}
						style={{ borderRadius: '8px' }}
					>
						Чат
					</Button>
					<Tooltip title="Назначить план питания">
						<Button
							icon={<AppleOutlined />}
							onClick={handleAddNutrition}
							style={{ borderRadius: '8px', color: 'var(--success)' }}
						/>
					</Tooltip>
				</Space>
			</div>
		</Card>
	)
}

