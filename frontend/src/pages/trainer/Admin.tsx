import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../../store'
import { Layout, Button, Typography, Spin, message, Tabs, Row, Col } from 'antd'
import { MenuOutlined, ReloadOutlined } from '@ant-design/icons'
import {
	ClientsGrid,
	TrainerInfo,
	TrainerSidebar,
	InvitesList,
	StatsOverview,
	RecentActivity,
	AllClientsGrid,
} from '../../components/Admin'
import {
	useGetClientsQuery,
	useGetInvitesQuery,
	useAcceptInviteMutation,
	useRejectInviteMutation,
	useToggleClientStarMutation,
	useGetTrainerStatsQuery,
} from '../../store/api/trainer.api'
import { useGetMeQuery } from '../../store/api/user.api'
import { userApi } from '../../store/api/user.api'
import { toggleSidebar } from '../../store/slices/ui.slice'
import { useThemeClasses } from '../../store/hooks'

const { Title, Text } = Typography
const { Content, Sider } = Layout

export const Admin: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>()
	const [acceptingId, setAcceptingId] = useState<string | null>(null)
	const [rejectingId, setRejectingId] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState('overview')
	const classes = useThemeClasses()

	// текущий пользователь (для проверки загрузки)
	const { data: meData, isLoading: isLoadingMe } = useGetMeQuery()
	const trainerId = meData?.user.id

	// клиенты тренера с сервера (только ACCEPTED)
	const {
		data: clients = [],
		isLoading: isLoadingClients,
		isError: isClientsError,
		refetch: refetchClients,
	} = useGetClientsQuery()

	// приглашения (PENDING)
	const {
		data: invitesData,
		isLoading: isLoadingInvites,
		refetch: refetchInvites,
	} = useGetInvitesQuery({ status: 'PENDING' })

	// статистика тренера
	const { data: stats, refetch: refetchStats } = useGetTrainerStatsQuery()

	const invites = invitesData?.invites || []

	// Мутации
	const [toggleStarMutation] = useToggleClientStarMutation()
	const [acceptInvite] = useAcceptInviteMutation()
	const [rejectInvite] = useRejectInviteMutation()

	const sidebarCollapsed = useSelector(
		(state: RootState) => state.ui.isSidebarOpen === false,
	)

	const handleToggleSidebar = () => dispatch(toggleSidebar())

	const handleToggleStar = async (clientId: string) => {
		try {
			await toggleStarMutation({ clientId }).unwrap()
		} catch (error) {
			console.error('Ошибка переключения isFavorite:', error)
			message.error('Не удалось изменить статус избранного')
		}
	}

	// Принять приглашение
	const handleAcceptInvite = async (inviteId: string) => {
		setAcceptingId(inviteId)
		try {
			const result = await acceptInvite({ inviteId }).unwrap()
			message.success(result.message)
			// Инвалидируем кэш данных пользователя, чтобы обновить статус
			dispatch(userApi.util.invalidateTags(['User']))
			refetchStats()
		} catch (error) {
			const apiError = error as {
				data?: { message?: string; error?: { message?: string } }
			}
			const errorMessage =
				apiError?.data?.message ||
				apiError?.data?.error?.message ||
				'Не удалось принять клиента'
			message.error(errorMessage)
		} finally {
			setAcceptingId(null)
		}
	}

	// Отклонить приглашение
	const handleRejectInvite = async (inviteId: string) => {
		setRejectingId(inviteId)
		try {
			const result = await rejectInvite({ inviteId }).unwrap()
			message.success(result.message)
			// Инвалидируем кэш данных пользователя, чтобы обновить статус
			dispatch(userApi.util.invalidateTags(['User']))
			refetchStats()
		} catch (error) {
			const apiError = error as {
				data?: { message?: string; error?: { message?: string } }
			}
			const errorMessage =
				apiError?.data?.message ||
				apiError?.data?.error?.message ||
				'Не удалось отклонить приглашение'
			message.error(errorMessage)
		} finally {
			setRejectingId(null)
		}
	}

	// Обновить все данные
	const handleRefresh = () => {
		refetchClients()
		refetchInvites()
		refetchStats()
		message.success('Данные обновлены')
	}

	// Разделяем: клиенты в работе (accepted) и избранные (подмножество)
	const { workingClients, favoriteClients, sidebarClients } = useMemo(() => {
		const withStarFlag = clients.map((client) => ({
			...client,
			isFavorite: Boolean(client.isFavorite),
		}))

		const favorites = withStarFlag.filter((c) => c.isFavorite)
		const working = withStarFlag // все ACCEPTED

		return {
			workingClients: working,
			favoriteClients: favorites,
			sidebarClients: working,
		}
	}, [clients])

	// загрузка
	if (isLoadingMe || isLoadingClients) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Spin size='large' />
			</div>
		)
	}

	// ошибка API
	if (isClientsError) {
		return (
			<div className='p-6 text-red-500 text-center'>
				Не удалось загрузить клиентов тренера
			</div>
		)
	}

	// нет тренера
	if (!trainerId) {
		return (
			<div className='p-6 text-red-500 text-center'>Не удалось определить тренера</div>
		)
	}

	const tabItems = [
		{
			key: 'overview',
			label: '📊 Обзор',
			children: (
				<div>
					{/* Статистика */}
					<StatsOverview
						totalClients={stats?.acceptedClients || workingClients.length}
						favoriteClients={stats?.favoriteClients || favoriteClients.length}
						pendingInvites={stats?.pendingInvites || invites.length}
						activeNutritionPlans={stats?.nutritionPlans || 0}
					/>

					<Row gutter={[24, 24]}>
						{/* Заявки */}
						<Col xs={24} lg={16}>
							<InvitesList
								invites={invites}
								loading={isLoadingInvites}
								onAccept={handleAcceptInvite}
								onReject={handleRejectInvite}
								acceptingId={acceptingId}
								rejectingId={rejectingId}
							/>
						</Col>

						{/* Недавняя активность */}
						<Col xs={24} lg={8}>
							<RecentActivity
								invites={invites}
								acceptedClients={workingClients.slice(0, 5)}
							/>
						</Col>
					</Row>

					{/* Избранные клиенты */}
					{favoriteClients.length > 0 && (
						<div className='mt-8'>
							<ClientsGrid
								title='⭐ Избранные клиенты'
								clients={favoriteClients}
								onToggleStar={handleToggleStar}
								emptyText='Нет избранных клиентов'
							/>
						</div>
					)}
				</div>
			),
		},
		{
			key: 'my-clients',
			label: `🤝 Мои клиенты (${workingClients.length})`,
			children: (
				<ClientsGrid
					title='🤝 Клиенты в работе'
					clients={workingClients}
					onToggleStar={handleToggleStar}
					showSearch
					emptyText='Нет клиентов в работе. Примите заявки от клиентов, чтобы начать работу.'
				/>
			),
		},
		{
			key: 'all-clients',
			label: '👥 Все клиенты',
			children: (
				<div id='clients-section'>
					<AllClientsGrid />
				</div>
			),
		},
		{
			key: 'favorites',
			label: `⭐ Избранные (${favoriteClients.length})`,
			children: (
				<ClientsGrid
					title='⭐ Избранные клиенты'
					clients={favoriteClients}
					onToggleStar={handleToggleStar}
					emptyText='Нет избранных клиентов. Отметьте звёздочкой клиентов, с которыми работаете чаще всего.'
				/>
			),
		},
		{
			key: 'invites',
			label: (
				<span>
					📨 Заявки{' '}
					{invites.length > 0 && (
						<span
							className='ml-1 px-2 py-0.5 rounded-full text-xs'
							style={{
								background: 'var(--primary)',
								color: '#fff',
							}}
						>
							{invites.length}
						</span>
					)}
				</span>
			),
			children: (
				<InvitesList
					invites={invites}
					loading={isLoadingInvites}
					onAccept={handleAcceptInvite}
					onReject={handleRejectInvite}
					acceptingId={acceptingId}
					rejectingId={rejectingId}
				/>
			),
		},
		{
			key: 'profile',
			label: '👤 Мой профиль',
			children: (
				<div id='trainer-info'>
					<TrainerInfo />
				</div>
			),
		},
	]

	return (
			<Layout className={`min-h-screen overflow-hidden bg-transparent`}>
				<Sider
					width={sidebarCollapsed ? 80 : 300}
					collapsed={sidebarCollapsed}
					className={`${classes.border} border-r  shadow-md h-screen overflow-y-auto`}
				>
					<div className={`p-4 border-b ${classes.border}`}>
						<Button
							type='text'
							icon={<MenuOutlined style={{ fontSize: 18 }} />}
							onClick={handleToggleSidebar}
							className='w-full flex items-center justify-center'
						>
							{!sidebarCollapsed && <span className='ml-2'>Свернуть</span>}
						</Button>
					</div>

					{!sidebarCollapsed && (
						<div className={`p-4`}>
							<TrainerSidebar clients={sidebarClients} />
						</div>
					)}
				</Sider>

				<Content className='h-screen overflow-y-auto bg-transparent! p-0!'>
					<div className='bg-light p-10 shadow-xl w-full min-h-full'>
						{/* Header */}
						<div className='flex items-center justify-between mb-6'>
							<div className='text-left'>
								<Title level={2} className={`${classes.title} font-semibold mb-0 pb-3 border-b-3 border-primary inline-block`}>
									🏢 Панель тренера
								</Title>
								<Text type='secondary' className='block mt-1'>
									Управляйте клиентами и планами питания
								</Text>
							</div>
							<Button
								icon={<ReloadOutlined />}
								onClick={handleRefresh}
								style={{ borderRadius: '8px' }}
							>
								Обновить
							</Button>
						</div>

						{/* Tabs */}
						<Tabs
							activeKey={activeTab}
							onChange={setActiveTab}
							items={tabItems}
							size='large'
							style={{ marginTop: '16px' }}
						/>
					</div>
				</Content>
			</Layout>
	)
}
