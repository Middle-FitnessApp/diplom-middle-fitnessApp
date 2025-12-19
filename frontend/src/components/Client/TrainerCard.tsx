import React from 'react'
import { Card, Avatar, Button, Typography, Space, Tooltip, Tag } from 'antd'
import {
	UserOutlined,
	MessageOutlined,
	DisconnectOutlined,
	SendOutlined,
	ClockCircleOutlined,
	InstagramOutlined,
} from '@ant-design/icons'
import type { TrainerInfo } from '../../store/types/auth.types'
import { useAppSelector } from '../../store/hooks'
import type { TrainerListItem } from '../../store/types/user.types'

const { Text, Paragraph } = Typography

// Иконка Telegram (кастомная)
const TelegramIcon = () => (
	<svg viewBox='0 0 24 24' width='14' height='14' fill='currentColor'>
		<path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
	</svg>
)

// Иконка WhatsApp (кастомная)
const WhatsAppIcon = () => (
	<svg viewBox='0 0 24 24' width='14' height='14' fill='currentColor'>
		<path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
	</svg>
)

type InviteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | null

interface TrainerCardProps {
	trainer: TrainerListItem | TrainerInfo
	isMyTrainer?: boolean
	inviteStatus?: InviteStatus
	onSelect?: (trainerId: string) => void
	onUnlink?: () => void
	onChat?: () => void
	onCancelInvite?: (trainerId: string) => void
	loading?: boolean
}

