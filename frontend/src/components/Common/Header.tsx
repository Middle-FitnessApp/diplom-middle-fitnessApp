import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Badge, Button, Dropdown, Avatar, Skeleton } from 'antd'
import type { MenuProps } from 'antd'
import {
	MessageOutlined,
	UserOutlined,
	LogoutOutlined,
	SettingOutlined,
	BellOutlined,
} from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { performLogout } from '../../store/slices/auth.slice'
import { setUnreadCount } from '../../store/slices/notifications.slice'
import { useGetMeQuery } from '../../store/api/user.api'
import { useGetUnreadCountQuery } from '../../store/api/notifications.api'
import { ThemeToggle } from './ThemeToggle'
import { getPhotoUrl } from '../../utils/buildPhotoUrl'
import { NotificationDropdown } from './NotificationDropdown'

export function Header() {
	const navigate = useNavigate()
	const location = useLocation()
	const dispatch = useAppDispatch()
	const themeState = useAppSelector((state) => state.ui.theme)

	// Проверяем есть ли токен в localStorage
	const token = useAppSelector((state) => state.auth.token)

	// Загружаем данные пользователя если есть токен
	const { data: meData, isLoading } = useGetMeQuery(undefined, {
		skip: !token,
	})

	// Синхронизируем количество непрочитанных уведомлений с сервером
	const { data: unreadData } = useGetUnreadCountQuery(undefined, {
		skip: !token,
	})

	// Обновляем unreadCount в store при получении данных с сервера
	useEffect(() => {
		if (unreadData?.unreadCount !== undefined) {
			dispatch(setUnreadCount(unreadData.unreadCount))
		}
	}, [unreadData?.unreadCount, dispatch])

	const storedUser = useAppSelector((state) => state.auth.user)
	// prefer fresh data from server when available (meData) to ensure latest photo is used
	const user = meData?.user ?? storedUser
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

	// Получаем количество непрочитанных уведомлений
	const unreadNotifications = useAppSelector((state) => state.notifications.unreadCount)

	// Проверка активности для специфичных путей
	const isProgressActive =
		location.pathname === '/me/progress' ||
		location.pathname === '/me/progress/new-report'
	const isReportsActive = location.pathname === '/me/progress/reports'
	const isTrainerChatActive = location.pathname === '/trainer'
	const isAdminActive = location.pathname === '/admin'
	const isNutritionTrainerActive = location.pathname.startsWith('/admin/nutrition')

	const handleLogout = async () => {
		await dispatch(performLogout())
		navigate('/login')
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

	// Динамические классы для текста в зависимости от темы
	const textPrimaryClass = 'link-primary'
	const textSecondaryClass = 'link-inactive'
	const textActiveClass = 'link-active'
	const headerBgClass = themeState === 'dark' ? 'bg-dark' : 'bg-light'
	const borderClass = 'border-muted'

	// Загрузка данных пользователя
	if (token && isLoading) {
		return (
			<header
				className={`border-b ${borderClass} ${headerBgClass} transition-colors duration-300`}
			>
				<div className='flex h-16 items-center justify-between px-6'>
					<Link
						to='/'
						className={`text-xl font-bold transition-colors ${textPrimaryClass}`}
					>
						Fitness App
					</Link>
					<div className='flex items-center gap-4'>
						<ThemeToggle />
						<Skeleton.Avatar active size={36} />
						<Skeleton.Input active size='small' style={{ width: 80 }} />
					</div>
				</div>
			</header>
		)
	}

	// Неавторизованный пользователь (нет токена или нет данных)
	if (!isAuthenticated) {
		return (
			<header
				className={`border-b ${borderClass} ${headerBgClass} transition-colors duration-300`}
			>
				<div className='flex h-16 items-center justify-between px-6'>
					<Link
						to='/'
						className={`text-xl font-bold transition-colors ${textPrimaryClass}`}
					>
						Fitness App
					</Link>
					<nav className='flex items-center gap-4'>
						<ThemeToggle />
						<Link
							to='/login'
							className={`text-sm font-medium transition-colors ${textSecondaryClass}`}
						>
							Войти
						</Link>
						<Button type='primary' onClick={() => navigate('/signup')}>
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
			<header
				className={`border-b ${borderClass} ${headerBgClass} transition-colors duration-300`}
			>
				<div className='flex h-16 items-center justify-between px-6'>
					<nav className='flex items-center gap-6 h-full'>
						<Link
							to='/'
							className={`text-xl font-bold transition-colors ${textPrimaryClass}`}
						>
							Fitness App
						</Link>
						<Link
							to='/'
							className={`relative text-sm transition-colors h-full flex items-center ${
								isHomeActive
									? `${textActiveClass} font-semibold`
									: `font-medium ${textSecondaryClass}`
							}`}
						>
							Главная
							{isHomeActive && (
								<span
									className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t'
									style={{ backgroundColor: 'var(--primary)' }}
								/>
							)}
						</Link>
						<Link
							to='/me/nutrition'
							className={`relative text-sm transition-colors h-full flex items-center ${
								isNutritionActive
									? `${textActiveClass} font-semibold`
									: `font-medium ${textSecondaryClass}`
							}`}
						>
							Питание
							{isNutritionActive && (
								<span
									className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t'
									style={{ backgroundColor: 'var(--primary)' }}
								/>
							)}
						</Link>
						<Link
							to='/me/progress'
							className={`relative text-sm transition-colors h-full flex items-center ${
								isProgressActive
									? `${textActiveClass} font-semibold`
									: `font-medium ${textSecondaryClass}`
							}`}
						>
							Прогресс
							{isProgressActive && (
								<span
									className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t'
									style={{ backgroundColor: 'var(--primary)' }}
								/>
							)}
						</Link>
						<Link
							to='/me/progress/reports'
							className={`relative text-sm transition-colors h-full flex items-center ${
								isReportsActive
									? `${textActiveClass} font-semibold`
									: `font-medium ${textSecondaryClass}`
							}`}
						>
							Отчёты
							{isReportsActive && (
								<span
									className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t'
									style={{ backgroundColor: 'var(--primary)' }}
								/>
							)}
						</Link>
					</nav>

					<nav className='flex items-center gap-4 h-full'>
						<ThemeToggle />

						{/* Уведомления */}
						<Link
							to='/me/notifications'
							className={`relative flex items-center gap-2 text-sm transition-colors h-full ${
								location.pathname === '/me/notifications'
									? `${textActiveClass} font-semibold`
									: `font-medium ${textSecondaryClass}`
							}`}
						>
							<Badge count={unreadNotifications} size='small' offset={[2, -2]}>
								<BellOutlined className='text-lg' />
							</Badge>
							<span>Уведомления</span>
							{location.pathname === '/me/notifications' && (
								<span
									className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t'
									style={{ backgroundColor: 'var(--primary)' }}
								/>
							)}
						</Link>

						{/* Чат с тренером - показываем только если есть тренер */}
						{hasTrainer && (
							<Link
								to='/trainer'
								className={`relative flex items-center gap-2 text-sm transition-colors h-full ${
									isTrainerChatActive
										? `${textActiveClass} font-semibold`
										: `font-medium ${textSecondaryClass}`
								}`}
							>
								<Badge count={unreadMessages} size='small' offset={[2, -2]}>
									<MessageOutlined className='text-lg' />
								</Badge>
								<span>Чат с тренером</span>
								{isTrainerChatActive && (
									<span
										className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t'
										style={{ backgroundColor: 'var(--primary)' }}
									/>
								)}
							</Link>
						)}

						{/* Профиль с выпадающим меню */}
						<Dropdown menu={{ items: profileMenuItems }} placement='bottomRight'>
							<div className='flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity'>
								<Avatar
									size={36}
									src={getPhotoUrl(user?.photo) || undefined}
									icon={<UserOutlined />}
									style={{ border: '2px solid var(--primary)' }}
								/>
								<span
									className={`text-sm font-medium hidden sm:inline ${textSecondaryClass}`}
								>
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
		<header
			className={`border-b ${borderClass} ${headerBgClass} transition-colors duration-300`}
		>
			<div className='flex h-16 items-center justify-between px-6'>
				<nav className='flex items-center gap-6 h-full'>
					<Link
						to='/admin'
						className={`text-xl font-bold transition-colors ${textPrimaryClass}`}
					>
						Fitness App
					</Link>
					<Link
						to='/admin'
						className={`relative text-sm transition-colors h-full flex items-center ${
							isAdminActive
								? `${textActiveClass} font-semibold`
								: `font-medium ${textSecondaryClass}`
						}`}
					>
						Панель тренера
						{isAdminActive && (
							<span
								className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t'
								style={{ backgroundColor: 'var(--primary)' }}
							/>
						)}
					</Link>
					<Link
						to='/admin/nutrition'
						className={`relative text-sm transition-colors h-full flex items-center ${
							isNutritionTrainerActive
								? `${textActiveClass} font-semibold`
								: `font-medium ${textSecondaryClass}`
						}`}
					>
						Планы питания
						{isNutritionTrainerActive && (
							<span
								className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t'
								style={{ backgroundColor: 'var(--primary)' }}
							/>
						)}
					</Link>
				</nav>

				<nav className='flex items-center gap-4'>
					<ThemeToggle />

					{/* Уведомления о сообщениях */}
					{totalUnreadForTrainer > 0 && (
						<Badge count={totalUnreadForTrainer} size='small'>
							<MessageOutlined className={`text-lg ${textSecondaryClass}`} />
						</Badge>
					)}

					<NotificationDropdown />

					{/* Профиль с выпадающим меню */}
					<Dropdown menu={{ items: profileMenuItems }} placement='bottomRight'>
						<div className='flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity'>
							<Avatar
								size={36}
								src={getPhotoUrl(user.photo)}
								icon={<UserOutlined />}
								style={{ border: '2px solid var(--primary)' }}
							/>
							<span
								className={`text-sm font-medium hidden sm:inline ${textSecondaryClass}`}
							>
								{user.name}
							</span>
						</div>
					</Dropdown>
				</nav>
			</div>
		</header>
	)
}
