import { Button, Form, Input, Typography, Alert, Spin } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../../store/api/auth.api'
import { setCredentials } from '../../store/slices/auth.slice'
import { useAppDispatch } from '../../store/hooks'
import { useState } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import type { ApiError } from '../../store/types/auth.types'
import { BadRequestState } from '../../components/errors'

export const Login = () => {
	const { Title, Text } = Typography
	const navigate = useNavigate()
	const dispatch = useAppDispatch()

	const [login, { isLoading }] = useLoginMutation()
	const [formError, setFormError] = useState<string | null>(null)
	const [showBadRequestNotification, setShowBadRequestNotification] = useState(false)

	type FieldType = {
		login: string
		password: string
	}

	const onFinish = async (values: FieldType) => {
		try {
			setFormError(null)
			setShowBadRequestNotification(false)

			const loginData = {
				emailOrPhone: values.login,
				password: values.password,
			}

			console.log('Sending login request:', loginData)

			const result = await login(loginData).unwrap()

			console.log('Login successful:', result)

			dispatch(
				setCredentials({
					user: result.user,
					token: result.token.accessToken,
				}),
			)

			if (result.user.role === 'TRAINER' || result.user.role === 'TRAINER') {
				navigate('/admin')
			} else {
				navigate('/me')
			}
		} catch (err: any) {
			console.error('Login error:', err)
			const errorMessage =
				err?.data?.message || err?.data?.error || err?.error || 'Ошибка входа'

			if (err && (err as ApiError)?.status === 400) {
				setShowBadRequestNotification(true)
			} else {
				setFormError(errorMessage)
			}
		}
	}

	return (
		<div className='auth-container gradient-bg'>
			{showBadRequestNotification && (
				<BadRequestState
					title='Вы ввели неверные данные'
					message='Пожалуйста попробуйте снова'
				/>
			)}
			<div className='auth-card'>
				<div className='text-center mb-8'>
					<Title level={2} className='!mb-2 !text-gray-800'>
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

					<Form.Item className='!mb-4'>
						<Button
							type='primary'
							htmlType='submit'
							block
							size='large'
							loading={isLoading}
							className='!rounded-lg !h-12 !text-base font-semibold'
						>
							{isLoading ? <Spin size='small' /> : 'Войти'}
						</Button>
					</Form.Item>

					<div className='text-center space-y-3'>
						<div>
							<Text type='secondary'>Нет аккаунта? </Text>
							<Link
								to='/signup'
								className='!text-primary hover:!text-info font-semibold transition-colors'
							>
								Зарегистрируйтесь
							</Link>
						</div>
					</div>
				</Form>

				{/* Демо-подсказка */}
				<div className='mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200'>
					<Text strong className='!text-blue-800 !mb-2 block'>
						🚀 Для тестирования:
					</Text>
					<div className='text-blue-700 text-sm space-y-1'>
						<div>• Используйте тестовые аккаунты из БД</div>
						<div>• Формат: email/телефон + пароль 123456</div>
					</div>
				</div>
			</div>
		</div>
	)
}
