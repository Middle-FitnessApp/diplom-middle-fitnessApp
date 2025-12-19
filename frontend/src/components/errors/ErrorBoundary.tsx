import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Result, Button, Typography } from 'antd'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'

const { Paragraph, Text } = Typography

interface Props {
	children: ReactNode
	/** Fallback компонент для отображения при ошибке */
	fallback?: ReactNode
	/** Callback при возникновении ошибки */
	onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
	hasError: boolean
	error: Error | null
	errorInfo: ErrorInfo | null
}

/**
 * Error Boundary для перехвата ошибок рендеринга React компонентов
 *
 * Использование:
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		}
	}

	static getDerivedStateFromError(error: Error): Partial<State> {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		this.setState({ errorInfo })

		// Логируем ошибку
		if (import.meta.env.DEV) {
			console.error('ErrorBoundary caught an error:', error, errorInfo)
		}

		// Вызываем callback если передан
		this.props.onError?.(error, errorInfo)

		// В production можно отправлять ошибки в сервис мониторинга
		// например Sentry, LogRocket и т.д.
	}

	handleReload = (): void => {
		window.location.reload()
	}

	handleGoHome = (): void => {
		window.location.href = '/'
	}

	handleRetry = (): void => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		})
	}

	render(): ReactNode {
		if (this.state.hasError) {
			// Если передан кастомный fallback - используем его
			if (this.props.fallback) {
				return this.props.fallback
			}

			const isDev = import.meta.env.DEV

			return (
				<div className='min-h-screen flex items-center justify-center p-4 bg-gray-50'>
					<Result
						status='error'
						title='Что-то пошло не так'
						subTitle='Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.'
						extra={[
							<Button
								key='retry'
								type='primary'
								icon={<ReloadOutlined />}
								onClick={this.handleReload}
							>
								Обновить страницу
							</Button>,
							<Button key='home' icon={<HomeOutlined />} onClick={this.handleGoHome}>
								На главную
							</Button>,
						]}
					>
						{isDev && this.state.error && (
							<div className='mt-4 text-left'>
								<Paragraph>
									<Text strong className='text-red-600'>
										Детали ошибки (только в режиме разработки):
									</Text>
								</Paragraph>
								<Paragraph>
									<Text code className='block whitespace-pre-wrap break-all'>
										{this.state.error.toString()}
									</Text>
								</Paragraph>
								{this.state.errorInfo && (
									<Paragraph>
										<Text type='secondary' className='block whitespace-pre-wrap text-xs'>
											{this.state.errorInfo.componentStack}
										</Text>
									</Paragraph>
								)}
							</div>
						)}
					</Result>
				</div>
			)
		}

		return this.props.children
	}
}
