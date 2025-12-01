import { Result, Button } from 'antd'

interface ErrorStateProps {
	title?: string
	message?: string
	onRetry?: () => void
	showRetryButton?: boolean
	buttonText?: string
}

export function ErrorState({
	title = 'Ошибка',
	message = 'Что-то пошло не так',
	onRetry,
	showRetryButton = true,
	buttonText = 'Попробовать снова',
}: ErrorStateProps) {
	const handleRetry = () => {
		if (onRetry) {
			onRetry()
		} else {
			window.location.reload()
		}
	}

	return (
		<div className='flex items-center justify-center min-h-[400px]'>
			<Result
				status='error'
				title={title}
				subTitle={message}
				extra={
					showRetryButton && (
						<Button type='primary' onClick={handleRetry}>
							{buttonText}
						</Button>
					)
				}
			/>
		</div>
	)
}
