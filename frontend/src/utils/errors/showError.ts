import { message, notification } from 'antd'
import { type RTKQueryError, type NormalizedError, type ErrorType } from './types'
import { parseError, getErrorMessage } from './parseError'

/**
 * Конфигурация отображения ошибок
 */
interface ShowErrorConfig {
	/** Использовать notification вместо message (для важных ошибок) */
	useNotification?: boolean
	/** Заголовок для notification */
	title?: string
	/** Длительность отображения в секундах */
	duration?: number
	/** Callback после закрытия */
	onClose?: () => void
}

/**
 * Заголовки по умолчанию для notification по типу ошибки
 */
const DEFAULT_TITLES: Record<ErrorType, string> = {
	validation: 'Ошибка валидации',
	auth: 'Ошибка авторизации',
	permission: 'Доступ запрещён',
	not_found: 'Не найдено',
	conflict: 'Конфликт данных',
	network: 'Ошибка сети',
	server: 'Ошибка сервера',
	unknown: 'Ошибка',
}

/**
 * Типы notification по типу ошибки
 */
const NOTIFICATION_TYPES: Record<ErrorType, 'error' | 'warning' | 'info'> = {
	validation: 'warning',
	auth: 'warning',
	permission: 'warning',
	not_found: 'warning',
	conflict: 'warning',
	network: 'error',
	server: 'error',
	unknown: 'error',
}

/**
 * Показывает ошибку пользователю через message или notification
 */
export function showError(
	error: RTKQueryError | NormalizedError | string | undefined,
	config: ShowErrorConfig = {},
): void {
	const { useNotification = false, title, duration = 4.5, onClose } = config

	let normalizedError: NormalizedError

	// Парсим ошибку если это не уже нормализованная ошибка
	if (!error) {
		normalizedError = {
			type: 'unknown',
			message: 'Произошла неизвестная ошибка',
		}
	} else if (typeof error === 'string') {
		normalizedError = {
			type: 'unknown',
			message: error,
		}
	} else if ('type' in error && 'message' in error) {
		normalizedError = error as NormalizedError
	} else {
		normalizedError = parseError(error as RTKQueryError)
	}

	const errorTitle = title || DEFAULT_TITLES[normalizedError.type]
	const notificationType = NOTIFICATION_TYPES[normalizedError.type]

	if (useNotification) {
		notification[notificationType]({
			message: errorTitle,
			description: normalizedError.message,
			duration,
			placement: 'topRight',
			onClose,
		})
	} else {
		// Для message используем разные методы в зависимости от типа
		if (notificationType === 'warning') {
			message.warning(normalizedError.message, duration)
		} else {
			message.error(normalizedError.message, duration)
		}
	}
}

/**
 * Показывает ошибку RTK Query (сокращённая версия)
 */
export function showApiError(error: RTKQueryError, config?: ShowErrorConfig): void {
	showError(error, config)
}

/**
 * Показывает ошибку с кастомным сообщением, но с fallback на парсинг ошибки
 */
export function showErrorWithFallback(
	error: RTKQueryError,
	customMessage?: string,
	config?: ShowErrorConfig,
): void {
	if (customMessage) {
		showError(customMessage, config)
	} else {
		showError(error, config)
	}
}

/**
 * Создаёт обработчик ошибок для catch блоков
 * @example
 * try {
 *   await someAction()
 * } catch (err) {
 *   handleError(err)
 * }
 */
export function handleError(error: unknown, config?: ShowErrorConfig): void {
	// Логируем в консоль для отладки
	if (import.meta.env.DEV) {
		console.error('Error:', error)
	}

	showError(error as RTKQueryError, config)
}

/**
 * Создаёт типизированный обработчик ошибок для RTK Query mutations
 * @example
 * const [createItem] = useCreateItemMutation()
 *
 * const handleSubmit = async () => {
 *   try {
 *     await createItem(data).unwrap()
 *     message.success('Создано!')
 *   } catch (err) {
 *     handleMutationError(err, 'Не удалось создать элемент')
 *   }
 * }
 */
export function handleMutationError(
	error: unknown,
	fallbackMessage?: string,
	config?: ShowErrorConfig,
): void {
	const parsed = parseError(error as RTKQueryError)

	// Если есть сообщение от сервера - используем его
	// Иначе используем fallback или дефолтное сообщение
	const finalMessage =
		parsed.message !== 'Произошла неизвестная ошибка'
			? parsed.message
			: fallbackMessage || parsed.message

	showError({ ...parsed, message: finalMessage }, config)
}

/**
 * Хелпер для получения сообщения об ошибке (реэкспорт)
 */
export { getErrorMessage }
