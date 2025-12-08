import React from 'react'
import { List, Avatar, Badge, Tooltip, Empty, Typography } from 'antd'
import { UserOutlined, MessageOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

interface SidebarClient {
	id: string
	name: string
	avatarUrl?: string
	isFavorite: boolean
	unreadMessages: number
	hasNewReport: boolean
}

interface SidebarProps {
	clients: SidebarClient[]
}

export const TrainerSidebar: React.FC<SidebarProps> = ({ clients }) => {
	const navigate = useNavigate()

	const getPhotoUrl = (photo?: string) => {
		if (!photo) return undefined
		return photo.startsWith('http') ? photo : `http://localhost:3000${photo}`
	}

	// Переход в чат с клиентом
	const handleClientClick = (clientId: string) => {
		navigate(`/admin/chat/${clientId}`)
	}

	return (
		<>
			{/* Заголовок списка */}
			<div className='px-2 mb-4'>
				<Text strong className='text-base'>
					👥 Клиенты в работе
				</Text>
				{clients.length > 0 && (
					<Text type='secondary' className='ml-2'>
						({clients.length})
					</Text>
				)}
			</div>

			{/* Список клиентов */}
			{clients.length === 0 ? (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={
						<Text type='secondary' className='text-sm'>
							Нет клиентов
						</Text>
					}
				/>
			) : (
				<List
					className='space-y-1'
					dataSource={clients}
					renderItem={(client) => (
						<List.Item
							className='group hover:bg-blue-50 rounded-lg cursor-pointer px-3 py-2 transition'
							style={{ borderBottom: 'none', marginBottom: 4 }}
							onClick={() => handleClientClick(client.id)}
						>
							<div className='flex items-center gap-3 w-full'>
								{/* Аватар */}
								<Avatar
									src={getPhotoUrl(client.avatarUrl)}
									icon={<UserOutlined />}
									size={40}
								/>

								{/* Имя */}
								<div className='flex-1 min-w-0'>
									<span className='text-base font-medium block truncate'>
										{client.name}
									</span>
									{client.hasNewReport && (
										<Text type='success' className='text-xs'>
											📊 Новый отчёт
										</Text>
									)}
								</div>

								{/* Непрочитанные сообщения */}
								<div className='flex items-center gap-2'>
									{client.unreadMessages > 0 ? (
										<Badge
											count={client.unreadMessages}
											style={{ backgroundColor: 'var(--primary)' }}
										/>
									) : (
										<Tooltip title='Открыть чат'>
											<MessageOutlined
												className='text-gray-400 group-hover:text-blue-500 transition'
												style={{ fontSize: 16 }}
											/>
										</Tooltip>
									)}
								</div>
							</div>
						</List.Item>
					)}
				/>
			)}
		</>
	)
}
