import { Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAppSelector } from '../store/hooks'
import { useGetMeQuery } from '../store/api/user.api'

interface GuestRouteProps {
	children: React.ReactNode
}

/**
 * Компонент для защиты страниц, доступных только неавторизованным пользователям
 * (например, /login и /signup)
 * Авторизованных пользователей редиректит на главную страницу
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
	const token = useAppSelector((state) => state.auth.token)

	// Загружаем данные пользователя если есть токен
	const { data: meData, isLoading } = useGetMeQuery(undefined, {
		skip: !token,
	})

	// Нет токена - показываем страницу (пользователь не авторизован)
	if (!token) {
		return <>{children}</>
	}

	// Есть токен, но данные ещё загружаются
	if (isLoading) {
		return (
			<div className="gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start">
				<div className="flex justify-center items-center py-20">
					<Spin size="large" />
				</div>
			</div>
		)
	}

	// Авторизованный пользователь - редиректим на соответствующую страницу
	if (meData?.user) {
		const redirectPath = meData.user.role === 'TRAINER' ? '/admin' : '/'
		return <Navigate to={redirectPath} replace />
	}

	// Токен есть, но пользователь не загрузился (возможно, невалидный токен)
	return <>{children}</>
}