export const TrainerCard: React.FC<TrainerCardProps> = ({
	trainer,
	isMyTrainer = false,
	inviteStatus,
	onSelect,
	onUnlink,
	onChat,
	onCancelInvite,
	loading = false,
}) => {
	const theme = useAppSelector((state) => state.ui.theme)
	const isDark = theme === 'dark'

	const photoUrl = trainer.photo
		? trainer.photo.startsWith('http')
			? trainer.photo
			: `http://localhost:3000${trainer.photo}`
		: undefined

	// Социальные ссылки
	const socialLinks = []
	if (trainer.telegram) {
		socialLinks.push(
			<Tooltip title={`Telegram: ${trainer.telegram}`} key='telegram'>
				<a
					href={`https://t.me/${trainer.telegram.replace('@', '')}`}
					target='_blank'
					rel='noopener noreferrer'
					className='social-link telegram'
					onClick={(e) => e.stopPropagation()}
				>
					<TelegramIcon />
				</a>
			</Tooltip>,
		)
	}
	if (trainer.whatsapp) {
		socialLinks.push(
			<Tooltip title={`WhatsApp: ${trainer.whatsapp}`} key='whatsapp'>
				<a
					href={`https://wa.me/${trainer.whatsapp.replace(/\D/g, '')}`}
					target='_blank'
					rel='noopener noreferrer'
					className='social-link whatsapp'
					onClick={(e) => e.stopPropagation()}
				>
					<WhatsAppIcon />
				</a>
			</Tooltip>,
		)
	}
	if (trainer.instagram) {
		socialLinks.push(
			<Tooltip title={`Instagram: ${trainer.instagram}`} key='instagram'>
				<a
					href={`https://instagram.com/${trainer.instagram.replace('@', '')}`}
					target='_blank'
					rel='noopener noreferrer'
					className='social-link instagram'
					onClick={(e) => e.stopPropagation()}
				>
					<InstagramOutlined />
				</a>
			</Tooltip>,
		)
	}

	if (isMyTrainer) {
		// Карточка привязанного тренера (большая, детальная)
		return (
			<Card
				className='my-trainer-card'
				style={{
					background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					borderRadius: 20,
					border: 'none',
					boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
				}}
			>
				<div className='flex flex-col md:flex-row items-center gap-6'>
					<Avatar
						size={120}
						src={photoUrl}
						icon={<UserOutlined />}
						style={{
							border: '4px solid rgba(255,255,255,0.3)',
							boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
						}}
					/>
					<div className='flex-1 text-center md:text-left'>
						<div className='flex items-center justify-center md:justify-start gap-3 mb-2'>
							<Text
								strong
								style={{
									fontSize: 28,
									color: '#fff',
									textShadow: '0 2px 4px rgba(0,0,0,0.2)',
								}}
							>
								{trainer.name}
							</Text>
							<Tag color='gold' style={{ margin: 0 }}>
								Ваш тренер
							</Tag>
						</div>

						{trainer.bio && (
							<Paragraph
								style={{
									color: 'rgba(255,255,255,0.9)',
									fontSize: 16,
									marginBottom: 16,
									maxWidth: 500,
								}}
								ellipsis={{ rows: 2 }}
							>
								{trainer.bio}
							</Paragraph>
						)}

						{socialLinks.length > 0 && (
							<Space size='middle' className='mb-4'>
								{socialLinks}
							</Space>
						)}

						<div className='flex flex-wrap gap-3 justify-center md:justify-start mt-4'>
							<Button
								type='primary'
								size='large'
								icon={<MessageOutlined />}
								onClick={onChat}
								style={{
									background: 'rgba(255,255,255,0.2)',
									borderColor: 'rgba(255,255,255,0.3)',
									backdropFilter: 'blur(10px)',
								}}
							>
								Написать в чат
							</Button>
							<Button
								size='large'
								icon={<DisconnectOutlined />}
								onClick={onUnlink}
								loading={loading}
								danger
								style={{
									background: 'rgba(255,255,255,0.9)',
								}}
							>
								Отвязать тренера
							</Button>
						</div>
					</div>
				</div>
			</Card>
		)
	}

	// Карточка тренера в списке (компактная)
	const isPending = inviteStatus === 'PENDING'

	// Стили для контентного блока в зависимости от темы
	const contentBlockStyle = {
		background: isDark ? '#1e293b' : '#fff',
		borderRadius: 12,
		padding: '16px',
		boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
	}

	const nameStyle = {
		fontSize: 18,
		display: 'block' as const,
		textAlign: 'center' as const,
		marginBottom: 8,
		color: isDark ? '#f1f5f9' : undefined,
	}

	const cancelButtonStyle = {
		height: 40,
		borderRadius: 8,
		fontWeight: 500,
		background: isDark ? '#78350f' : '#fff7e6',
		borderColor: isDark ? '#92400e' : '#ffd591',
		color: isDark ? '#fbbf24' : '#d46b08',
	}

	return (
		<Card
			className='trainer-list-card card-hover'
			style={{
				borderRadius: 16,
				overflow: 'hidden',
				height: '100%',
				opacity: isPending ? 0.85 : 1,
			}}
			bodyStyle={{ padding: 0 }}
		>
			{/* Верхняя часть с градиентом */}
			<div
				style={{
					background: isPending
						? 'linear-gradient(135deg, #ffa940 0%, #fa8c16 100%)'
						: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					padding: '24px 20px 40px',
					position: 'relative',
				}}
			>
				{isPending && (
					<div
						style={{
							position: 'absolute',
							top: 10,
							left: 10,
							zIndex: 5,
						}}
					>
						<Tooltip title='Ожидает ответа' placement='top' color='#fffbe9'>
							<ClockCircleOutlined
								style={{
									fontSize: 20,
									color: '#faad14',
									background: '#fffbe6',
									borderRadius: '50%',
									padding: 4,
									boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
									cursor: 'default',
								}}
							/>
						</Tooltip>
					</div>
				)}
				<div className='flex justify-center'>
					<Avatar
						size={80}
						src={photoUrl}
						icon={<UserOutlined />}
						style={{
							border: '3px solid rgba(255,255,255,0.4)',
							boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
						}}
					/>
				</div>
			</div>

			{/* Контент */}
			<div className='p-5 -mt-5 pb-0 pr-0 pl-0'>
				<div style={contentBlockStyle}>
					<Text strong style={nameStyle}>
						{trainer.name}
					</Text>

					{trainer.bio && (
						<Paragraph
							type='secondary'
							style={{
								fontSize: 13,
								textAlign: 'center',
								marginBottom: 12,
							}}
							ellipsis={{ rows: 2 }}
						>
							{trainer.bio}
						</Paragraph>
					)}

					{socialLinks.length > 0 && (
						<div className='flex justify-center gap-2 mb-4'>{socialLinks}</div>
					)}

					{isPending ? (
						<Button
							block
							icon={<ClockCircleOutlined />}
							onClick={() => onCancelInvite?.(trainer.id)}
							loading={loading}
							style={cancelButtonStyle}
						>
							Отменить заявку
						</Button>
					) : (
						<Button
							type='primary'
							block
							icon={<SendOutlined />}
							onClick={() => onSelect?.(trainer.id)}
							loading={loading}
							style={{
								height: 40,
								borderRadius: 8,
								fontWeight: 500,
							}}
						>
							Выбрать тренера
						</Button>
					)}
				</div>
			</div>
		</Card>
	)
}
