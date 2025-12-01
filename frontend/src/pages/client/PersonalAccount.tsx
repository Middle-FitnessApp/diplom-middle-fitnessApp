import { useEffect, useMemo, useState } from 'react'
import { Form, Input, Button, Card, Typography } from 'antd'
import { EditOutlined, LogoutOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ACCOUNT_FIELDS } from '../../constants/accountFields'
import { LoadingState, AvatarUploader } from '../../components'
import { useAppDispatch, useAuth } from '../../store/hooks'
import {
	useGetMeQuery,
	useUpdateClientProfileMutation,
	useUpdateClientProfileWithPhotoMutation,
	useUpdateTrainerProfileMutation,
	useUpdateTrainerProfileWithPhotoMutation,
} from '../../store/api/user.api'
import { logout, setUser, updateUser } from '../../store/slices/auth.slice'
import type { ApiError } from '../../store/types/auth.types'
import { ErrorState, UnauthorizedState } from '../../components/errors'

const { Title, Text } = Typography

export const PersonalAccount = () => {
	const dispatch = useAppDispatch()
	const { user, isAuthenticated } = useAuth()
	const {
		data,
		isLoading: isLoadingUser,
		error,
	} = useGetMeQuery(undefined, {
		skip: !isAuthenticated,
	})
	const initialFormData = useMemo(
		() => ({
			name: user?.name || '',
			email: user?.email || '',
			phone: user?.phone || '',
		}),
		[user?.name, user?.email, user?.phone],
	)
	const loginRegex = /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|\+?[\d\s-]{10,})$/

	const [formData, setFormData] = useState(initialFormData)
	const [formError, setFormError] = useState<string | null>(null)
	const navigate = useNavigate()
	const [form] = Form.useForm()
	const [isEditing, setIsEditing] = useState(false)
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

	const [updateClientProfile, { isLoading: isUpdatingClient }] =
		useUpdateClientProfileMutation()
	const [updateTrainerProfile, { isLoading: isUpdatingTrainer }] =
		useUpdateTrainerProfileMutation()
	const [updateClientProfileWithPhoto, { isLoading: isUpdatingClientWithPhoto }] =
		useUpdateClientProfileWithPhotoMutation()
	const [updateTrainerProfileWithPhoto, { isLoading: isUpdatingTrainerWithPhoto }] =
		useUpdateTrainerProfileWithPhotoMutation()

	const disabledInputClass = !isEditing
		? '!bg-gray-100 !text-gray-400 !cursor-not-allowed !pointer-events-none'
		: ''

	useEffect(() => {
		setFormData(initialFormData)
	}, [initialFormData])

	useEffect(() => {
		if (data?.user) {
			dispatch(setUser(data.user))
		}
	}, [data, dispatch])

	useEffect(() => {
		if (user?.photo) {
			setAvatarUrl(user.photo)
		}
	}, [user?.photo])

	const handleLogout = () => {
		dispatch(logout())
		navigate('/login')
	}

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
		setFormError(null)
	}

	const onFinish = async () => {
		if (!user) return

		setFormError(null)

		if (!formData.name.trim()) {
			setFormError('Введите имя')
			return
		}
		const loginValue = formData.email || formData.phone || ''
		if (!loginValue.trim()) {
			setFormError('Введите email или телефон')
			return
		}
		if (!loginRegex.test(loginValue)) {
			setFormError('Введите корректный email или телефон')
			return
		}

		try {
			const changedFields: Record<string, string> = {}

			if (formData.name !== user.name) changedFields.name = formData.name
			if (formData.email !== (user.email || '')) changedFields.email = formData.email
			if (formData.phone !== (user.phone || '')) changedFields.phone = formData.phone

			if (Object.keys(changedFields).length === 0) {
				setIsEditing(false)
				return
			}

			const result =
				user.role === 'TRAINER'
					? await updateTrainerProfile(changedFields).unwrap()
					: await updateClientProfile(changedFields).unwrap()

			dispatch(updateUser(result.user))
			setIsEditing(false)
		} catch (err) {
			const apiError = err as ApiError
			setFormError(apiError?.data?.message || 'Ошибка при сохранении данных')
		}
	}

	const uploadAvatarImmediately = async (file: File | null) => {
		if (!file || !user) return

		setFormError(null)
		const f = new FormData()
		f.append('photo', file)
		f.append('name', formData.name || user.name || '')
		if (formData.email?.trim()) {
			f.append('email', formData.email)
		}
		if (formData.phone?.trim()) {
			f.append('phone', formData.phone)
		}

		try {
			const result =
				user.role === 'TRAINER'
					? await updateTrainerProfileWithPhoto(f).unwrap()
					: await updateClientProfileWithPhoto(f).unwrap()

			dispatch(updateUser(result.user))
			const safePhotoUrl = result.user.photo
				? '/uploads/photos/' + encodeURIComponent(result.user.photo.split('/photos/')[1])
				: null

			setAvatarUrl(safePhotoUrl)
			setAvatarPreview(null)
		} catch (err) {
			const apiError = err as ApiError
			setFormError(apiError?.data?.message || 'Ошибка при загрузке фото')
			setAvatarPreview(null)
		}
	}

	const isUpdating =
		isUpdatingClient ||
		isUpdatingTrainer ||
		isUpdatingClientWithPhoto ||
		isUpdatingTrainerWithPhoto

	if (isLoadingUser) {
		return <LoadingState message='Загрузка профиля...' />
	}

	if (error && (error as ApiError)?.status === 401) {
		return <UnauthorizedState />
	}

	if (error) {
		return (
			<div className='page-container gradient-bg'>
				<div className='page-card' style={{ maxWidth: '500px' }}>
					<ErrorState
						title='Ошибка загрузки'
						message='Не удалось загрузить данные профиля'
						onRetry={() => window.location.reload()}
						showRetryButton={true}
					/>
				</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className='page-container gradient-bg'>
				<div className='page-card' style={{ maxWidth: '500px' }}>
					<ErrorState
						title='Ошибка загрузки'
						message='Пожалуйста, войдите в аккаунт'
						onRetry={() => navigate('/login')}
						showRetryButton={true}
						buttonText='Войти'
					/>
				</div>
			</div>
		)
	}

	if (user.role === 'TRAINER') {
		navigate('/admin')
		return null
	}

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card' style={{ maxWidth: '600px' }}>
				<Card
					className='!border !border-gray-200'
					actions={[
						<Button
							type='text'
							icon={<LogoutOutlined />}
							onClick={handleLogout}
							danger
							key='logout'
							size='large'
						>
							Выйти
						</Button>,
					]}
				>
					<div className='text-center mb-8'>
						<AvatarUploader
							size={120}
							initialUrl={avatarPreview ?? avatarUrl}
							onChange={(file) => {
								if (file) {
									const localUrl = URL.createObjectURL(file)
									setAvatarPreview(localUrl)
									uploadAvatarImmediately(file)
								}
							}}
						/>

						<Title level={3} className='!mt-4 !mb-1 !text-gray-800'>
							{user.name}
						</Title>
						<Text type='secondary' className='text-lg !mb-1'>
							{user.email || user.phone}
						</Text>
					</div>

					<Form
						form={form}
						layout='vertical'
						onFinish={onFinish}
						requiredMark={false}
						size='large'
					>
						<Form.Item label='Имя и Фамилия'>
							<Input
								disabled={!isEditing}
								className={`rounded-lg ${disabledInputClass}`}
								value={formData.name}
								onChange={(e) => handleInputChange('name', e.target.value)}
							/>
						</Form.Item>

						<Form.Item label={ACCOUNT_FIELDS.login || 'Email или телефон'}>
							<Input
								disabled={!isEditing}
								className={`rounded-lg ${disabledInputClass}`}
								value={formData.email || formData.phone}
								onChange={(e) => {
									const value = e.target.value
									if (value.includes('@')) {
										handleInputChange('email', value)
										handleInputChange('phone', '')
									} else {
										handleInputChange('phone', value)
										handleInputChange('email', '')
									}
								}}
							/>
						</Form.Item>

						{formError && (
							<Text type='danger' className='block mb-4'>
								{formError}
							</Text>
						)}

						<Button
							type='primary'
							icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
							className='!h-12 !rounded-lg !text-base !font-semibold'
							block
							onClick={() => {
								if (isEditing) {
									form.submit()
								} else setIsEditing(true)
							}}
						>
							{isUpdating
								? 'Сохранение...'
								: isEditing
								? 'Сохранить изменения'
								: 'Редактировать профиль'}
						</Button>
					</Form>
				</Card>
			</div>
		</div>
	)
}

export default PersonalAccount
