import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Badge, Button, Dropdown, Avatar, Skeleton } from 'antd'
import type { MenuProps } from 'antd'
import { MessageOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { performLogout } from '../../store/slices/auth.slice'
import { useGetMeQuery } from '../../store/api/user.api'

export function Header() {
	const navigate = useNavigate()
	const location = useLocation()
	const dispatch = useAppDispatch()
	
	// Проверяем есть ли токен в localStorage
	const token = useAppSelector((state) => state.auth.token)
	
	// Загружаем данные пользователя если есть токен
	const { data: meData, isLoading } = useGetMeQuery(undefined, {
		skip: !token,
	})
	
	const user = meData?.user
	const isAuthenticated = !!token && !!user

	// Получаем количество непрочитанных сообщений из Redux
	const unreadCount = useAppSelector((state) => {
		if (!user) return 0
		const chatId = user.role === 'CLIENT' ? 'client_trainer' : 'trainer_client'
		return state.chat.unreadCount[chatId] || 0
	})

	// Для тренера считаем все непрочитанные от всех клиентов
	const totalUnreadForTrainer = useAppSelector((state) => {
		if (user?.role !== 'TRAINER') return 0
		return Object.entries(state.chat.unreadCount)
			.filter(([key]) => key.startsWith('trainer_'))
			.reduce((sum, [, count]) => sum + count, 0)
	})

	const unreadMessages = user?.role === 'CLIENT' ? unreadCount : totalUnreadForTrainer

	// Проверка активности для специфичных путей
	const isProgressActive = location.pathname === '/me/progress' || location.pathname === '/me/progress/new-report'
	const isReportsActive = location.pathname === '/me/progress/reports'
	const isTrainerChatActive = location.pathname === '/trainer'
	const isAdminActive = location.pathname === '/admin'
	const isNutritionTrainerActive = location.pathname.startsWith('/admin/nutrition')

	const handleLogout = async () => {
		await dispatch(performLogout())
		navigate('/login')
	}

	const getPhotoUrl = (photo?: string | null) => {
		if (!photo) return undefined
		return photo.startsWith('http') ? photo : `http://localhost:3000${photo}`
	}

	// Меню профиля
	const profileMenuItems: MenuProps['items'] = [
		{
			key: 'profile',
			icon: <SettingOutlined />,
			label: 'Мой профиль',
			onClick: () => navigate(user?.role === 'CLIENT' ? '/me' : '/admin'),
		},
		{
			type: 'divider',
		},
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: 'Выйти',
			danger: true,
			onClick: handleLogout,
		},
	]

	// Загрузка данных пользователя
	if (token && isLoading) {
		return (
			<header className="border-b border-muted background-light">
				<div className="flex h-16 items-center justify-between px-6">
					<Link to="/" className="text-xl font-bold text-gray-800">
						Fitness App
					</Link>
					<div className="flex items-center gap-4">
						<Skeleton.Avatar active size={36} />
						<Skeleton.Input active size="small" style={{ width: 80 }} />
					</div>
				</div>
			</header>
		)
	}

	// Неавторизованный пользователь (нет токена или нет данных)
	if (!isAuthenticated) {
		return (
			<header className="border-b border-muted background-light">
				<div className="flex h-16 items-center justify-between px-6">
					<Link to="/" className="text-xl font-bold text-gray-800">
						Fitness App
					</Link>
					<nav className="flex items-center gap-4">
						<Link
							to="/login"
							className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
						>
							Войти
						</Link>
						<Button type="primary" onClick={() => navigate('/signup')}>
							Регистрация
						</Button>
					</nav>
				</div>
			</header>
		)
	}

	// Клиент
	if (user.role === 'CLIENT') {
		const hasTrainer = !!user.trainer
		const isHomeActive = location.pathname === '/'
		const isNutritionActive = location.pathname.startsWith('/me/nutrition')

		return (
			<header className="border-b border-muted background-light">
				<div className="flex h-16 items-center justify-between px-6">
					<nav className="flex items-center gap-6 h-full">
						<Link
							to="/"
							className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
						>
							Fitness App
						</Link>
						<Link
							to="/"
							className="relative text-sm font-medium transition-colors h-full flex items-center"
							style={{
								color: isHomeActive ? '#2563eb' : '#4b5563',
								fontWeight: isHomeActive ? 600 : 500,
							}}
						>
							Главная
							{isHomeActive && (
								<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t" />
							)}
						</Link>
						<Link
							to="/me/nutrition"
							className="relative text-sm font-medium transition-colors h-full flex items-center"
							style={{
								color: isNutritionActive ? '#2563eb' : '#4b5563',
								fontWeight: isNutritionActive ? 600 : 500,
							}}
						>
							Питание
							{isNutritionActive && (
								<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t" />
							)}
						</Link>
						<Link
							to="/me/progress"
							className="relative text-sm font-medium transition-colors h-full flex items-center"
							style={{
								color: isProgressActive ? '#2563eb' : '#4b5563',
								fontWeight: isProgressActive ? 600 : 500,
							}}
						>
							Прогресс
							{isProgressActive && (
								<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t" />
							)}
						</Link>
						<Link
							to="/me/progress/reports"
							className="relative text-sm font-medium transition-colors h-full flex items-center"
							style={{
								color: isReportsActive ? '#2563eb' : '#4b5563',
								fontWeight: isReportsActive ? 600 : 500,
							}}
						>
							Отчёты
							{isReportsActive && (
								<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t" />
							)}
						</Link>
					</nav>

					<nav className="flex items-center gap-4 h-full">
						{/* Чат с тренером - показываем только если есть тренер */}
						{hasTrainer && (
							<Link
								to="/trainer"
								className="relative flex items-center gap-2 text-sm font-medium transition-colors h-full"
								style={{
									color: isTrainerChatActive ? '#2563eb' : '#4b5563',
									fontWeight: isTrainerChatActive ? 600 : 500,
								}}
							>
								<Badge count={unreadMessages} size="small" offset={[2, -2]}>
									<MessageOutlined className="text-lg" />
								</Badge>
								<span>Чат с тренером</span>
								{isTrainerChatActive && (
									<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t" />
								)}
							</Link>
						)}

						{/* Профиль с выпадающим меню */}
						<Dropdown menu={{ items: profileMenuItems }} placement="bottomRight">
							<div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
								<Avatar
									size={36}
									src={getPhotoUrl(user.photo)}
									icon={<UserOutlined />}
									style={{ border: '2px solid var(--primary)' }}
								/>
								<span className="text-sm font-medium text-gray-700 hidden sm:inline">
									{user.name}
								</span>
							</div>
						</Dropdown>
					</nav>
				</div>
			</header>
		)
	}

	// Тренер
	return (
		<header className="border-b border-muted background-light">
			<div className="flex h-16 items-center justify-between px-6">
				<nav className="flex items-center gap-6 h-full">
					<Link
						to="/admin"
						className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
					>
						Fitness App
					</Link>
					<Link
						to="/admin"
						className="relative text-sm font-medium transition-colors h-full flex items-center"
						style={{
							color: isAdminActive ? '#2563eb' : '#4b5563',
							fontWeight: isAdminActive ? 600 : 500,
						}}
					>
						Панель тренера
						{isAdminActive && (
							<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t" />
						)}
					</Link>
					<Link
						to="/admin/nutrition"
						className="relative text-sm font-medium transition-colors h-full flex items-center"
						style={{
							color: isNutritionTrainerActive ? '#2563eb' : '#4b5563',
							fontWeight: isNutritionTrainerActive ? 600 : 500,
						}}
					>
						Планы питания
						{isNutritionTrainerActive && (
							<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t" />
						)}
					</Link>
				</nav>

				<nav className="flex items-center gap-4">
					{/* Уведомления о сообщениях */}
					{totalUnreadForTrainer > 0 && (
						<Badge count={totalUnreadForTrainer} size="small">
							<MessageOutlined className="text-lg text-gray-600" />
						</Badge>
					)}

					{/* Профиль с выпадающим меню */}
					<Dropdown menu={{ items: profileMenuItems }} placement="bottomRight">
						<div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
							<Avatar
								size={36}
								src={getPhotoUrl(user.photo)}
								icon={<UserOutlined />}
								style={{ border: '2px solid var(--primary)' }}
							/>
							<span className="text-sm font-medium text-gray-700 hidden sm:inline">
								{user.name}
							</span>
						</div>
					</Dropdown>
				</nav>
			</div>
		</header>
	)
}
