import { Navigate, useLocation } from 'react-router-dom'
import React from 'react'
import { Spin } from 'antd'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { useGetMeQuery } from '../store/api/user.api'
import { setUser } from '../store/slices/auth.slice'

interface ProtectedRouteProps {
	children: React.ReactNode
	requiredRole?: 'CLIENT' | 'TRAINER' | ('CLIENT' | 'TRAINER')[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requiredRole,
}) => {
	const location = useLocation()
	const dispatch = useAppDispatch()
	const token = useAppSelector((state) => state.auth.token)
	const user = useAppSelector((state) => state.auth.user)

	// Загружаем данные пользователя если есть токен
	const {
		data: meData,
		isLoading,
		error,
	} = useGetMeQuery(undefined, {
		skip: !token,
	})

	// Сохраняем пользователя в Redux если он загружен
	React.useEffect(() => {
		if (meData?.user && !user) {
			dispatch(setUser(meData.user))
		}
	}, [meData?.user, user, dispatch])

	// Нет токена - редирект на логин
	if (!token) {
		return <Navigate to='/login' state={{ from: location }} replace />
	}

	// Загрузка данных пользователя
	if (isLoading) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className='flex justify-center items-center py-20'>
					<Spin size='large' />
				</div>
			</div>
		)
	}

	// Ошибка авторизации - редирект на логин
	if (error || !meData?.user) {
		return <Navigate to='/login' state={{ from: location }} replace />
	}

	const currentUser = meData.user

	// Проверка роли если требуется
	if (requiredRole) {
		const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
		if (!allowedRoles.includes(currentUser.role)) {
			// Клиент пытается попасть на страницы тренера
			if (
				allowedRoles.includes('TRAINER') &&
				!allowedRoles.includes('CLIENT') &&
				currentUser.role === 'CLIENT'
			) {
				return <Navigate to='/me' replace />
			}
			// Тренер пытается попасть на страницы клиента
			if (
				allowedRoles.includes('CLIENT') &&
				!allowedRoles.includes('TRAINER') &&
				currentUser.role === 'TRAINER'
			) {
				return <Navigate to='/admin' replace />
			}
		}
	}

	return <>{children}</>
}
