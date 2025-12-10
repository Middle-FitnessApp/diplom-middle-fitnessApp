import type { FormProps } from 'antd'
import { Button, Form, Input, InputNumber, Typography, Upload, Select, App } from 'antd'
import { REGISTRATION_FIELDS, COMMON_FIELDS } from '../../constants/accountFields'
import { Link, useNavigate } from 'react-router'
import { useRegisterMutation } from '../../store/api/auth.api'
import { useState } from 'react'
import { UploadOutlined, CameraOutlined, DeleteOutlined } from '@ant-design/icons'
import { useAppSelector } from '../../store/hooks'

const { Title, Text } = Typography
const { Dragger } = Upload

// Regex из бэкенда для синхронизации валидации
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^(?:\+7|8)\d{10}$/

// Опции для Select полей
const goalOptions = [
	{ value: 'weight_loss', label: 'Похудение' },
	{ value: 'muscle_gain', label: 'Набор мышечной массы' },
	{ value: 'maintenance', label: 'Поддержание формы' },
	{ value: 'endurance', label: 'Развитие выносливости' },
	{ value: 'rehabilitation', label: 'Реабилитация' },
	{ value: 'other', label: 'Другое' },
]

const experienceOptions = [
	{ value: 'no_experience', label: 'Нет опыта' },
	{ value: 'home_training', label: 'Тренируюсь дома' },
	{ value: 'gym_less_year', label: 'В зале меньше года' },
	{ value: 'gym_more_year', label: 'В зале от 1 года' },
	{ value: 'professional', label: 'Профессиональный спортсмен' },
]

const restrictionsOptions = [
	{ value: 'none', label: 'Нет ограничений' },
	{ value: 'back_problems', label: 'Проблемы со спиной' },
	{ value: 'joint_problems', label: 'Проблемы с суставами' },
	{ value: 'heart_problems', label: 'Сердечно-сосудистые заболевания' },
	{ value: 'diabetes', label: 'Диабет' },
	{ value: 'hypertension', label: 'Гипертония' },
	{ value: 'other', label: 'Другое (укажу в комментарии)' },
]

const dietOptions = [
	{ value: 'regular', label: 'Обычное питание' },
	{ value: 'vegetarian', label: 'Вегетарианство' },
	{ value: 'vegan', label: 'Веганство' },
	{ value: 'keto', label: 'Кето-диета' },
	{ value: 'low_carb', label: 'Низкоуглеводная диета' },
	{ value: 'high_protein', label: 'Высокобелковая диета' },
	{ value: 'other', label: 'Другое' },
]

// Лимиты для числовых полей (синхронизированы с бэкендом)
const LIMITS = {
	age: { min: 14, max: 100 },
	weight: { min: 20, max: 300 },
	height: { min: 100, max: 250 },
	waist: { min: 40, max: 200 },
	chest: { min: 50, max: 200 },
	hips: { min: 50, max: 200 },
	arm: { min: 15, max: 80 },
	leg: { min: 30, max: 100 },
	password: { min: 5, max: 10 },
}

type FieldType = {
	name: string
	emailOrPhone: string
	password: string
	passcheck: string
	age: number
	weight: number
	height: number
	waist: number
	chest: number
	hips: number
	arm: number
	leg: number
	goal: string
	experience: string
	restrictions: string
	diet: string
	photoFront?: File
	photoSide?: File
	photoBack?: File
}

const photoLabels = ['Спереди', 'Сбоку', 'Сзади'] as const
const photoFields = ['photoFront', 'photoSide', 'photoBack'] as const

