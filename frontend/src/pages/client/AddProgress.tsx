import { useState } from 'react'
import {
	Form,
	Typography,
	DatePicker,
	Button,
	Card,
	InputNumber,
	Upload,
	App,
	Divider,
} from 'antd'
import { UploadOutlined, DeleteOutlined, CameraOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router'
import { useAddProgressReportMutation } from '../../store/api/progress.api'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Dragger } = Upload

// Лимиты для числовых полей (синхронизированы с бэкендом)
const LIMITS = {
	weight: { min: 20, max: 300 },
	waist: { min: 40, max: 200 },
	hips: { min: 50, max: 200 },
	height: { min: 100, max: 250 },
	chest: { min: 50, max: 200 },
	arm: { min: 15, max: 80 },
	leg: { min: 30, max: 100 },
}

type ProgressFormValues = {
	date: dayjs.Dayjs
	weight: number
	waist: number
	hips: number
	height?: number
	chest?: number
	arm?: number
	leg?: number
}

const photoLabels = ['Спереди', 'Сбоку', 'Сзади'] as const
const photoFields = ['photoFront', 'photoSide', 'photoBack'] as const

export const AddProgress = () => {
	const [form] = Form.useForm()
	const navigate = useNavigate()
	const { message } = App.useApp()

	const [addProgressReport, { isLoading }] = useAddProgressReportMutation()
	const [photoPreviews, setPhotoPreviews] = useState<{ [key: string]: string }>({})
	const [photoFiles, setPhotoFiles] = useState<{ [key: string]: File }>({})

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
	}

	const onFinish = async (values: ProgressFormValues) => {
		try {
			const formData = new FormData()

			// Форматируем дату в ДД/ММ/ГГГГ (как ожидает бэкенд)
			const formattedDate = values.date.format('DD/MM/YYYY')
			formData.append('date', formattedDate)

			// Обязательные поля
			formData.append('weight', values.weight.toString())
			formData.append('waist', values.waist.toString())
			formData.append('hips', values.hips.toString())

			// Опциональные поля - добавляем только если заполнены
			if (values.height) formData.append('height', values.height.toString())
			if (values.chest) formData.append('chest', values.chest.toString())
			if (values.arm) formData.append('arm', values.arm.toString())
			if (values.leg) formData.append('leg', values.leg.toString())

			// Добавляем фото если есть
			if (photoFiles.photoFront) formData.append('photoFront', photoFiles.photoFront)
			if (photoFiles.photoSide) formData.append('photoSide', photoFiles.photoSide)
			if (photoFiles.photoBack) formData.append('photoBack', photoFiles.photoBack)

			await addProgressReport(formData).unwrap()

			message.success('Отчёт о прогрессе успешно добавлен!')
			navigate('/me/progress')
		} catch (err) {
			if (import.meta.env.DEV) {
				console.error('Не удалось добавить прогресс:', err)
			}

			const error = err as { data?: { message?: string }; status?: number }

			if (error.data?.message) {
				message.error(error.data.message)
			} else if (error.status === 400) {
				message.error('Проверьте правильность введённых данных')
			} else if (error.status === 401) {
				message.error('Необходимо авторизоваться')
				navigate('/login')
			} else {
				message.error('Ошибка при добавлении отчёта. Попробуйте позже.')
			}
		}
	}

	const onFinishFailed = () => {
		message.error('Заполните все обязательные поля')
	}

	// Не даём выбрать дату в будущем
	const disabledDate = (current: dayjs.Dayjs) => {
		return current && current > dayjs().endOf('day')
	}

	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[700px]'>
				<Card className='border-gray-200!'>
					<div className='text-center mb-6'>
						<Title
							level={2}
							className='text-gray-800 font-semibold mb-1 pb-3 border-b-3 border-primary inline-block'
						>
							📊 Добавить прогресс
						</Title>
						<Text type='secondary'>Заполните данные о ваших измерениях</Text>
					</div>

					<Form
						form={form}
						onFinish={onFinish}
						onFinishFailed={onFinishFailed}
						autoComplete='off'
						layout='vertical'
						size='large'
						scrollToFirstError
					>
						{/* Дата */}
						<Form.Item
							name='date'
							label='Дата замера'
							rules={[{ required: true, message: 'Выберите дату замера' }]}
						>
							<DatePicker
								format='DD.MM.YYYY'
								style={{ width: '100%' }}
								placeholder='Выберите дату'
								className='rounded-lg'
								disabledDate={disabledDate}
							/>
						</Form.Item>

						<Divider>Обязательные измерения</Divider>

						{/* Обязательные поля */}
						<div className='grid grid-cols-3 gap-4'>
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
								name='waist'
								label='Талия, см'
								rules={[{ required: true, message: 'Введите обхват талии' }]}
							>
								<InputNumber
									placeholder='Талия'
									style={{ width: '100%' }}
									min={LIMITS.waist.min}
									max={LIMITS.waist.max}
								/>
							</Form.Item>

							<Form.Item
								name='hips'
								label='Бёдра, см'
								rules={[{ required: true, message: 'Введите обхват бёдер' }]}
							>
								<InputNumber
									placeholder='Бёдра'
									style={{ width: '100%' }}
									min={LIMITS.hips.min}
									max={LIMITS.hips.max}
								/>
							</Form.Item>
						</div>

						<Divider>Дополнительные измерения (по желанию)</Divider>

						{/* Опциональные поля */}
						<div className='grid grid-cols-2 gap-4'>
							<Form.Item name='height' label='Рост, см'>
								<InputNumber
									placeholder='Рост'
									style={{ width: '100%' }}
									min={LIMITS.height.min}
									max={LIMITS.height.max}
								/>
							</Form.Item>

							<Form.Item name='chest' label='Грудь, см'>
								<InputNumber
									placeholder='Обхват груди'
									style={{ width: '100%' }}
									min={LIMITS.chest.min}
									max={LIMITS.chest.max}
								/>
							</Form.Item>

							<Form.Item name='arm' label='Рука, см'>
								<InputNumber
									placeholder='Обхват руки'
									style={{ width: '100%' }}
									min={LIMITS.arm.min}
									max={LIMITS.arm.max}
								/>
							</Form.Item>

							<Form.Item name='leg' label='Нога, см'>
								<InputNumber
									placeholder='Обхват ноги'
									style={{ width: '100%' }}
									min={LIMITS.leg.min}
									max={LIMITS.leg.max}
								/>
							</Form.Item>
						</div>

						<Divider>
							<CameraOutlined className='mr-2' />
							Фотоотчёт (по желанию)
						</Divider>

						{/* Фото - опциональные */}
						<div className='grid grid-cols-3 gap-4 mb-6'>
							{photoFields.map((photoType, index) => (
								<div
									key={photoType}
									className='border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer transition-all hover:border-primary hover:bg-gray-50'
								>
									{photoPreviews[photoType] ? (
										<div className='photo-preview-container'>
											<img
												src={photoPreviews[photoType]}
												alt={`Preview ${photoType}`}
												style={{
													width: '100%',
													height: '150px',
													objectFit: 'cover',
													borderRadius: '8px',
												}}
											/>
											<div className='photo-preview-overlay'>
												<Text className='block text-white font-medium text-sm'>
													{photoLabels[index]}
												</Text>
												<Button
													type='primary'
													danger
													icon={<DeleteOutlined />}
													size='small'
													onClick={() => handlePhotoRemove(photoType)}
													style={{ marginTop: '4px' }}
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
											style={{ padding: '12px' }}
										>
											<div className='py-2'>
												<UploadOutlined className='text-xl mb-1' />
												<Text className='block font-medium text-sm'>
													{photoLabels[index]}
												</Text>
												<Text type='secondary' className='text-xs'>
													Нажмите или перетащите
												</Text>
											</div>
										</Dragger>
									)}
								</div>
							))}
						</div>

						<Form.Item className='mb-0!'>
							<Button
								type='primary'
								htmlType='submit'
								block
								loading={isLoading}
								className='h-12! rounded-lg! text-base! font-semibold!'
							>
								Добавить замеры
							</Button>
						</Form.Item>
					</Form>
				</Card>
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
					padding: 12px;
					text-align: center;
				}
			`}</style>
		</div>
	)
}
