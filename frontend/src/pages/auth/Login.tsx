import { Button, Form, Input, Typography, Alert } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../../store/api/auth.api'
import { setCredentials } from '../../store/slices/auth.slice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useState } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'

export const Login = () => {
	const { Title, Text } = Typography
	const navigate = useNavigate()
	const dispatch = useAppDispatch()
	const theme = useAppSelector((state) => state.ui.theme)

	const [login, { isLoading }] = useLoginMutation()
	const [formError, setFormError] = useState<string | null>(null)

	// Динамические классы для темы
	const cardBgClass = theme === 'dark' ? 'bg-slate-800' : 'bg-light'
	const borderClass = theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
	const titleClass = theme === 'dark' ? '!text-slate-100' : '!text-gray-800'
	const demoBgClass = theme === 'dark' ? 'bg-teal-900/30 border-teal-700' : 'bg-teal-50 border-teal-200'
	const demoTitleClass = theme === 'dark' ? '!text-teal-300' : '!text-teal-800'
	const demoTextClass = theme === 'dark' ? 'text-teal-200' : 'text-teal-700'

	type FieldType = {
		login: string
		password: string
	}

	const onFinish = async (values: FieldType) => {
		try {
			setFormError(null)

			const loginData = {
				emailOrPhone: values.login,
				password: values.password,
			}

			const result = await login(loginData).unwrap()

			dispatch(
				setCredentials({
					user: result.user,
					token: result.token.accessToken,
				}),
			)

			if (result.user.role === 'TRAINER') {
				navigate('/admin')
			} else {
				navigate('/me')
			}
		} catch (err) {
			console.error('Login error:', err)
			
		const error = err as {
			status?: number
			data?: { 
				message?: string
				error?: { message?: string; statusCode?: number } | string 
			}
			error?: { message?: string }
			message?: string
			name?: string
		}
		
		// Определяем статус ошибки
		const status = error?.status
		
		// Получаем сообщение об ошибке из разных возможных мест
		// Бэкенд возвращает: { error: { message: "...", statusCode: ... } }
		const errorMessage =
			(typeof error?.data?.error === 'object' ? error?.data?.error?.message : error?.data?.error) ||
			error?.data?.message || 
			error?.error?.message ||
			error?.message ||
			'Ошибка входа'

			// Обрабатываем разные типы ошибок
			if (status === 400) {
				// Показываем конкретную ошибку валидации от бэкенда
				setFormError(typeof errorMessage === 'string' ? errorMessage : 'Неверный формат данных. Проверьте введённые данные.')
			} else if (status === 401 || status === 404) {
				// Неверные учетные данные или пользователь не найден
				setFormError('Неверный email/телефон или пароль. Проверьте введённые данные.')
			} else if (status === 500) {
				setFormError('Ошибка сервера. Пожалуйста, попробуйте позже.')
			} else if (error?.name === 'TypeError' || error?.message?.includes('fetch')) {
				// Сетевая ошибка
				setFormError('Не удалось подключиться к серверу. Проверьте интернет-соединение.')
			} else {
				setFormError(
					typeof errorMessage === 'string' ? errorMessage : 'Произошла ошибка при входе',
				)
			}
		}
	}

	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] flex items-center justify-center p-5'>
			<div className={`${cardBgClass} rounded-2xl p-10 shadow-xl border ${borderClass} max-w-[480px] w-full animate-fade-in`}>
				<div className='text-center mb-8'>
					<Title level={2} className={`mb-2! ${titleClass}`}>
						Добро пожаловать
					</Title>
					<Text type='secondary' className='text-lg'>
						Войдите в ваш аккаунт
					</Text>
				</div>

				{formError && (
					<Alert
						message={formError}
						type='error'
						showIcon
						closable
						className='mb-6'
						onClose={() => setFormError(null)}
					/>
				)}

				<Form
					name='login'
					onFinish={onFinish}
					autoComplete='off'
					layout='vertical'
					disabled={isLoading}
					size='large'
				>
					<Form.Item<FieldType>
						name='login'
						label='Email или телефон'
						rules={[
							{
								required: true,
								message: 'Пожалуйста, введите email или телефон',
							},
						]}
					>
						<Input
							placeholder='example@mail.ru или +79161234567'
							prefix={<UserOutlined className='text-gray-400' />}
							className='rounded-lg'
						/>
					</Form.Item>

					<Form.Item<FieldType>
						name='password'
						label='Пароль'
						rules={[
							{
								required: true,
								message: 'Пожалуйста, введите пароль',
							},
						]}
					>
						<Input.Password
							placeholder='Введите ваш пароль'
							prefix={<LockOutlined className='text-gray-400' />}
							className='rounded-lg'
						/>
					</Form.Item>

					<Form.Item className='mb-4!'>
						<Button
							type='primary'
							htmlType='submit'
							block
							size='large'
							loading={isLoading}
							className='rounded-lg! h-12! text-base! font-semibold'
						>
							Войти
						</Button>
					</Form.Item>

					<div className='text-center space-y-3'>
						<div>
							<Text type='secondary'>Нет аккаунта? </Text>
							<Link
								to='/signup'
								className='text-primary! hover:opacity-80! font-semibold transition-opacity'
								style={{ color: 'var(--primary)' }}
							>
								Зарегистрируйтесь
							</Link>
						</div>
					</div>
				</Form>

				{/* Демо-подсказка */}
				<div className={`mt-8 p-4 rounded-lg border ${demoBgClass}`}>
					<Text strong className={`${demoTitleClass} mb-2! block`}>
						🚀 Для тестирования:
					</Text>
					<div className={`${demoTextClass} text-sm space-y-1`}>
						<div>• Используйте тестовые аккаунты из БД</div>
						<div>• Формат: email/телефон + пароль 123456</div>
					</div>
				</div>
			</div>
		</div>
	)
}
