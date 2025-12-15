/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../utils/test-utils'
import { Result, Alert, Button, Space } from 'antd'
import React from 'react'

// ============================================
// 1. Error Boundary - перехват ошибок React
// ============================================

const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
	if (shouldThrow) {
		throw new Error('Тестовая ошибка компонента')
	}
	return <div>Нормальный компонент</div>
}

class ErrorBoundary extends React.Component<
	{ children: React.ReactNode; onError?: (error: Error) => void },
	{ hasError: boolean; error: Error | null }
> {
	constructor(props: any) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo)
		this.props.onError?.(error)
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null })
	}

	render() {
		if (this.state.hasError) {
			return (
				<Result
					status='error'
					title='Произошла ошибка'
					subTitle='Извините, что-то пошло не так. Попробуйте обновить страницу.'
					extra={
						<Button type='primary' onClick={this.handleReset}>
							Попробовать снова
						</Button>
					}
				/>
			)
		}

		return this.props.children
	}
}

// ============================================
// 2. NotFound - страница 404
// ============================================

const NotFound = ({ onGoHome = vi.fn() }: { onGoHome?: () => void }) => {
	return (
		<Result
			status='404'
			title='404'
			subTitle='Страница не найдена'
			extra={
				<Button type='primary' onClick={onGoHome}>
					На главную
				</Button>
			}
		/>
	)
}

// ============================================
// 3. API Error Display - отображение ошибок API
// ============================================

const ApiErrorDisplay = ({
	error,
	onRetry,
}: {
	error?: string | null
	onRetry?: () => void
}) => {
	if (!error) return null

	return (
		<Alert
			message='Ошибка загрузки данных'
			description={error}
			type='error'
			showIcon
			closable
			action={
				onRetry && (
					<Button size='small' danger onClick={onRetry}>
						Повторить
					</Button>
				)
			}
		/>
	)
}

// ============================================
// 4. Loading Fallback - загрузка/ошибка
// ============================================

const LoadingFallback = ({
	loading = false,
	error = null,
	children,
}: {
	loading?: boolean
	error?: string | null
	children: React.ReactNode
}) => {
	if (loading) {
		return <div data-testid='loading-spinner'>Загрузка...</div>
	}

	if (error) {
		return <Alert message='Ошибка' description={error} type='error' showIcon />
	}

	return <>{children}</>
}

// ============================================
// ТЕСТЫ
// ============================================

