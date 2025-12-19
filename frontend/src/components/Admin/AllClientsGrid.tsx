import React, { useState } from 'react'
import {
	Card,
	Avatar,
	Button,
	Tooltip,
	Tag,
	Typography,
	Space,
	Empty,
	Input,
	Pagination,
	Row,
	Col,
	Spin,
} from 'antd'
import {
	UserOutlined,
	StarFilled,
	StarOutlined,
	MessageOutlined,
	EyeOutlined,
	PhoneOutlined,
	MailOutlined,
	CalendarOutlined,
	SearchOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	CloseCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
	useGetAllClientsQuery,
	useToggleClientStarMutation,
} from '../../store/api/trainer.api'
import type { AllSystemClient } from '../../store/api/trainer.api'
import { useAppSelector } from '../../store/hooks'

const { Text, Title } = Typography

const API_URL = 'http://localhost:3000'

interface AllClientsGridProps {
	isSidebarCollapsed?: boolean
}

export const AllClientsGrid: React.FC<AllClientsGridProps> = () => {
	const navigate = useNavigate()
	const [searchValue, setSearchValue] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize] = useState(12)

	const { data, isLoading, isFetching } = useGetAllClientsQuery({
		search: searchValue || undefined,
		page: currentPage,
		limit: pageSize,
	})

	const [toggleStarMutation] = useToggleClientStarMutation()

	const clients = data?.clients || []
	const pagination = data?.pagination

	const theme = useAppSelector((state) => state.ui.theme)
	const isDark = theme === 'dark'

	const getPhotoUrl = (photo?: string | null) => {
		if (!photo) return `${API_URL}/uploads/default/user.png`
		return photo.startsWith('http') ? photo : `${API_URL}${photo}`
	}

	const handleViewProfile = (clientId: string) => {
		navigate(`/admin/client/${clientId}`)
	}

	const handleOpenChat = (clientId: string) => {
		navigate(`/admin/chat/${clientId}`)
	}

	const handleToggleStar = async (clientId: string) => {
		try {
			await toggleStarMutation({ clientId }).unwrap()
		} catch (error) {
			console.error('Ошибка переключения избранного:', error)
		}
	}

	const handleSearch = (value: string) => {
		setSearchValue(value)
		setCurrentPage(1)
	}

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
	}

	const getStatusTag = (
		status: AllSystemClient['relationshipStatus'],
		isDark: boolean,
	) => {
		const bgMuted = isDark ? '#2a2f39' : '#f5f5f5'
		const textMuted = isDark ? '#b0b7c3' : '#8c8c8c'
		const border = isDark ? '#424858' : '#d9d9d9'

		switch (status) {
			case 'ACCEPTED':
				return (
					<Tag
						icon={<CheckCircleOutlined />}
						style={{
							background: 'var(--success)',
							borderColor: 'var(--success)',
							color: '#fff',
							fontWeight: 600,
						}}
					>
						В работе
					</Tag>
				)
			case 'PENDING':
				return (
					<Tag
						icon={<ClockCircleOutlined />}
						style={{
							background: 'var(--primary)',
							borderColor: 'var(--primary)',
							color: '#fff',
							fontWeight: 600,
						}}
					>
						Ожидает
					</Tag>
				)
			case 'REJECTED':
				return (
					<Tag
						icon={<CloseCircleOutlined />}
						style={{
							background: 'var(--error)',
							borderColor: 'var(--error)',
							color: '#fff',
							fontWeight: 600,
						}}
					>
						Отклонён
					</Tag>
				)
			case null:
			default:
				return (
					<Tag
						icon={<UserOutlined />}
						style={{
							background: bgMuted,
							borderColor: border,
							color: textMuted,
							fontWeight: 500,
						}}
					>
						Свободен
					</Tag>
				)
		}
	}

	const renderClientCard = (client: AllSystemClient) => {
		const isWorking = client.relationshipStatus === 'ACCEPTED'
		const isFreeClient = client.relationshipStatus === null
		const shouldUseWhiteName = !isDark && isFreeClient
		return (
			<Card
				key={client.id}
				className='shadow-md hover:shadow-xl transition-all'
				style={{
					borderRadius: '16px',
					overflow: 'hidden',
					opacity: client.relationshipStatus === 'REJECTED' ? 0.7 : 1,
				}}
				styles={{
					body: { padding: 0 },
				}}
			>
				{/* Header с градиентом */}
				<div
					className='p-4 relative'
					style={{
						background: isWorking
							? 'linear-gradient(135deg, #40ed7a76 0%, #38f9d7 100%)'
							: client.relationshipStatus === 'PENDING'
							? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
							: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					}}
				>
					<div className='flex items-start gap-4'>
						<Avatar
							src={getPhotoUrl(client.photo)}
							icon={<UserOutlined />}
							size={64}
							style={{
								border: '3px solid rgba(255,255,255,0.9)',
								boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
							}}
						/>

						<div className='flex flex-col' style={{ minWidth: 0 }}>
							<Text
								strong
								className='text-white text-base truncate'
								style={{
									textShadow: '0 1px 2px rgba(0,0,0,0.2)',
									color: shouldUseWhiteName ? '#ffffff' : undefined,
								}}
							>
								{client.name}
							</Text>

							<div className='mt-1'>
								{getStatusTag(client.relationshipStatus, isDark)}
							</div>

							{client.age && (
								<div className='mt-2'>
									<Tag
										icon={<CalendarOutlined />}
										style={{
											background: 'rgba(255,255,255,0.2)',
											border: 'none',
											color: '#fff',
											margin: 0,
										}}
									>
										{client.age} лет
									</Tag>
								</div>
							)}
						</div>

						{isWorking && (
							<Tooltip title={client.isFavorite ? 'Убрать из избранных' : 'В избранное'}>
								<Button
									type='text'
									size='large'
									icon={
										client.isFavorite ? (
											<StarFilled style={{ color: '#ffd700', fontSize: 20 }} />
										) : (
											<StarOutlined style={{ color: '#fff', fontSize: 20 }} />
										)
									}
									onClick={(e) => {
										e.stopPropagation()
										handleToggleStar(client.id)
									}}
									style={{ background: 'rgba(255,255,255,0.15)' }}
								/>
							</Tooltip>
						)}
					</div>
				</div>

				{/* Body */}
				<div className='p-4'>
					{/* Контактная информация */}
					<div className='space-y-2 mb-4'>
						{client.email && (
							<div className='flex items-center gap-2 text-sm'>
								<MailOutlined style={{ color: 'var(--primary)' }} />
								<a
									href={`mailto:${client.email}`}
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
									href={`tel:${client.phone.replace(/[^+\d]/g, '')}`}
									className={
										isDark
											? 'text-xs text-slate-300 hover:text-white'
											: 'text-xs text-green-600 hover:text-green-800'
									}
									style={{ textDecoration: 'underline', cursor: 'pointer' }}
								>
									{client.phone}
								</a>
							</div>
						)}
						{client.goal && (
							<div
								className={
									isDark ? 'text-xs text-slate-300' : 'text-xs text-gray-500 truncate'
								}
							>
								Цель: {client.goal}
							</div>
						)}
					</div>

					{/* Действия */}
					{isWorking ? (
						<Space wrap className='w-full'>
							<Button
								type='primary'
								icon={<EyeOutlined />}
								onClick={() => handleViewProfile(client.id)}
								style={{ borderRadius: '8px' }}
								size='small'
							>
								Профиль
							</Button>
							<Button
								icon={<MessageOutlined />}
								onClick={() => handleOpenChat(client.id)}
								style={{ borderRadius: '8px' }}
								size='small'
							>
								Чат
							</Button>
						</Space>
					) : (
						<Text className={isDark ? 'text-xs text-slate-300' : 'text-xs'}>
							{client.relationshipStatus === 'PENDING'
								? 'Заявка на рассмотрении'
								: client.relationshipStatus === 'REJECTED'
								? 'Заявка отклонена'
								: 'Клиент свободен — можно отправить приглашение'}
						</Text>
					)}
				</div>
			</Card>
		)
	}

	return (
		<div className='pb-4 flex flex-col h-full'>
			{/* Header */}
			<div className='flex flex-wrap items-center justify-between mb-6 '>
				<Title level={4} className='mb-0!' style={{ color: 'var(--text)' }}>
					👥 Все клиенты системы
					{pagination && (
						<Text type='secondary' className='ml-2 text-base font-normal'>
							({pagination.total})
						</Text>
					)}
				</Title>

				<Input
					placeholder='Поиск по имени...'
					prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
					value={searchValue}
					onChange={(e) => handleSearch(e.target.value)}
					style={{ width: 250, borderRadius: '8px' }}
					allowClear
				/>
			</div>

			{/* Grid */}
			{isLoading ? (
				<div className='flex justify-center items-center h-full'>
					<Spin size='large' />
				</div>
			) : clients.length === 0 ? (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={
						<Text type='secondary'>
							{searchValue ? 'Клиенты не найдены' : 'Нет клиентов в системе'}
						</Text>
					}
					className='py-8'
				/>
			) : (
				<>
					<Spin spinning={isFetching}>
						<Row gutter={[24, 24]}>
							{clients.map((client) => (
								<Col key={client.id} xs={24} sm={12} lg={8} xl={6}>
									{renderClientCard(client)}
								</Col>
							))}
						</Row>
					</Spin>

					{/* Pagination */}
					{pagination && pagination.totalPages > 1 && (
						<div className='flex justify-center pt-4 z-10'>
							<Pagination
								current={currentPage}
								total={pagination.total}
								pageSize={pageSize}
								onChange={handlePageChange}
								showSizeChanger={false}
								showTotal={(total, range) =>
									`${range[0]}-${range[1]} из ${total} клиентов`
								}
							/>
						</div>
					)}
				</>
			)}
		</div>
	)
}
