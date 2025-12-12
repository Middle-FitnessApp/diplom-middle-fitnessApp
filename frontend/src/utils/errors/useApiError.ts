import { useCallback } from 'react'
import { type RTKQueryError, type NormalizedError } from './types'
import { parseError, getErrorMessage, isAuthError, isNetworkError, isServerError } from './parseError'
import { showError, handleMutationError } from './showError'

/**
 * Хук для работы с ошибками API в компонентах
 * 
 * @example
 * ```tsx
 * const { handleError, getErrorMessage, isAuthError } = useApiError()
 * 
 * const handleSubmit = async () => {
 *   try {
 *     await createItem(data).unwrap()
 *   } catch (err) {
 *     handleError(err, 'Не удалось создать элемент')
 *   }
 * }
 * ```
 */
export function useApiError() {
	/**
	 * Обработать ошибку и показать уведомление
	 */
	const handleError = useCallback((
		error: unknown,
		fallbackMessage?: string
	): void => {
		handleMutationError(error, fallbackMessage)
	}, [])

	/**
	 * Показать ошибку без парсинга
	 */
	const showErrorMessage = useCallback((
		message: string
	): void => {
		showError(message)
	}, [])

	/**
	 * Получить нормализованную ошибку
	 */
	const parseApiError = useCallback((
		error: RTKQueryError
	): NormalizedError => {
		return parseError(error)
	}, [])

	/**
	 * Получить сообщение об ошибке
	 */
	const getApiErrorMessage = useCallback((
		error: RTKQueryError
	): string => {
		return getErrorMessage(error)
	}, [])

	/**
	 * Проверить тип ошибки
	 */
	const checkIsAuthError = useCallback((error: RTKQueryError): boolean => {
		return isAuthError(error)
	}, [])

	const checkIsNetworkError = useCallback((error: RTKQueryError): boolean => {
		return isNetworkError(error)
	}, [])

	const checkIsServerError = useCallback((error: RTKQueryError): boolean => {
		return isServerError(error)
	}, [])

	return {
		handleError,
		showErrorMessage,
		parseApiError,
		getApiErrorMessage,
		isAuthError: checkIsAuthError,
		isNetworkError: checkIsNetworkError,
		isServerError: checkIsServerError,
	}
}

