import { useEffect } from 'react'
import { notification } from 'antd'

interface BadRequestStateProps {
	title?: string
	message?: string | null
	onRetry?: () => void
}

export function BadRequestState({
	title = 'Неверный запрос',
	message = 'Пожалуйста, проверьте введённые данные и попробуйте снова',
	onRetry,
}: BadRequestStateProps) {
	useEffect(() => {
		notification.warning({
			key: 'bad-request',
			message: title,
			description: message,
			duration: 4.5,
			placement: 'topRight',
			onClose: onRetry,
		})
	}, [title, message, onRetry])

	return null
}
