import React from 'react'
import { Card, Avatar, Button, Tooltip, Tag, Typography } from 'antd'
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
import { useAppSelector } from '../../store/hooks'
import { getPhotoUrl } from '../../utils/buildPhotoUrl'
import { formatTelHref, formatPhoneDisplay } from '../../utils/phone'

const { Text } = Typography

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

export const ClientCard: React.FC<ClientCardProps> = ({
	client,
	onToggleStar,
	compact = false,
}) => {
	const navigate = useNavigate()

	// theme
	const isDark = useAppSelector((s) => s.ui.theme) === 'dark'

	const handleViewProfile = () => {
		navigate(`/admin/client/${client.id}`)
	}

	const handleOpenChat = () => {
		navigate(`/admin/chat/${client.id}`)
	}

	const handleAddNutrition = () => {
		navigate(`/admin/client/${client.id}/add-nutrition`)
	}

	const telHref = formatTelHref(client.phone)

	if (compact) {
		return (
			<Card
				className='shadow-sm hover:shadow-md transition-all cursor-pointer'
				style={{ borderRadius: '12px', height: '100%', width: '100%' }}
				styles={{ body: { padding: '12px' } }}
				onClick={handleViewProfile}
			>
				<div className='flex items-center gap-3'>
					<Avatar
						src={getPhotoUrl(client.avatarUrl)}
						icon={<UserOutlined />}
						size={40}
						style={{ border: '2px solid var(--border)' }}
					/>
					<div className='flex-1 min-w-0'>
						<Text strong className='block truncate text-sm'>
							{client.name}
						</Text>
						{client.age && (
							<Text type='secondary' className='text-xs'>
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
			className='shadow-md hover:shadow-xl transition-all card-hover'
			style={{
				borderRadius: '16px',
				overflow: 'hidden',
				height: '100%',
				width: '100%',
			}}
			styles={{
				body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' },
			}}
		>
			{/* Header с градиентом */}
			<div
				className='p-4 relative'
				style={{
					background: client.isFavorite
						? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
						: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				}}
			>
				<div className='flex items-start gap-4'>
					<Avatar
						src={getPhotoUrl(client.avatarUrl)}
						icon={<UserOutlined />}
						size={72}
						style={{
							border: '3px solid rgba(255,255,255,0.9)',
							boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
						}}
					/>
					<div className='flex-1 min-w-0'>
						<div className='flex items-center gap-2'>
							<Text
								strong
								className='text-white text-lg truncate'
								style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
							>
								{client.name}
							</Text>
							{client.hasNewReport && (
								<Tag color='green' className='ml-auto'>
									📊 Новый отчёт
								</Tag>
							)}
						</div>
						<div className='flex flex-wrap gap-2 mt-2'>
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
							type='text'
							size='large'
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
			<div className='p-4 flex-1'>
				{/* Контактная информация */}
				<div className='space-y-2 mb-4'>
					{client.email && (
						<div className='flex items-center gap-2 text-sm'>
							<MailOutlined style={{ color: 'var(--primary)' }} />
							<a
								href={`mailto:${client.email}`}
								onClick={(e) => e.stopPropagation()}
								className={
									isDark
										? 'text-xs text-slate-300 hover:text-white'
										: 'text-xs text-blue-600 hover:text-blue-800 truncate'
								}
								style={{ textDecoration: 'underline', cursor: 'pointer' }}
							>
								{client.email}
							</a>
						</div>
					)}
					{client.phone && (
						<div className='flex items-center gap-2 text-sm'>
							<PhoneOutlined style={{ color: 'var(--success)' }} />
							<a
								href={telHref}
								onClick={(e) => e.stopPropagation()}
								className={
									isDark
										? 'text-xs text-slate-300 hover:text-white'
										: 'text-xs text-green-600 hover:text-green-800'
								}
								style={{ textDecoration: 'underline', cursor: 'pointer' }}
							>
								{formatPhoneDisplay(client.phone) || client.phone}
							</a>
						</div>
					)}
				</div>
			</div>

			{/* Действия */}
			<div className='p-4'>
				{/* Responsive buttons: allow wrapping when space is limited */}
				<div className='flex flex-wrap gap-3'>
					<Button
						type='primary'
						icon={<EyeOutlined />}
						onClick={handleViewProfile}
						className='rounded-md flex-1 basis-[220px] min-w-0'
					>
						Профиль
					</Button>
					<Button
						icon={<MessageOutlined />}
						onClick={handleOpenChat}
						className='rounded-md flex-1 basis-[220px] min-w-0'
					>
						Чат
					</Button>
					<Tooltip title='Назначить план питания'>
						<Button
							icon={<AppleOutlined />}
							onClick={handleAddNutrition}
							className='rounded-md flex-1 basis-[220px] min-w-0'
							style={{ color: 'var(--success)' }}
						>
							Питание
						</Button>
					</Tooltip>
				</div>
			</div>
		</Card>
	)
}
