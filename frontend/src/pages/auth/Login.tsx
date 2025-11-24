import { Button, Form, Input, Typography, Alert, Spin } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../../store/api/auth.api'
import { setCredentials } from '../../store/slices/auth.slice'
import { useAppDispatch } from '../../store/hooks'
import { useState } from 'react'

export const Login = () => {
	const { Title } = Typography
	const navigate = useNavigate()
	const dispatch = useAppDispatch()

	const [login, { isLoading }] = useLoginMutation()
	const [formError, setFormError] = useState<string | null>(null)

	type FieldType = {
		login: string
		password: string
	}

	const onFinish = async (values: FieldType) => {
		try {
			setFormError(null)

			// Преобразуем в формат бэкенда
			const loginData = {
				emailOrPhone: values.login, // ← ТАК ЖЕ КАК В БЭКЕНДЕ!
				password: values.password,
			}

			console.log('Sending login request:', loginData)

			const result = await login(loginData).unwrap()

			console.log('Login successful:', result)

			// Сохраняем данные авторизации в store
			dispatch(
				setCredentials({
					user: result.user,
					token: result.token.accessToken,
				}),
			)

			// Перенаправляем в зависимости от роли
			if (result.user.role === 'TRAINER' || result.user.role === 'ADMIN') {
				navigate('/admin')
			} else {
				navigate('/me')
			}
		} catch (err: any) {
			console.error('Login error:', err)
			// Обрабатываем разные форматы ошибок от бэкенда
			const errorMessage =
				err?.data?.message || err?.data?.error || err?.error || 'Ошибка входа'
			setFormError(errorMessage)
		}
	}

	const onFinishFailed = (errorInfo: any) => {
		console.log('Failed:', errorInfo)
	}

	return (
		<div className='mt-50 border border-gray-300 rounded-lg p-6 max-w-md mx-auto'>
			<Title level={3}>Вход</Title>

			{/* Показываем ошибки */}
			{formError && (
				<Alert
					message={formError}
					type='error'
					showIcon
					closable
					className='mb-4'
					onClose={() => setFormError(null)}
				/>
			)}

			<Form
				name='login'
				onFinish={onFinish}
				onFinishFailed={onFinishFailed}
				autoComplete='off'
				disabled={isLoading}
			>
				<Form.Item<FieldType>
					name='login'
					rules={[
						{
							required: true,
							message: 'Пожалуйста, введите email или телефон',
						},
					]}
				>
					<Input placeholder='Введите email или телефон' size='large' />
				</Form.Item>

				<Form.Item<FieldType>
					name='password'
					rules={[
						{
							required: true,
							message: 'Пожалуйста, введите пароль',
						},
					]}
				>
					<Input.Password placeholder='Введите пароль' size='large' />
				</Form.Item>

				<Form.Item>
					<Button
						type='primary'
						htmlType='submit'
						block
						size='large'
						loading={isLoading}
						disabled={isLoading}
					>
						{isLoading ? <Spin size='small' /> : 'Вход'}
					</Button>
				</Form.Item>
			</Form>

			<div className='mt-4 text-center'>
				<p>
					Нет аккаунта? <Link to='/signup'>Зарегистрируйтесь</Link>
				</p>
				<Link to='/forgot-password'>Восстановить пароль</Link>
			</div>

			{/* Демо-подсказка для разработки */}
			<div className='mt-6 p-4 bg-gray-50 rounded-lg'>
				<Title level={5} className='!mb-2'>
					Для тестирования:
				</Title>
				<div className='text-sm space-y-1'>
					<div>Используйте существующие аккаунты в вашей БД</div>
					<div>Формат: email/телефон + пароль</div>
				</div>
			</div>
		</div>
	)
}
