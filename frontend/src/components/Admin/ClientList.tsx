import React from 'react'
import { Card, Avatar, List, Tooltip, Button, Empty, Typography } from 'antd'
import { StarFilled, StarOutlined, UserOutlined, MessageOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ClientInTrainerProfile } from '../../types'

const { Text } = Typography

interface ClientListProps {
	title: string
	clients: ClientInTrainerProfile[]
	starIcon: 'filled' | 'outlined'
	onToggleStar: (clientId: string) => void
}

export const ClientList: React.FC<ClientListProps> = ({
	title,
	clients,
	starIcon,
	onToggleStar,
}) => {
	const navigate = useNavigate()

	const getPhotoUrl = (photo?: string) => {
		if (!photo) return undefined
		return photo.startsWith('http') ? photo : `http://localhost:3000${photo}`
	}

	// Переход в профиль клиента
	const handleViewProfile = (clientId: string) => {
		navigate(`/admin/client/${clientId}`)
	}

	// Переход в чат с клиентом
	const handleOpenChat = (clientId: string) => {
		navigate(`/admin/chat/${clientId}`)
	}

	return (
		<Card
			title={<span className='text-lg font-semibold tracking-tight'>{title}</span>}
			className='shadow-lg'
			styles={{ body: { padding: '18px 14px 10px 14px', background: 'var(--bg-light)' } }}
		>
			{clients.length === 0 ? (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<Text type='secondary'>Нет клиентов</Text>}
				/>
			) : (
				<List
					itemLayout='horizontal'
					dataSource={clients}
					renderItem={(client) => (
						<List.Item
							className='hover:bg-blue-50 rounded-lg px-3 py-2 transition'
							style={{ borderBottom: '1px solid var(--border)' }}
						>
							<div className='flex items-center gap-3 w-full'>
								{/* Аватар */}
								<Avatar
									src={getPhotoUrl(client.avatarUrl)}
									icon={<UserOutlined />}
									size={44}
									style={{ border: '2px solid var(--border)' }}
								/>

								{/* Информация о клиенте */}
								<div className='flex-1 min-w-0'>
									<Text strong className='block truncate'>
										{client.name}
									</Text>
									{client.hasNewReport && (
										<Text
											type='success'
											className='text-xs'
											style={{ color: 'var(--success)' }}
										>
											📊 Новый отчёт
										</Text>
									)}
								</div>

								{/* Действия */}
								<div className='flex items-center gap-2'>
									{/* Просмотр профиля */}
									<Tooltip title='Профиль клиента'>
										<Button
											type='text'
											size='small'
											icon={<EyeOutlined />}
											onClick={() => handleViewProfile(client.id)}
										/>
									</Tooltip>

									{/* Чат */}
									<Tooltip title='Открыть чат'>
										<Button
											type='text'
											size='small'
											icon={<MessageOutlined />}
											onClick={() => handleOpenChat(client.id)}
										/>
									</Tooltip>

									{/* Звёздочка */}
									<Tooltip
										title={
											client.isFavorite
												? 'Убрать из избранных'
												: 'Добавить в избранное'
										}
									>
										<Button
											type='text'
											size='small'
											icon={
												starIcon === 'filled' && client.isFavorite ? (
													<StarFilled style={{ color: 'var(--warning)' }} />
												) : (
													<StarOutlined />
												)
											}
											onClick={() => onToggleStar(client.id)}
										/>
									</Tooltip>
								</div>
							</div>
						</List.Item>
					)}
				/>
			)}
		</Card>
	)
}