export const Registration = () => {
	const [register, { isLoading }] = useRegisterMutation()
	const navigate = useNavigate()
	const [photoPreviews, setPhotoPreviews] = useState<{ [key: string]: string }>({})
	const [photoFiles, setPhotoFiles] = useState<{ [key: string]: File }>({})
	const [form] = Form.useForm()
	const theme = useAppSelector((state) => state.ui.theme)
	
	// Используем App.useApp() для контекстного message (fix warning)
	const { message } = App.useApp()

	// Динамические классы для темы
	const cardBgClass = theme === 'dark' ? 'bg-slate-800' : 'bg-light'
	const borderClass = theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
	const titleClass = theme === 'dark' ? 'text-slate-100' : 'text-gray-800'
	const uploadBorderClass = theme === 'dark' ? 'border-slate-600 hover:border-teal-400 hover:bg-slate-700' : 'border-gray-300 hover:border-primary hover:bg-gray-50'

	const handlePhotoUpload = (file: File, fieldName: string) => {
		const reader = new FileReader()
		reader.onload = (e) => {
			setPhotoPreviews((prev) => ({
				...prev,
				[fieldName]: e.target?.result as string,
			}))
		}
		reader.readAsDataURL(file)

		setPhotoFiles((prev) => ({
			...prev,
			[fieldName]: file,
		}))

		form.setFieldValue(fieldName, file)

		return false
	}

	const handlePhotoRemove = (fieldName: string) => {
		setPhotoPreviews((prev) => {
			const newPreviews = { ...prev }
			delete newPreviews[fieldName]
			return newPreviews
		})
		setPhotoFiles((prev) => {
			const newFiles = { ...prev }
			delete newFiles[fieldName]
			return newFiles
		})
		form.setFieldValue(fieldName, undefined)
	}

	const onFinish = async (values: FieldType) => {
		try {
			if (!photoFiles.photoFront || !photoFiles.photoSide || !photoFiles.photoBack) {
				message.error('Пожалуйста, загрузите все три фотографии')
				return
			}

			if (values.password !== values.passcheck) {
				message.error('Пароли не совпадают')
				return
			}

			const formData = new FormData()

			formData.append('name', values.name)
			formData.append('emailOrPhone', values.emailOrPhone)
			formData.append('password', values.password)
			formData.append('age', values.age.toString())
			formData.append('weight', values.weight.toString())
			formData.append('height', values.height.toString())
			formData.append('waist', values.waist.toString())
			formData.append('chest', values.chest.toString())
			formData.append('hips', values.hips.toString())
			formData.append('arm', values.arm.toString())
			formData.append('leg', values.leg.toString())
			formData.append('goal', values.goal)
			formData.append('experience', values.experience)
			formData.append('restrictions', values.restrictions)
			formData.append('diet', values.diet)

			// Добавляем файлы
			formData.append('photoFront', photoFiles.photoFront)
			formData.append('photoSide', photoFiles.photoSide)
			formData.append('photoBack', photoFiles.photoBack)

			const registerData = {
				data: formData,
				role: 'CLIENT' as const,
			}

			const result = await register(registerData).unwrap()
			message.success('Регистрация прошла успешно!')

			// Сохраняем токен
			if (result.token?.accessToken) {
				localStorage.setItem('token', result.token.accessToken)
			}

			// Перенаправляем на главную страницу
			navigate('/')
		} catch (err) {
			console.error('Регистрация не удалась:', err)

			const error = err as {
				data?: { message?: string; error?: string }
				status?: number
			}

			if (error.data?.message) {
				message.error(`Ошибка регистрации: ${error.data.message}`)
			} else if (error.data?.error) {
				message.error(`Ошибка регистрации: ${error.data.error}`)
			} else if (error.status === 400) {
				message.error('Неверные данные для регистрации. Проверьте все поля.')
			} else if (error.status === 409) {
				message.error('Пользователь с таким email/телефоном уже существует')
			} else if (error.status === 500) {
				message.error('Ошибка сервера. Попробуйте позже.')
			} else {
				message.error('Ошибка при регистрации. Проверьте подключение к интернету.')
			}
		}
	}

	const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
		const errorFields = errorInfo.errorFields.map((field) => field.name[0]).join(', ')
		message.error(`Заполните обязательные поля: ${errorFields}`)
	}

	// Валидатор для email или телефона
	const validateEmailOrPhone = (_: unknown, value: string) => {
		if (!value) {
			return Promise.reject('Введите email или телефон')
		}
		if (emailRegex.test(value) || phoneRegex.test(value)) {
			return Promise.resolve()
		}
		return Promise.reject('Введите корректный email или телефон (+7XXXXXXXXXX)')
	}

	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] flex items-center justify-center p-5'>
			<div className={`${cardBgClass} rounded-2xl p-10 shadow-xl border ${borderClass} max-w-[800px] w-full animate-fade-in`}>
				<div className='text-center mb-8'>
					<Title className={`${titleClass}!`}>Создать аккаунт</Title>
					<Text type='secondary' className='text-lg'>
						Присоединяйтесь к фитнес-сообществу
					</Text>
				</div>

				<Form
					form={form}
					name='registration'
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
					autoComplete='off'
					layout='vertical'
					size='large'
					scrollToFirstError
				>
					{/* Секция фото */}
					<div className='mb-8'>
						<Title level={4} className={`${titleClass} font-semibold mb-4 pb-3 border-b-2 inline-block`} style={{ borderColor: 'var(--primary)' }}>
							<CameraOutlined className='mr-2' />
							Фотографии для анализа
						</Title>
						<Text type='secondary' className='block mb-4'>
							Загрузите три фотографии для точного анализа телосложения
						</Text>

						<div className='grid grid-cols-2 gap-4 mb-6'>
							{photoFields.map((photoType, index) => (
								<div key={photoType} className={`border-2 border-dashed ${uploadBorderClass} rounded-xl p-5 text-center cursor-pointer transition-all`}>
									<Form.Item
										name={photoType}
										valuePropName='file'
										getValueFromEvent={(e) => e?.fileList[0]?.originFileObj}
										rules={[
											{
												required: true,
												message: `Загрузите фото ${photoLabels[index].toLowerCase()}`,
											},
										]}
									>
										{photoPreviews[photoType] ? (
											<div className='photo-preview-container'>
												<img
													src={photoPreviews[photoType]}
													alt={`Preview ${photoType}`}
													className='upload-preview'
													style={{
														width: '100%',
														height: '200px',
														objectFit: 'cover',
														borderRadius: '8px',
													}}
												/>
												<div className='photo-preview-overlay'>
													<Text className='block text-white font-medium'>
														{photoLabels[index]}
													</Text>
													<Button
														type='primary'
														danger
														icon={<DeleteOutlined />}
														size='small'
														onClick={() => handlePhotoRemove(photoType)}
														style={{ marginTop: '8px' }}
													>
														Удалить
													</Button>
												</div>
											</div>
										) : (
											<Dragger
												name={photoType}
												multiple={false}
												beforeUpload={(file) => handlePhotoUpload(file, photoType)}
												showUploadList={false}
												accept='image/*'
											>
												<div className='py-4'>
													<UploadOutlined className='text-2xl mb-2' />
													<Text className='block font-medium'>{photoLabels[index]}</Text>
													<Text type='secondary' className='text-sm'>
														Нажмите или перетащите
													</Text>
												</div>
											</Dragger>
										)}
									</Form.Item>
								</div>
							))}
						</div>
					</div>

					{/* Личная информация */}
					<div className='mb-8'>
						<Title level={4} className={`${titleClass} font-semibold mb-4 pb-3 border-b-2 inline-block`} style={{ borderColor: 'var(--primary)' }}>
							👤 Личная информация
						</Title>

						<Form.Item
							name='name'
							label='Имя'
							rules={[
								{ required: true, message: 'Введите имя' },
								{ min: 2, message: 'Имя должно содержать минимум 2 символа' },
								{ max: 50, message: 'Имя не должно превышать 50 символов' },
							]}
						>
							<Input placeholder={COMMON_FIELDS.name} className='rounded-lg' />
						</Form.Item>

						<Form.Item
							name='emailOrPhone'
							label='Email или телефон'
							rules={[{ required: true, validator: validateEmailOrPhone }]}
						>
							<Input
								placeholder='example@mail.ru или +79991234567'
								className='rounded-lg'
							/>
						</Form.Item>

						<Form.Item
							name='age'
							label='Возраст'
							rules={[{ required: true, message: 'Введите возраст' }]}
						>
							<InputNumber
								placeholder='Введите ваш возраст'
								className='rounded-lg'
								style={{ width: '100%' }}
								min={LIMITS.age.min}
								max={LIMITS.age.max}
							/>
						</Form.Item>
					</div>

					{/* Физические параметры */}
					<div className='mb-8'>
						<Title level={4} className={`${titleClass} font-semibold mb-4 pb-3 border-b-2 inline-block`} style={{ borderColor: 'var(--primary)' }}>
							📏 Физические параметры
						</Title>

						<div className='grid grid-cols-2 gap-4'>
							<Form.Item
								name='weight'
								label='Вес, кг'
								rules={[{ required: true, message: 'Введите вес' }]}
							>
								<InputNumber
									placeholder='Вес'
									style={{ width: '100%' }}
									min={LIMITS.weight.min}
									max={LIMITS.weight.max}
								/>
							</Form.Item>

							<Form.Item
								name='height'
								label='Рост, см'
								rules={[{ required: true, message: 'Введите рост' }]}
							>
								<InputNumber
									placeholder='Рост'
									style={{ width: '100%' }}
									min={LIMITS.height.min}
									max={LIMITS.height.max}
								/>
							</Form.Item>
						</div>
					</div>

					{/* Замеры тела */}
					<div className='mb-8'>
						<Title level={4} className={`${titleClass} font-semibold mb-4 pb-3 border-b-2 inline-block`} style={{ borderColor: 'var(--primary)' }}>
							📐 Замеры тела (см)
						</Title>

						<div className='grid grid-cols-2 gap-4'>
							<Form.Item
								name='chest'
								label='Обхват груди'
								rules={[{ required: true, message: 'Введите обхват груди' }]}
							>
								<InputNumber
									placeholder='Обхват груди'
									style={{ width: '100%' }}
									min={LIMITS.chest.min}
									max={LIMITS.chest.max}
								/>
							</Form.Item>

							<Form.Item
								name='waist'
								label='Обхват талии'
								rules={[{ required: true, message: 'Введите обхват талии' }]}
							>
								<InputNumber
									placeholder='Обхват талии'
									style={{ width: '100%' }}
									min={LIMITS.waist.min}
									max={LIMITS.waist.max}
								/>
							</Form.Item>

							<Form.Item
								name='hips'
								label='Обхват бёдер'
								rules={[{ required: true, message: 'Введите обхват бёдер' }]}
							>
								<InputNumber
									placeholder='Обхват бёдер'
									style={{ width: '100%' }}
									min={LIMITS.hips.min}
									max={LIMITS.hips.max}
								/>
							</Form.Item>

							<Form.Item
								name='arm'
								label='Обхват руки'
								rules={[{ required: true, message: 'Введите обхват руки' }]}
							>
								<InputNumber
									placeholder='Обхват руки'
									style={{ width: '100%' }}
									min={LIMITS.arm.min}
									max={LIMITS.arm.max}
								/>
							</Form.Item>

							<Form.Item
								name='leg'
								label='Обхват ноги'
								rules={[{ required: true, message: 'Введите обхват ноги' }]}
							>
								<InputNumber
									placeholder='Обхват ноги'
									style={{ width: '100%' }}
									min={LIMITS.leg.min}
									max={LIMITS.leg.max}
								/>
							</Form.Item>
						</div>
					</div>

					{/* Фитнес цели */}
					<div className='mb-8'>
						<Title level={4} className={`${titleClass} font-semibold mb-4 pb-3 border-b-2 inline-block`} style={{ borderColor: 'var(--primary)' }}>
							🎯 Фитнес информация
						</Title>

						<Form.Item
							name='goal'
							label='Цель тренировок'
							rules={[{ required: true, message: 'Выберите цель' }]}
						>
							<Select
								placeholder={COMMON_FIELDS.goal}
								options={goalOptions}
								size='large'
							/>
						</Form.Item>

						<Form.Item
							name='experience'
							label='Опыт тренировок'
							rules={[{ required: true, message: 'Выберите уровень опыта' }]}
						>
							<Select
								placeholder={COMMON_FIELDS.experience}
								options={experienceOptions}
								size='large'
							/>
						</Form.Item>

						<Form.Item
							name='restrictions'
							label='Ограничения по здоровью'
							rules={[{ required: true, message: 'Выберите ограничения' }]}
						>
							<Select
								placeholder='Выберите ограничения'
								options={restrictionsOptions}
								size='large'
							/>
						</Form.Item>

						<Form.Item
							name='diet'
							label='Тип питания'
							rules={[{ required: true, message: 'Выберите тип питания' }]}
						>
							<Select
								placeholder={COMMON_FIELDS.diet}
								options={dietOptions}
								size='large'
							/>
						</Form.Item>
					</div>

					{/* Пароль */}
					<div className='mb-8'>
						<Title level={4} className={`${titleClass} font-semibold mb-4 pb-3 border-b-2 inline-block`} style={{ borderColor: 'var(--primary)' }}>
							🔐 Безопасность
						</Title>
						<Form.Item
							name='password'
							label='Пароль'
							rules={[
								{ required: true, message: 'Введите пароль' },
								{
									min: LIMITS.password.min,
									message: `Пароль должен быть минимум ${LIMITS.password.min} символов`,
								},
								{
									max: LIMITS.password.max,
									message: `Пароль не должен превышать ${LIMITS.password.max} символов`,
								},
							]}
						>
							<Input.Password
								placeholder={REGISTRATION_FIELDS.password}
								className='rounded-lg'
							/>
						</Form.Item>
						<Form.Item
							name='passcheck'
							label='Подтверждение пароля'
							dependencies={['password']}
							rules={[
								{ required: true, message: 'Повторите пароль' },
								({ getFieldValue }) => ({
									validator(_, value) {
										if (!value || getFieldValue('password') === value) {
											return Promise.resolve()
										}
										return Promise.reject(new Error('Пароли не совпадают'))
									},
								}),
							]}
						>
							<Input.Password
								placeholder={REGISTRATION_FIELDS.passcheck}
								className='rounded-lg'
							/>
						</Form.Item>
					</div>

					<Form.Item>
						<Button
							type='primary'
							htmlType='submit'
							block
							size='large'
							loading={isLoading}
							className='rounded-lg! h-12! text-base! font-semibold'
						>
							Создать аккаунт
						</Button>
					</Form.Item>
				</Form>

				<div className='text-center mt-6'>
					<Text type='secondary'>Уже есть аккаунт? </Text>
					<Link to='/login' className='font-semibold transition-colors' style={{ color: 'var(--primary)' }}>
						Войти
					</Link>
				</div>
			</div>

			<style>{`
				.photo-preview-container {
					position: relative;
					border-radius: 8px;
					overflow: hidden;
				}
				.photo-preview-overlay {
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					background: linear-gradient(transparent, rgba(0,0,0,0.7));
					padding: 16px;
					text-align: center;
				}
			`}</style>
		</div>
	)
}