describe('ErrorHandling - Обработка ошибок', () => {
	beforeEach(() => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	// ============================================
	// ErrorBoundary тесты
	// ============================================
	describe('ErrorBoundary - Перехват ошибок React', () => {
		it('должен отображать дочерние компоненты при отсутствии ошибок', () => {
			render(
				<ErrorBoundary>
					<ThrowError shouldThrow={false} />
				</ErrorBoundary>,
			)

			expect(screen.getByText('Нормальный компонент')).toBeInTheDocument()
		})

		it('должен перехватывать и отображать ошибку', () => {
			render(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>,
			)

			expect(screen.getByText('Произошла ошибка')).toBeInTheDocument()
			expect(screen.getByText(/извините, что-то пошло не так/i)).toBeInTheDocument()
		})

		it('должен отображать кнопку "Попробовать снова"', () => {
			render(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>,
			)

			expect(
				screen.getByRole('button', { name: /попробовать снова/i }),
			).toBeInTheDocument()
		})

		it('должен вызывать onError callback', () => {
			const mockOnError = vi.fn()

			render(
				<ErrorBoundary onError={mockOnError}>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>,
			)

			expect(mockOnError).toHaveBeenCalled()
			expect(mockOnError.mock.calls[0][0]).toBeInstanceOf(Error)
		})

		it('не должен отображать дочерние компоненты при ошибке', () => {
			render(
				<ErrorBoundary>
					<ThrowError shouldThrow={true} />
				</ErrorBoundary>,
			)

			expect(screen.queryByText('Нормальный компонент')).not.toBeInTheDocument()
		})
	})

	// ============================================
	// NotFound тесты
	// ============================================
	describe('NotFound - Страница 404', () => {
		it('должен отображать заголовок 404', () => {
			render(<NotFound />)

			expect(screen.getByText('404')).toBeInTheDocument()
		})

		it('должен отображать сообщение "Страница не найдена"', () => {
			render(<NotFound />)

			expect(screen.getByText('Страница не найдена')).toBeInTheDocument()
		})

		it('должен отображать кнопку "На главную"', () => {
			render(<NotFound />)

			expect(screen.getByRole('button', { name: /на главную/i })).toBeInTheDocument()
		})

		it('должен вызывать onGoHome при клике на кнопку', async () => {
			const user = userEvent.setup()
			const mockOnGoHome = vi.fn()

			render(<NotFound onGoHome={mockOnGoHome} />)

			const button = screen.getByRole('button', { name: /на главную/i })
			await user.click(button)

			expect(mockOnGoHome).toHaveBeenCalledTimes(1)
		})
	})

	// ============================================
	// API Error Display тесты
	// ============================================
	describe('ApiErrorDisplay - Отображение ошибок API', () => {
		it('не должен отображать ничего если нет ошибки', () => {
			const { container } = render(<ApiErrorDisplay error={null} />)

			expect(container.firstChild).toBeNull()
		})

		it('должен отображать сообщение об ошибке', () => {
			render(<ApiErrorDisplay error='Ошибка сервера 500' />)

			expect(screen.getByText('Ошибка загрузки данных')).toBeInTheDocument()
			expect(screen.getByText('Ошибка сервера 500')).toBeInTheDocument()
		})

		it('должен отображать кнопку "Повторить" если передан onRetry', () => {
			const mockOnRetry = vi.fn()

			render(<ApiErrorDisplay error='Ошибка сети' onRetry={mockOnRetry} />)

			expect(screen.getByRole('button', { name: /повторить/i })).toBeInTheDocument()
		})

		it('должен вызывать onRetry при клике на кнопку', async () => {
			const user = userEvent.setup()
			const mockOnRetry = vi.fn()

			render(<ApiErrorDisplay error='Ошибка сети' onRetry={mockOnRetry} />)

			const button = screen.getByRole('button', { name: /повторить/i })
			await user.click(button)

			expect(mockOnRetry).toHaveBeenCalledTimes(1)
		})

		it('должен иметь тип "error"', () => {
			const { container } = render(<ApiErrorDisplay error='Тестовая ошибка' />)

			expect(container.querySelector('.ant-alert-error')).toBeInTheDocument()
		})

		it('должен показывать иконку ошибки', () => {
			const { container } = render(<ApiErrorDisplay error='Тестовая ошибка' />)

			expect(container.querySelector('.ant-alert-with-description')).toBeInTheDocument()
		})
	})

	// ============================================
	// Loading Fallback тесты
	// ============================================
	describe('LoadingFallback - Состояния загрузки', () => {
		it('должен отображать спиннер при loading=true', () => {
			render(
				<LoadingFallback loading={true}>
					<div>Контент</div>
				</LoadingFallback>,
			)

			expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
			expect(screen.getByText('Загрузка...')).toBeInTheDocument()
		})

		it('не должен отображать контент при loading=true', () => {
			render(
				<LoadingFallback loading={true}>
					<div>Контент</div>
				</LoadingFallback>,
			)

			expect(screen.queryByText('Контент')).not.toBeInTheDocument()
		})

		it('должен отображать ошибку при наличии error', () => {
			render(
				<LoadingFallback error='Ошибка загрузки'>
					<div>Контент</div>
				</LoadingFallback>,
			)

			expect(screen.getByText('Ошибка')).toBeInTheDocument()
			expect(screen.getByText('Ошибка загрузки')).toBeInTheDocument()
		})

		it('не должен отображать контент при ошибке', () => {
			render(
				<LoadingFallback error='Ошибка'>
					<div>Контент</div>
				</LoadingFallback>,
			)

			expect(screen.queryByText('Контент')).not.toBeInTheDocument()
		})

		it('должен отображать контент при отсутствии loading и error', () => {
			render(
				<LoadingFallback loading={false} error={null}>
					<div>Контент загружен</div>
				</LoadingFallback>,
			)

			expect(screen.getByText('Контент загружен')).toBeInTheDocument()
		})

		it('должен приоритетно показывать loading перед error', () => {
			render(
				<LoadingFallback loading={true} error='Ошибка'>
					<div>Контент</div>
				</LoadingFallback>,
			)

			expect(screen.getByText('Загрузка...')).toBeInTheDocument()
			expect(screen.queryByText('Ошибка')).not.toBeInTheDocument()
		})
	})

	// ============================================
	// Интеграционные тесты
	// ============================================
	describe('Интеграция - Сценарии обработки ошибок', () => {
		it('должен обрабатывать последовательность: загрузка -> ошибка -> успех', () => {
			const { rerender } = render(
				<LoadingFallback loading={true}>
					<div>Данные</div>
				</LoadingFallback>,
			)

			expect(screen.getByText('Загрузка...')).toBeInTheDocument()

			rerender(
				<LoadingFallback loading={false} error='Ошибка сети'>
					<div>Данные</div>
				</LoadingFallback>,
			)

			expect(screen.getByText('Ошибка сети')).toBeInTheDocument()

			rerender(
				<LoadingFallback loading={false} error={null}>
					<div>Данные</div>
				</LoadingFallback>,
			)

			expect(screen.getByText('Данные')).toBeInTheDocument()
		})

		it('должен корректно отображать несколько компонентов ошибок', () => {
			render(
				<Space direction='vertical' style={{ width: '100%' }}>
					<ApiErrorDisplay error='Ошибка API 1' />
					<ApiErrorDisplay error='Ошибка API 2' />
				</Space>,
			)

			expect(screen.getAllByText('Ошибка загрузки данных')).toHaveLength(2)
			expect(screen.getByText('Ошибка API 1')).toBeInTheDocument()
			expect(screen.getByText('Ошибка API 2')).toBeInTheDocument()
		})
	})
})
