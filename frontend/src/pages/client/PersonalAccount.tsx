import { useEffect, useMemo, useState } from 'react'
import { Form, Input, Button, Card, Typography, Row, Col, Statistic, Avatar, Tag } from 'antd'
import { EditOutlined, LogoutOutlined, SaveOutlined, TrophyOutlined, FireOutlined, CalendarOutlined, UserOutlined, PhoneOutlined, MailOutlined, MessageOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PROGRESS_METRICS } from '../../constants/progressMetrics'
import { LoadingState, AvatarUploader, ProgressChart } from '../../components'
import { TrainerCard } from '../../components/Client'
import { useAppDispatch, useAuth } from '../../store/hooks'
import {
	useGetMeQuery,
	useUpdateClientProfileMutation,
	useUpdateClientProfileWithPhotoMutation,
	useUpdateTrainerProfileMutation,
	useUpdateTrainerProfileWithPhotoMutation,
} from '../../store/api/user.api'
import { useGetProgressChartDataQuery } from '../../store/api/progress.api'
import { useGetClientNutritionPlanQuery } from '../../store/api/nutrition.api'
import { performLogout, setUser, updateUser } from '../../store/slices/auth.slice'
import type { ApiError, TrainerInfo } from '../../store/types/auth.types'
import { ErrorState, UnauthorizedState } from '../../components/errors'

const { Title, Text } = Typography

