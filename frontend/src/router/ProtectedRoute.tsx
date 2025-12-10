import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAppSelector } from '../store/hooks'
import { useGetMeQuery } from '../store/api/user.api'

interface ProtectedRouteProps {
	children: React.ReactNode
	requiredRole?: 'CLIENT' | 'TRAINER'
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requiredRole,
}) => {
	const location = useLocation()
	const token = useAppSelector((state) => state.auth.token)
	
	// Загружаем данные пользователя если есть токен
	const { data: meData, isLoading, error } = useGetMeQuery(undefined, {
		skip: !token,
	})

	// Нет токена - редирект на логин
	if (!token) {
		return <Navigate to="/login" state={{ from: location }} replace />
	}

	// Загрузка данных пользователя
	if (isLoading) {
		return (
			<div className="gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start">
				<div className="flex justify-center items-center py-20">
					<Spin size="large" />
				</div>
			</div>
		)
	}

	// Ошибка авторизации - редирект на логин
	if (error || !meData?.user) {
		return <Navigate to="/login" state={{ from: location }} replace />
	}

	const user = meData.user

	// Проверка роли если требуется
	if (requiredRole && user.role !== requiredRole) {
		// Клиент пытается попасть на страницы тренера
		if (requiredRole === 'TRAINER' && user.role === 'CLIENT') {
			return <Navigate to="/me" replace />
		}
		// Тренер пытается попасть на страницы клиента
		if (requiredRole === 'CLIENT' && user.role === 'TRAINER') {
			return <Navigate to="/admin" replace />
		}
	}

	return <>{children}</>
}

