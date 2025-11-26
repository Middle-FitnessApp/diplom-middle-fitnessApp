import type { FormProps } from 'antd'
import { Button, Form, Input, Typography, Upload, message } from 'antd'
import { MeasurementFields, FitnessFields } from '../../components/forms'
import { REGISTRATION_FIELDS } from '../../constants/accountFields'
import { Link, useNavigate } from 'react-router'
import { useRegisterMutation } from '../../store/api/auth.api'
import { useState } from 'react'
import { UploadOutlined, CameraOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Dragger } = Upload

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

export const Registration = () => {
	const [register, { isLoading }] = useRegisterMutation()
	const navigate = useNavigate()
	const [photoPreviews, setPhotoPreviews] = useState<{ [key: string]: string }>({})
	const [photoFiles, setPhotoFiles] = useState<{ [key: string]: File }>({})
	const [form] = Form.useForm()

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

	const onFinish = async (values: any) => {
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

			console.log('Sending registration data...')

			const registerData = {
				data: formData,
				role: 'CLIENT' as const,
			}

			const result = await register(registerData).unwrap()
			console.log('Registration successful:', result)
			message.success('Регистрация прошла успешно!')

			// Сохраняем токен
			if (result.token?.accessToken) {
				localStorage.setItem('token', result.token.accessToken)
			}

			// Перенаправляем на главную страницу или страницу профиля
			navigate('/')
		} catch (error: any) {
			console.error('Registration failed:', error)

			// Более детальная обработка ошибок
			if (error.data) {
				if (error.data.message) {
					message.error(`Ошибка регистрации: ${error.data.message}`)
				} else if (error.data.error) {
					message.error(`Ошибка регистрации: ${error.data.error}`)
				} else {
					message.error('Ошибка при регистрации. Проверьте введенные данные.')
				}
			} else if (error.status) {
				switch (error.status) {
					case 400:
						message.error(
							'Неверные данные для регистрации. Проверьте все обязательные поля.',
						)
						break
					case 409:
						message.error('Пользователь с таким email/телефоном уже существует')
						break
					case 500:
						message.error('Ошибка сервера. Попробуйте позже.')
						break
					default:
						message.error('Ошибка при регистрации')
				}
			} else {
				message.error('Ошибка сети. Проверьте подключение к интернету.')
			}
		}
	}

	const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
		console.log('Failed:', errorInfo)
		const errorFields = errorInfo.errorFields.map((field) => field.name[0]).join(', ')
		message.error(`Заполните обязательные поля: ${errorFields}`)
	}

	return (
		<div className='auth-container gradient-bg'>
			<div className='auth-card' style={{ maxWidth: '800px' }}>
				<div className='text-center mb-8'>
					<Title>Создать аккаунт</Title>
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
					<div className='form-section'>
						<Title level={4} className='section-title'>
							<CameraOutlined className='mr-2' />
							Фотографии для анализа
						</Title>
						<Text type='secondary' className='block mb-4'>
							Загрузите три фотографии для точного анализа телосложения
						</Text>

						<div className='photo-upload-grid'>
							{['photoFront', 'photoSide', 'photoBack'].map((photoType, index) => (
								<div key={photoType} className='upload-area'>
									<Form.Item
										name={photoType}
										valuePropName='file'
										getValueFromEvent={(e) => e?.fileList[0]?.originFileObj}
										rules={[
											{
												required: true,
												message: `Загрузите фото ${['спереди', 'сбоку', 'сзади'][index]}`,
											},
										]}
									>
										<Dragger
											name={photoType}
											multiple={false}
											beforeUpload={(file) => handlePhotoUpload(file, photoType)}
											showUploadList={false}
											accept='image/*'
											className={photoPreviews[photoType] ? 'has-preview' : ''}
										>
											{photoPreviews[photoType] ? (
												<div>
													<img
														src={photoPreviews[photoType]}
														alt={`Preview ${photoType}`}
														className='upload-preview'
													/>
													<Text className='block mt-2'>
														{['Спереди', 'Сбоку', 'Сзади'][index]}
													</Text>
												</div>
											) : (
												<div className='py-4'>
													<UploadOutlined className='mb-2' />
													<Text className='block'>
														{['Спереди', 'Сбоку', 'Сзади'][index]}
													</Text>
													<Text type='secondary' className='text-sm'>
														Нажмите или перетащите
													</Text>
												</div>
											)}
										</Dragger>
									</Form.Item>
								</div>
							))}
						</div>
					</div>

					{/* Личная информация */}
					<div className='form-section'>
						<Title level={4} className='section-title'>
							👤 Личная информация
						</Title>

						{/* Заменим PersonalInfoFields на конкретные поля */}
						<Form.Item
							name='name'
							label='Имя'
							rules={[{ required: true, message: 'Введите имя' }]}
						>
							<Input placeholder='Введите ваше имя' className='rounded-lg' />
						</Form.Item>

						<Form.Item
							name='emailOrPhone'
							label='Email или телефон'
							rules={[{ required: true, message: 'Введите email или телефон' }]}
						>
							<Input placeholder='example@mail.ru или +7XXX' className='rounded-lg' />
						</Form.Item>

						<Form.Item
							name='age'
							label='Возраст'
							rules={[{ required: true, message: 'Введите возраст' }]}
						>
							<Input
								type='number'
								placeholder='Введите ваш возраст'
								className='rounded-lg'
							/>
						</Form.Item>

						<Form.Item
							name='weight'
							label='Вес (кг)'
							rules={[{ required: true, message: 'Введите вес' }]}
						>
							<Input type='number' placeholder='Введите ваш вес' className='rounded-lg' />
						</Form.Item>

						<Form.Item
							name='height'
							label='Рост (см)'
							rules={[{ required: true, message: 'Введите рост' }]}
						>
							<Input
								type='number'
								placeholder={REGISTRATION_FIELDS.height}
								className='rounded-lg'
							/>
						</Form.Item>
					</div>

					{/* Замеры - оставляем как есть, но проверяем имена полей */}
					<div className='form-section'>
						<Title level={4} className='section-title'>
							📏 Замеры тела
						</Title>
						<MeasurementFields />
					</div>

					{/* Фитнес цели - оставляем как есть */}
					<div className='form-section'>
						<Title level={4} className='section-title'>
							🎯 Фитнес цели
						</Title>
						<FitnessFields />
					</div>

					{/* Медицинская информация - заменяем medicalInfo на restrictions */}
					<div className='form-section'>
						<Title level={4} className='section-title'>
							🏥 Медицинская информация
						</Title>

						{/* Заменим MedicalFields на конкретные поля */}
						<Form.Item
							name='restrictions'
							label='Противопоказания, заболевания и ограничения'
							rules={[
								{ required: true, message: 'Введите информацию о противопоказаниях' },
							]}
						>
							<Input.TextArea
								placeholder='Опишите противопоказания, заболевания и ограничения'
								className='rounded-lg'
								rows={4}
							/>
						</Form.Item>

						<Form.Item
							name='diet'
							label='Текущий рацион питания'
							rules={[{ required: true, message: 'Введите информацию о рационе' }]}
						>
							<Input.TextArea
								placeholder='Опишите ваш текущий рацион питания'
								className='rounded-lg'
								rows={4}
							/>
						</Form.Item>
					</div>

					{/* Пароль */}
					<div className='form-section'>
						<Title level={4} className='section-title'>
							🔐 Безопасность
						</Title>
						<Form.Item
							name='password'
							label='Пароль'
							rules={[
								{ required: true, message: 'Введите пароль!' },
								{ min: 6, message: 'Пароль должен быть не менее 6 символов' },
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
								{ required: true, message: 'Повторите пароль!' },
								({ getFieldValue }) => ({
									validator(_, value) {
										if (!value || getFieldValue('password') === value) {
											return Promise.resolve()
										}
										return Promise.reject(new Error('Пароли не совпадают!'))
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
							className='!rounded-lg !h-12 !text-base font-semibold'
						>
							Создать аккаунт
						</Button>
					</Form.Item>
				</Form>

				<div className='text-center mt-6'>
					<Text type='secondary'>Уже есть аккаунт? </Text>
					<Link
						to='/login'
						className='font-semibold transition-colors'
					>
						Войти
					</Link>
				</div>
			</div>
		</div>
	)
}
