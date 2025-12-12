import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
	ReloadOutlined,
	LoginOutlined,
	HomeOutlined,
	WifiOutlined,
} from '@ant-design/icons'
import { type RTKQueryError, type ErrorType, parseError } from '../../utils/errors'

interface ApiErrorStateProps {
	/** Ошибка от RTK Query */
	error: RTKQueryError
	/** Callback для повторной попытки */
	onRetry?: () => void
	/** Показывать кнопку повтора */
	showRetry?: boolean
	/** Кастомный заголовок */
	title?: string
	/** Кастомное сообщение */
	message?: string
	/** Минимальная высота контейнера */
	minHeight?: string
	/** Показывать в карточке */
	inCard?: boolean
}

/**
 * Конфигурация отображения для разных типов ошибок
 */
const ERROR_CONFIG: Record<
	ErrorType,
	{
		status: 'error' | 'warning' | '403' | '404' | '500'
		title: string
		icon?: React.ReactNode
	}
> = {
	validation: {
		status: 'warning',
		title: 'Ошибка валидации',
	},
	auth: {
		status: '403',
		title: 'Требуется авторизация',
	},
	permission: {
		status: '403',
		title: 'Доступ запрещён',
	},
	not_found: {
		status: '404',
		title: 'Не найдено',
	},
	conflict: {
		status: 'warning',
		title: 'Конфликт данных',
	},
	network: {
		status: 'error',
		title: 'Ошибка сети',
		icon: <WifiOutlined />,
	},
	server: {
		status: '500',
		title: 'Ошибка сервера',
	},
	unknown: {
		status: 'error',
		title: 'Ошибка',
	},
}

/**
 * Универсальный компонент для отображения состояния ошибки API
 * 
 * Автоматически определяет тип ошибки и показывает соответствующий UI
 * 
 * @example
 * ```tsx
 * const { data, isError, error, refetch } = useGetDataQuery()
 * 
 * if (isError) {
 *   return <ApiErrorState error={error} onRetry={refetch} />
 * }
 * ```
 */
export function ApiErrorState({
	error,
	onRetry,
	showRetry = true,
	title,
	message,
	minHeight = '400px',
	inCard = false,
}: ApiErrorStateProps) {
	const navigate = useNavigate()
	const normalizedError = parseError(error)
	const config = ERROR_CONFIG[normalizedError.type]

	const handleRetry = () => {
		if (onRetry) {
			onRetry()
		} else {
			window.location.reload()
		}
	}

	const handleLogin = () => {
		navigate('/login')
	}

	const handleGoHome = () => {
		navigate('/')
	}

	// Определяем кнопки в зависимости от типа ошибки
	const getExtraButtons = () => {
		const buttons: React.ReactNode[] = []

		// Для ошибок авторизации - кнопка входа
		if (normalizedError.type === 'auth') {
			buttons.push(
				<Button
					key='login'
					type='primary'
					icon={<LoginOutlined />}
					onClick={handleLogin}
				>
					Войти
				</Button>
			)
		}

		// Кнопка повтора для большинства ошибок
		if (showRetry && normalizedError.type !== 'auth') {
			buttons.push(
				<Button
					key='retry'
					type='primary'
					icon={<ReloadOutlined />}
					onClick={handleRetry}
				>
					Попробовать снова
				</Button>
			)
		}

		// Кнопка на главную для серьёзных ошибок
		if (['server', 'not_found', 'permission'].includes(normalizedError.type)) {
			buttons.push(
				<Button key='home' icon={<HomeOutlined />} onClick={handleGoHome}>
					На главную
				</Button>
			)
		}

		return buttons
	}

	const content = (
		<Result
			status={config.status}
			title={title || config.title}
			subTitle={message || normalizedError.message}
			extra={getExtraButtons()}
		/>
	)

	if (inCard) {
		return (
			<div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-200'>
				{content}
			</div>
		)
	}

	return (
		<div
			className='flex items-center justify-center'
			style={{ minHeight }}
		>
			{content}
		</div>
	)
}

