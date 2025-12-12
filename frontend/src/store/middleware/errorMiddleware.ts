import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit'
import { message, notification } from 'antd'
import { parseError, isAuthError, type RTKQueryError } from '../../utils/errors'

/**
 * Список эндпоинтов, для которых НЕ нужно показывать глобальные ошибки
 * (они обрабатываются локально в компонентах)
 */
const SILENT_ENDPOINTS = [
	'login',
	'register',
	'refresh',
] as const

/**
 * Список эндпоинтов, для которых показываем notification вместо message
 */
const NOTIFICATION_ENDPOINTS = [
	'deleteCategory',
	'deletePlan',
	'deleteDay',
	'removeClient',
] as const

/**
 * RTK Query Middleware для глобальной обработки ошибок API
 * 
 * Автоматически показывает ошибки для всех API запросов,
 * кроме тех, что указаны в SILENT_ENDPOINTS
 */
export const errorMiddleware: Middleware = () => (next) => (action) => {
	// Проверяем, что это rejected action от RTK Query
	if (isRejectedWithValue(action)) {
		const { type, payload } = action

		// Извлекаем имя эндпоинта из типа action
		// Формат: "api/executeMutation/rejected" или "apiName/executeQuery/rejected"
		const endpointName = (action.meta?.arg as { endpointName?: string })?.endpointName

		// Пропускаем silent endpoints
		if (endpointName && SILENT_ENDPOINTS.includes(endpointName as typeof SILENT_ENDPOINTS[number])) {
			return next(action)
		}

		// Парсим ошибку
		const normalizedError = parseError(payload as RTKQueryError)

		// Пропускаем ошибки авторизации - они обрабатываются в baseQuery
		if (isAuthError(payload as RTKQueryError)) {
			return next(action)
		}

		// Определяем способ отображения
		const useNotification = endpointName && 
			NOTIFICATION_ENDPOINTS.includes(endpointName as typeof NOTIFICATION_ENDPOINTS[number])

		if (useNotification) {
			notification.error({
				message: 'Ошибка',
				description: normalizedError.message,
				duration: 4.5,
				placement: 'topRight',
			})
		} else {
			// Используем message для большинства ошибок
			message.error(normalizedError.message)
		}

		// Логируем для отладки в development
		if (import.meta.env.DEV) {
			console.group(`🔴 API Error: ${endpointName || type}`)
			console.log('Type:', normalizedError.type)
			console.log('Message:', normalizedError.message)
			console.log('Status:', normalizedError.statusCode)
			console.log('Original:', payload)
			console.groupEnd()
		}
	}

	return next(action)
}