// Компонент карточки тренера
const TrainerCard = ({ trainer }: { trainer: TrainerInfo }) => {
	const navigate = useNavigate()
	
	return (
		<Card 
			className='mt-4' 
			size='small'
			style={{ 
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				border: 'none',
			}}
		>
			<div className='flex items-center gap-4'>
				<Avatar 
					size={56} 
					src={trainer.photo} 
					icon={<UserOutlined />}
					style={{ 
						border: '2px solid rgba(255,255,255,0.3)',
						flexShrink: 0
					}}
				/>
				<div className='flex-1 min-w-0'>
					<Text className='!text-white/70 text-xs block'>Ваш тренер</Text>
					<Text strong className='!text-white text-base block truncate'>
						{trainer.name}
					</Text>
					{trainer.bio && (
						<Text className='!text-white/80 text-xs block truncate'>
							{trainer.bio}
						</Text>
					)}
				</div>
				<Button
					type='primary'
					ghost
					icon={<MessageOutlined />}
					onClick={() => navigate('/trainer')}
					style={{ 
						borderColor: 'rgba(255,255,255,0.5)',
						color: 'white'
					}}
				>
					Чат
				</Button>
			</div>
			{/* Социальные сети тренера */}
			{(trainer.telegram || trainer.whatsapp || trainer.instagram) && (
				<div className='flex gap-2 mt-3 pt-3 border-t border-white/20'>
					{trainer.telegram && (
						<Tag 
							color='blue' 
							className='!m-0 cursor-pointer'
							onClick={() => window.open(`https://t.me/${trainer.telegram?.replace('@', '')}`, '_blank')}
						>
							Telegram
						</Tag>
					)}
					{trainer.whatsapp && (
						<Tag 
							color='green' 
							className='!m-0 cursor-pointer'
							onClick={() => window.open(`https://wa.me/${trainer.whatsapp?.replace(/\D/g, '')}`, '_blank')}
						>
							WhatsApp
						</Tag>
					)}
					{trainer.instagram && (
						<Tag 
							color='magenta' 
							className='!m-0 cursor-pointer'
							onClick={() => window.open(`https://instagram.com/${trainer.instagram?.replace('@', '')}`, '_blank')}
						>
							Instagram
						</Tag>
					)}
				</div>
			)}
		</Card>
	)
}

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

	// Данные прогресса
	const { data: progressData = [], isLoading: isLoadingProgress } =
		useGetProgressChartDataQuery(undefined, {
			skip: !isAuthenticated || user?.role !== 'CLIENT',
		})

	// Получаем план питания клиента
	const { data: nutritionPlanData } = useGetClientNutritionPlanQuery(undefined, {
		skip: !isAuthenticated || user?.role !== 'CLIENT',
	})

	// Расчет текущего дня плана питания
	const currentNutritionDay = useMemo(() => {
		if (!nutritionPlanData?.plan?.assignedAt) return null

		const assignedAt = new Date(nutritionPlanData.plan.assignedAt)
		const today = new Date()
		today.setHours(0, 0, 0, 0) // Сбрасываем время для корректного сравнения

		const diffTime = today.getTime() - assignedAt.getTime()
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

		// День начинается с 1, не с 0
		const currentDay = diffDays + 1

		// Если прошло больше дней чем в плане, возвращаем последний день
		const totalDays = nutritionPlanData.plan?.totalDays || 0
		if (currentDay > totalDays && totalDays > 0) {
			return totalDays
		}

		return currentDay > 0 ? currentDay : 1
	}, [nutritionPlanData])

	const initialFormData = useMemo(
		() => ({
			name: user?.name || '',
			email: user?.email || '',
			phone: user?.phone || '',
		}),
		[user?.name, user?.email, user?.phone],
	)
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	const phoneRegex = /^\+?[\d\s-]{10,}$/

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

	const handleLogout = async () => {
		await dispatch(performLogout())
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
		// Валидация: должен быть хотя бы email или телефон
		const hasEmail = formData.email?.trim()
		const hasPhone = formData.phone?.trim()
		if (!hasEmail && !hasPhone) {
			setFormError('Введите email или телефон')
			return
		}
		if (hasEmail && !emailRegex.test(formData.email)) {
			setFormError('Введите корректный email')
			return
		}
		if (hasPhone && !phoneRegex.test(formData.phone)) {
			setFormError('Введите корректный телефон')
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

	// Статистика прогресса
	const totalReports = progressData.length
	const firstWeight = progressData[0]?.weight
	const lastWeight = progressData[progressData.length - 1]?.weight
	const weightDiff =
		firstWeight && lastWeight ? (lastWeight - firstWeight).toFixed(1) : null

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card' style={{ maxWidth: '1000px' }}>
				<div className='section-header'>
					<Title level={2} className='section-title !mb-2'>
						👤 Мой профиль
					</Title>
				</div>

				<Row gutter={[24, 24]}>
					{/* Левая колонка - профиль */}
					<Col xs={24} lg={10}>
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
							<div className='text-center mb-6'>
								<AvatarUploader
									size={100}
									initialUrl={avatarPreview ?? avatarUrl}
									onChange={(file) => {
										if (file) {
											const localUrl = URL.createObjectURL(file)
											setAvatarPreview(localUrl)
											uploadAvatarImmediately(file)
										}
									}}
								/>

								<Title level={4} className='!mt-4 !mb-1 !text-gray-800'>
									{user.name}
								</Title>
								<Text type='secondary'>{user.email || user.phone}</Text>
							</div>

							<Form
								form={form}
								layout='vertical'
								onFinish={onFinish}
								requiredMark={false}
								size='middle'
							>
								<Form.Item label='Имя и Фамилия'>
									<Input
										disabled={!isEditing}
										className={`rounded-lg ${disabledInputClass}`}
										value={formData.name}
										onChange={(e) => handleInputChange('name', e.target.value)}
									/>
								</Form.Item>

								{/* Email поле - показываем если есть или в режиме редактирования */}
								{(user.email || isEditing) && (
									<Form.Item label='Email'>
										<Input
											disabled={!isEditing}
											className={`rounded-lg ${disabledInputClass}`}
											prefix={<MailOutlined className='text-gray-400' />}
											placeholder='example@mail.com'
											value={formData.email}
											onChange={(e) => handleInputChange('email', e.target.value)}
										/>
									</Form.Item>
								)}

								{/* Телефон поле - показываем если есть или в режиме редактирования */}
								{(user.phone || isEditing) && (
									<Form.Item label='Телефон'>
										<Input
											disabled={!isEditing}
											className={`rounded-lg ${disabledInputClass}`}
											prefix={<PhoneOutlined className='text-gray-400' />}
											placeholder='+7 999 123 45 67'
											value={formData.phone}
											onChange={(e) => handleInputChange('phone', e.target.value)}
										/>
									</Form.Item>
								)}

								{formError && (
									<Text type='danger' className='block mb-4'>
										{formError}
									</Text>
								)}

								<Button
									type='primary'
									icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
									className='!h-10 !rounded-lg !text-sm !font-semibold'
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
										? 'Сохранить'
										: 'Редактировать'}
								</Button>
							</Form>
						</Card>

						{/* Статистика */}
						{totalReports > 0 && (
							<Card className='mt-4!' size='small'>
								<Row gutter={16}>
									<Col span={8}>
										<Statistic
											title='Отчётов'
											value={totalReports}
											prefix={<CalendarOutlined />}
										/>
									</Col>
									<Col span={8}>
										<Statistic
											title='Текущий вес'
											value={lastWeight || '-'}
											suffix='кг'
											prefix={<FireOutlined />}
											valueStyle={{ whiteSpace: 'nowrap' }}
										/>
									</Col>
									<Col span={8}>
										<Statistic
											title='Изменение'
											value={
												weightDiff
													? `${Number(weightDiff) > 0 ? '+' : ''}${weightDiff}`
													: '-'
											}
											suffix='кг'
											prefix={<TrophyOutlined />}
											valueStyle={{
												color:
													weightDiff && Number(weightDiff) < 0 ? '#52c41a' : undefined,
											}}
										/>
									</Col>
								</Row>
							</Card>
						)}

						{/* Карточка тренера */}
						{user.trainer && (
							<TrainerCard trainer={user.trainer} />
						)}
					</Col>

					{/* Правая колонка - график прогресса */}
					<Col xs={24} lg={14}>
						<Card
							title='📊 График прогресса'
							className='h-full'
							extra={
								<Button type='link' onClick={() => navigate('/me/progress')}>
									Все отчёты →
								</Button>
							}
						>
							{isLoadingProgress ? (
								<div className='flex justify-center py-10'>
									<LoadingState message='Загрузка данных...' />
								</div>
							) : progressData.length > 0 ? (
								<ProgressChart data={progressData} metrics={PROGRESS_METRICS} compact />
							) : (
								<div className='text-center py-10'>
									<Text type='secondary' className='block mb-4'>
										У вас пока нет отчётов о прогрессе
									</Text>
									<Button
										type='primary'
										onClick={() => navigate('/me/progress/new-report')}
									>
										Создать первый отчёт
									</Button>
								</div>
							)}
						</Card>
					</Col>
				</Row>

				{/* Информация о тренере */}
				{user.trainer ? (
					<>
						<Card
							title='🏋️ Ваш тренер'
							className='h-full mb-4! mt-4!'
							extra={
								<Button type='link' onClick={() => navigate('/trainer')}>
									Перейти в чат →
								</Button>
							}
						>
							<TrainerCard
								trainer={user.trainer}
								isMyTrainer
								onChat={() => navigate('/trainer')}
							/>
						</Card>
					</>
				) : (
					<>
						<Card className='!mb-4 !border-orange-200 !bg-orange-50'>
							<div className='text-center'>
								<Title level={4} className='!text-orange-800 !mb-2'>
									⚠️ У вас нет тренера
								</Title>
								<Text className='!text-orange-700 !mb-4'>
									Найдите персонального тренера для достижения ваших целей
								</Text>
								<Button
									type='primary'
									onClick={() => navigate('/')}
									className='!bg-orange-600 !border-orange-600 hover:!bg-orange-700'
								>
									Выбрать тренера
								</Button>
							</div>
						</Card>
					</>
				)}

				{/* Информация о плане питания */}

				{nutritionPlanData?.plan ? (
					<Card
						title='🍎 План питания'
						className='h-full'
						extra={
							<Button type='link' onClick={() => navigate('/me/nutrition')}>
								Посмотреть план →
							</Button>
						}
					>
						<Row gutter={16}>
							<Col span={12}>
								<Statistic
									title='Программа'
									value={nutritionPlanData.plan.subcategory.name}
									prefix='📋'
								/>
							</Col>
							<Col span={12}>
								<Statistic
									title='Текущий день'
									value={currentNutritionDay || '-'}
									suffix={
										currentNutritionDay
											? `из ${nutritionPlanData.plan?.totalDays || 0}`
											: ''
									}
									prefix='📅'
									valueStyle={{ color: '#52c41a' }}
								/>
							</Col>
						</Row>
					</Card>
				) : (
					<Card className='!mb-4 !border-blue-200 !bg-blue-50'>
						<div className='text-center'>
							<Title level={4} className='!text-blue-800 !mb-2'>
								⏳ План питания не назначен
							</Title>
							<Text className='!text-blue-700'>
								Ваш тренер скоро назначит вам персональный план питания. Пожалуйста,
								подождите.
							</Text>
						</div>
					</Card>
				)}
			</div>
		</div>
	)
}

export default PersonalAccount
