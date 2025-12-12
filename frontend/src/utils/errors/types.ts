import { type FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { type SerializedError } from '@reduxjs/toolkit'

/**
 * Структура ошибки, которую возвращает бэкенд
 */
export interface ApiErrorResponse {
	error: {
		message: string
		statusCode: number
	}
}

/**
 * Альтернативный формат ошибки бэкенда
 */
export interface ApiErrorResponseAlt {
	message?: string
	error?: string | { message: string; statusCode: number }
}

/**
 * Объединённый тип для ошибок RTK Query
 */
export type RTKQueryError = FetchBaseQueryError | SerializedError | undefined

/**
 * Коды HTTP ошибок
 */
export const HttpStatusCode = {
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
} as const

export type HttpStatusCode = typeof HttpStatusCode[keyof typeof HttpStatusCode]

/**
 * Типы ошибок для UI
 */
export type ErrorType = 
	| 'validation'
	| 'auth'
	| 'permission'
	| 'not_found'
	| 'conflict'
	| 'network'
	| 'server'
	| 'unknown'

/**
 * Нормализованная ошибка для использования в UI
 */
export interface NormalizedError {
	type: ErrorType
	message: string
	statusCode?: number
	originalError?: unknown
}

