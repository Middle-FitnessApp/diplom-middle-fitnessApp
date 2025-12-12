import { type FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { type SerializedError } from '@reduxjs/toolkit'
import {
	type RTKQueryError,
	type NormalizedError,
	type ErrorType,
	type ApiErrorResponse,
	type ApiErrorResponseAlt,
	HttpStatusCode,
} from './types'

/**
 * Сообщения по умолчанию для разных типов ошибок
 */
const DEFAULT_MESSAGES: Record<ErrorType, string> = {
	validation: 'Проверьте правильность введённых данных',
	auth: 'Необходимо авторизоваться',
	permission: 'У вас нет доступа к этому ресурсу',
	not_found: 'Запрашиваемый ресурс не найден',
	conflict: 'Конфликт данных. Возможно, такая запись уже существует',
	network: 'Ошибка сети. Проверьте подключение к интернету',
	server: 'Ошибка сервера. Попробуйте позже',
	unknown: 'Произошла неизвестная ошибка',
}

/**
 * Определяет тип ошибки по HTTP статус-коду
 */
function getErrorTypeByStatus(status: number): ErrorType {
	switch (status) {
		case HttpStatusCode.BAD_REQUEST:
		case HttpStatusCode.UNPROCESSABLE_ENTITY:
			return 'validation'
		case HttpStatusCode.UNAUTHORIZED:
			return 'auth'
		case HttpStatusCode.FORBIDDEN:
			return 'permission'
		case HttpStatusCode.NOT_FOUND:
			return 'not_found'
		case HttpStatusCode.CONFLICT:
			return 'conflict'
		case HttpStatusCode.TOO_MANY_REQUESTS:
			return 'validation'
		case HttpStatusCode.INTERNAL_SERVER_ERROR:
		case HttpStatusCode.BAD_GATEWAY:
		case HttpStatusCode.SERVICE_UNAVAILABLE:
		case HttpStatusCode.GATEWAY_TIMEOUT:
			return 'server'
		default:
			return 'unknown'
	}
}

/**
 * Проверяет, является ли ошибка FetchBaseQueryError
 */
function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
	return typeof error === 'object' && error !== null && 'status' in error
}

/**
 * Проверяет, является ли ошибка SerializedError
 */
function isSerializedError(error: unknown): error is SerializedError {
	return typeof error === 'object' && error !== null && 'message' in error && !('status' in error)
}

/**
 * Извлекает сообщение из данных ошибки бэкенда
 */
function extractMessageFromData(data: unknown): string | null {
	if (!data || typeof data !== 'object') return null

	// Формат: { error: { message: "...", statusCode: ... } }
	const apiError = data as ApiErrorResponse
	if (apiError.error?.message) {
		return apiError.error.message
	}

	// Альтернативные форматы
	const altError = data as ApiErrorResponseAlt
	
	// Формат: { message: "..." }
	if (altError.message) {
		return altError.message
	}

	// Формат: { error: "..." }
	if (typeof altError.error === 'string') {
		return altError.error
	}

	return null
}

/**
 * Главная функция парсинга ошибок RTK Query
 * Преобразует любую ошибку в нормализованный формат
 */
export function parseError(error: RTKQueryError): NormalizedError {
	// Если ошибки нет
	if (!error) {
		return {
			type: 'unknown',
			message: DEFAULT_MESSAGES.unknown,
		}
	}

	// FetchBaseQueryError - ошибки от API
	if (isFetchBaseQueryError(error)) {
		// Ошибка сети (FETCH_ERROR)
		if (error.status === 'FETCH_ERROR') {
			return {
				type: 'network',
				message: DEFAULT_MESSAGES.network,
				originalError: error,
			}
		}

		// Ошибка парсинга ответа
		if (error.status === 'PARSING_ERROR') {
			return {
				type: 'server',
				message: 'Ошибка обработки ответа сервера',
				originalError: error,
			}
		}

		// Таймаут
		if (error.status === 'TIMEOUT_ERROR') {
			return {
				type: 'network',
				message: 'Превышено время ожидания ответа от сервера',
				originalError: error,
			}
		}

		// Кастомная ошибка
		if (error.status === 'CUSTOM_ERROR') {
			return {
				type: 'unknown',
				message: (error.error as string) || DEFAULT_MESSAGES.unknown,
				originalError: error,
			}
		}

		// HTTP ошибки с числовым статусом
		if (typeof error.status === 'number') {
			const statusCode = error.status
			const errorType = getErrorTypeByStatus(statusCode)
			const messageFromData = extractMessageFromData(error.data)

			return {
				type: errorType,
				message: messageFromData || DEFAULT_MESSAGES[errorType],
				statusCode,
				originalError: error,
			}
		}
	}

	// SerializedError - ошибки Redux
	if (isSerializedError(error)) {
		return {
			type: 'unknown',
			message: error.message || DEFAULT_MESSAGES.unknown,
			originalError: error,
		}
	}

	// Fallback для неизвестных типов ошибок
	return {
		type: 'unknown',
		message: DEFAULT_MESSAGES.unknown,
		originalError: error,
	}
}

/**
 * Быстрое получение сообщения об ошибке
 */
export function getErrorMessage(error: RTKQueryError): string {
	return parseError(error).message
}

/**
 * Проверяет, является ли ошибка ошибкой авторизации
 */
export function isAuthError(error: RTKQueryError): boolean {
	return parseError(error).type === 'auth'
}

/**
 * Проверяет, является ли ошибка ошибкой сети
 */
export function isNetworkError(error: RTKQueryError): boolean {
	return parseError(error).type === 'network'
}

/**
 * Проверяет, является ли ошибка серверной ошибкой
 */
export function isServerError(error: RTKQueryError): boolean {
	return parseError(error).type === 'server'
}

