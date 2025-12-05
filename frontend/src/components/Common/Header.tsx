import { Link } from 'react-router-dom'
import { Badge } from 'antd'
import { BellFilled, MessageOutlined } from '@ant-design/icons'
import { useAppSelector } from '../../store/hooks'

export type UserRole = 'client' | 'trainer'

interface HeaderProps {
	role: UserRole
	hasUnreadMessages?: boolean
}

export function Header({ role, hasUnreadMessages }: HeaderProps) {
	// Получаем количество непрочитанных сообщений из Redux
	const unreadCount = useAppSelector((state) => {
		const chatId = role === 'client' ? 'client_trainer' : 'trainer_client'
		return state.chat.unreadCount[chatId] || 0
	})

	// Для тренера считаем все непрочитанные от всех клиентов
	const totalUnreadForTrainer = useAppSelector((state) => {
		if (role !== 'trainer') return 0
		return Object.entries(state.chat.unreadCount)
			.filter(([key]) => key.startsWith('trainer_'))
			.reduce((sum, [, count]) => sum + count, 0)
	})

	const unreadMessages = role === 'client' ? unreadCount : totalUnreadForTrainer

	return (
		<header className='border-b border-muted background-light'>
			<div className='flex h-16 items-center justify-between px-6'>
				<nav className='flex items-center gap-6'>
					{role === 'client' ? (
						<>
							<Link
								to='/'
								className='text-sm font-medium text-custom hover-info-custom transition-colors'
							>
								Главная
							</Link>
							<Link
								to='/me/nutrition'
								className='text-sm font-medium text-custom hover-info-custom transition-colors'
							>
								Питание
							</Link>
							<Link
								to='/me/progress'
								className='text-sm font-medium text-custom hover-info-custom transition-colors'
							>
								Прогресс
							</Link>
						</>
					) : (
						<>
							<Link
								to='/admin'
								className='text-sm font-medium text-custom hover-info-custom transition-colors'
							>
								Главная
							</Link>
							<Link
								to='/admin/nutrition'
								className='text-sm font-medium text-custom hover-info-custom transition-colors'
							>
								Питание
							</Link>
						</>
					)}
				</nav>

				<nav className='flex items-center gap-6'>
					{role === 'client' && (
						<Link
							to='/trainer'
							className='text-sm font-medium text-custom hover-info-custom transition-colors flex items-center gap-2'
						>
							<Badge count={unreadMessages} size='small' offset={[2, -2]}>
								<span className='flex items-center gap-1'>
									<MessageOutlined className='text-base' />
									Тренер
								</span>
							</Badge>
						</Link>
					)}
					<Link
						to={role === 'client' ? '/me' : '/admin'}
						className='text-sm font-medium text-custom hover-info-custom transition-colors flex items-center gap-2'
					>
						Профиль
						{hasUnreadMessages ? (
							<Badge
								dot
								status='error'
								className='[&_.ant-badge-status-dot]:animate-pulse'
							>
								<BellFilled className='text-base text-red-500' />
							</Badge>
						) : (
							<span className='block w-[1em] h-[1em]' aria-hidden='true'></span>
						)}
					</Link>
				</nav>
			</div>
		</header>
	)
}
