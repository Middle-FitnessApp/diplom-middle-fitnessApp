import { useEffect, useMemo, useRef, useState } from 'react'
import {
	createAndTrackObjectUrl,
	revokeTrackedRefIfMatches,
	revokeTrackedRef,
} from '../../utils/avatarUtils'
import { Form, Input, Button, Card, Typography, Row, Col, Statistic } from 'antd'
import {
	EditOutlined,
	LogoutOutlined,
	SaveOutlined,
	TrophyOutlined,
	FireOutlined,
	CalendarOutlined,
	PhoneOutlined,
	MailOutlined,
	UserOutlined,
	SendOutlined,
	WhatsAppOutlined,
	InstagramOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PROGRESS_METRICS } from '../../constants/progressMetrics'
import { LoadingState, AvatarUploader, ProgressChart } from '../../components'
import {
	useAppDispatch,
	useAppSelector,
	useAuth,
	useCancelTrainerModal,
} from '../../store/hooks'
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
import type { ApiError } from '../../store/types/auth.types'
import { ApiErrorState } from '../../components/errors'
import { API_BASE_URL } from '../../config/api.config'

const { Title, Text } = Typography

export const PersonalAccount = () => {
	const dispatch = useAppDispatch()
	const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
	const theme = useAppSelector((state) => state.ui.theme)
	const isDark = theme === 'dark'

	// Динамические классы для темы
	const cardBgClass = isDark ? 'bg-slate-800' : 'bg-light'
	const borderClass = isDark ? 'border-slate-700' : 'border-gray-200'
	const titleClass = isDark ? 'text-slate-100' : 'text-gray-800'
	const textLightClass = isDark ? 'text-slate-200' : 'text-gray-700'

	const {
		data,
		isLoading: isLoadingUser,
		error,
	} = useGetMeQuery(undefined, {
		skip: !isAuthenticated,
	})

	// Синхронизируем данные из RTK Query с Redux состоянием
	useEffect(() => {
		if (data?.user) {
			// Всегда обновляем Redux состояние свежими данными из API
			dispatch(setUser(data.user))
		}
	}, [data?.user, dispatch])

	// Данные прогресса
	const { data: progressData = [], isLoading: isLoadingProgress } =
		useGetProgressChartDataQuery(undefined, {
			skip: !isAuthenticated || user?.role !== 'CLIENT',
		})

	// Получаем план питания клиента (только если есть тренер)
	const { data: nutritionPlanData } = useGetClientNutritionPlanQuery(
		{ period: 'day' },
		{
			skip: !isAuthenticated || user?.role !== 'CLIENT' || !user?.trainer,
		},
	)

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

	const objectUrlRef = useRef<string | null>(null)

	useEffect(() => {
		return () => revokeTrackedRef(objectUrlRef)
	}, [])

	const [updateClientProfile, { isLoading: isUpdatingClient }] =
		useUpdateClientProfileMutation()
	const [updateTrainerProfile, { isLoading: isUpdatingTrainer }] =
		useUpdateTrainerProfileMutation()
	const [updateClientProfileWithPhoto, { isLoading: isUpdatingClientWithPhoto }] =
		useUpdateClientProfileWithPhotoMutation()
	const [updateTrainerProfileWithPhoto, { isLoading: isUpdatingTrainerWithPhoto }] =
		useUpdateTrainerProfileWithPhotoMutation()

	const isUpdating =
		isUpdatingClient ||
		isUpdatingTrainer ||
		isUpdatingClientWithPhoto ||
		isUpdatingTrainerWithPhoto

	const disabledInputClass = !isEditing
		? isDark
			? '!bg-slate-700 !text-slate-500 !cursor-not-allowed !pointer-events-none'
			: '!bg-gray-100 !text-gray-400 !cursor-not-allowed !pointer-events-none'
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

	// Формируем корректный URL для фото тренера (поддерживаем полные URL, data: и относительные пути)
	const trainerPhotoUrl = useMemo(() => {
		const p = user?.trainer?.photo
		if (!p) return null
		if (p.startsWith('http') || p.startsWith('data:')) return p
		// API_BASE_URL может оканчиваться или не оканчиваться слэшем — нормализуем
		const base = API_BASE_URL?.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
		const path = p.startsWith('/') ? p : `/${p}`
		return `${base}${path}`
	}, [user?.trainer?.photo])

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

	const uploadAvatarImmediately = async (
		file: File | null,
		prevPhoto?: string | null,
		localUrl?: string | null,
	) => {
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
			if (localUrl) revokeTrackedRefIfMatches(objectUrlRef, localUrl)
		} catch (err) {
			const apiError = err as ApiError
			setFormError(apiError?.data?.message || 'Ошибка при загрузке фото')
			setAvatarPreview(null)
			if (prevPhoto !== undefined) {
				dispatch(updateUser({ ...user, photo: prevPhoto }))
			}
			if (localUrl) revokeTrackedRefIfMatches(objectUrlRef, localUrl)
		}
	}

	const { showCancelTrainerModal } = useCancelTrainerModal()

	const handleCancelTrainer = () => {
		showCancelTrainerModal({
			onError: (apiError) => {
				setFormError(apiError?.data?.message || 'Ошибка при отвязке тренера')
			},
		})
	}

	if (isLoadingUser) {
		return <LoadingState message='Загрузка профиля...' />
	}

	if (error) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10'>
				<ApiErrorState
					error={error}
					title='Ошибка загрузки'
					message='Не удалось загрузить данные профиля'
				/>
			</div>
		)
	}

	if (!user) {
		return (
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10'>
				<ApiErrorState
					error={{
						status: 401,
						data: {
							error: { message: 'Пожалуйста, войдите в аккаунт', statusCode: 401 },
						},
					}}
					title='Требуется авторизация'
				/>
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
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div
				className={`${cardBgClass} rounded-2xl p-10 shadow-xl border ${borderClass} w-full max-w-[1000px]`}
			>
				<div className='text-center mb-8'>
					<Title
						level={2}
						className={`${titleClass} font-semibold mb-2 pb-3 border-b-3 inline-block`}
						style={{ borderColor: 'var(--primary)' }}
					>
						👤 Мой профиль
					</Title>
				</div>

				<Row gutter={[24, 24]}>
					{/* Левая колонка - профиль */}
					<Col xs={24} lg={10}>
						<Card
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
											const localUrl = createAndTrackObjectUrl(file, objectUrlRef)
											setAvatarPreview(localUrl)
											const prevPhoto = user.photo ?? null
											dispatch(updateUser({ ...user, photo: localUrl }))
											uploadAvatarImmediately(file, prevPhoto, localUrl)
										}
									}}
								/>

								<Title level={4} className={`mt-4! mb-1! ${titleClass}!`}>
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
											prefix={
												<MailOutlined
													className={isDark ? 'text-slate-500' : 'text-gray-400'}
												/>
											}
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
											prefix={
												<PhoneOutlined
													className={isDark ? 'text-slate-500' : 'text-gray-400'}
												/>
											}
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
									className='h-10! rounded-lg! !text-sm! font-semibold!'
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
								<Row justify='space-between'>
									<Col>
										<Statistic
											title='Отчётов'
											value={totalReports}
											prefix={<CalendarOutlined />}
										/>
									</Col>
									<Col>
										<Statistic
											title='Текущий вес'
											value={lastWeight || '-'}
											suffix='кг'
											prefix={<FireOutlined />}
											valueStyle={{ whiteSpace: 'nowrap' }}
										/>
									</Col>
									<Col>
										<Statistic
											title='Изменение'
											value={
												weightDiff
													? `${Number(weightDiff) > 0 ? '+' : ''}${weightDiff}`
													: '-'
											}
											suffix='кг'
											prefix={<TrophyOutlined style={{ marginRight: 4 }} />}
											valueStyle={{
												color:
													weightDiff && Number(weightDiff) < 0 ? '#52c41a' : '#ff4d4f',
												fontWeight: 'bold',
											}}
										/>
									</Col>
								</Row>
							</Card>
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
							className='mb-4! mt-4!'
							extra={
								<div className='flex gap-2'>
									<Button type='link' onClick={() => navigate('/trainer')}>
										Перейти в чат
									</Button>
									<Button
										color='red'
										variant='solid'
										onClick={handleCancelTrainer}
										loading={isAuthLoading}
									>
										Отвязать тренера
									</Button>
								</div>
							}
						>
							<div className='flex items-start gap-4'>
								{/* Аватар тренера */}
								<div
									className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border-2 ${
										isDark
											? 'bg-slate-700 border-slate-600'
											: 'bg-gray-200 border-gray-300'
									}`}
									style={{
										backgroundImage: trainerPhotoUrl
											? `url(${trainerPhotoUrl})`
											: undefined,
										backgroundSize: 'cover',
										backgroundPosition: 'center',
									}}
								>
									{!trainerPhotoUrl && (
										<UserOutlined
											style={{ fontSize: '32px', color: isDark ? '#64748b' : '#9ca3af' }}
										/>
									)}
								</div>

								<div className='flex-1'>
									<Title level={4} className='mb-1! mt-0!'>
										{user.trainer?.name}
									</Title>
									{user.trainer?.bio && (
										<Text type='secondary' className='block mb-3'>
											{user.trainer.bio}
										</Text>
									)}

									{/* Иконки соцсетей */}
									{(user.trainer?.telegram ||
										user.trainer?.whatsapp ||
										user.trainer?.instagram) && (
										<div className='flex gap-2'>
											{user.trainer?.telegram && (
												<a
													href={`https://t.me/${user.trainer.telegram}`}
													target='_blank'
													rel='noopener noreferrer'
													className={`flex items-center justify-center w-9 h-9 rounded-full border text-blue-500 transition-all ${
														isDark
															? 'border-slate-600 hover:bg-blue-900/30 hover:border-blue-500'
															: 'border-gray-200 hover:bg-blue-50 hover:border-blue-300'
													}`}
													title='Telegram'
												>
													<SendOutlined style={{ fontSize: '16px' }} />
												</a>
											)}
											{user.trainer?.whatsapp && (
												<a
													href={`https://wa.me/${user.trainer.whatsapp}`}
													target='_blank'
													rel='noopener noreferrer'
													className={`flex items-center justify-center w-9 h-9 rounded-full border text-green-500 transition-all ${
														isDark
															? 'border-slate-600 hover:bg-green-900/30 hover:border-green-500'
															: 'border-gray-200 hover:bg-green-50 hover:border-green-300'
													}`}
													title='WhatsApp'
												>
													<WhatsAppOutlined style={{ fontSize: '16px' }} />
												</a>
											)}
											{user.trainer?.instagram && (
												<a
													href={`https://instagram.com/${user.trainer.instagram}`}
													target='_blank'
													rel='noopener noreferrer'
													className={`flex items-center justify-center w-9 h-9 rounded-full border text-pink-500 transition-all ${
														isDark
															? 'border-slate-600 hover:bg-pink-900/30 hover:border-pink-500'
															: 'border-gray-200 hover:bg-pink-50 hover:border-pink-300'
													}`}
													title='Instagram'
												>
													<InstagramOutlined style={{ fontSize: '16px' }} />
												</a>
											)}
										</div>
									)}
								</div>
							</div>
						</Card>
					</>
				) : (
					<>
						<Card className='mb-4! mt-4!'>
							<div className='text-center'>
								<Title level={4} className={`${titleClass}! mb-2!`}>
									⚠️ У вас нет тренера
								</Title>
								<div className='max-w-md mx-auto'>
									<Text className={`${textLightClass}! mb-4! block`}>
										Найдите персонального тренера для достижения ваших целей
									</Text>
									<Button type='primary' onClick={() => navigate('/trainers')}>
										Выбрать тренера
									</Button>
								</div>
							</div>
						</Card>
					</>
				)}

				{/* Информация о плане питания */}

				{nutritionPlanData?.plan ? (
					<Card
						title='🍎 План питания'
						className='mb-4!'
						extra={
							<Button type='link' onClick={() => navigate('/me/nutrition')}>
								Посмотреть план →
							</Button>
						}
					>
						<div className='space-y-2'>
							{nutritionPlanData.plan?.subcategory && (
								<Text strong className='block text-base'>
									{nutritionPlanData.plan.subcategory.name}
								</Text>
							)}
							<div className='flex items-center gap-2'>
								<CalendarOutlined style={{ fontSize: '18px', color: 'var(--primary)' }} />
								<Text>
									День <Text strong>{currentNutritionDay || '-'}</Text> из{' '}
									{nutritionPlanData.plan?.totalDays || 0}
								</Text>
							</div>
						</div>
					</Card>
				) : (
					<Card className='mb-4!'>
						<div className='text-center'>
							<Title level={4} className={`${titleClass}! mb-2!`}>
								⏳ План питания не назначен
							</Title>
							<Text className={`${textLightClass}!`}>
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
