import { useState } from 'react'
import { Typography, Button, Form, Input, message, Modal } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { PlusOutlined } from '@ant-design/icons'
import { CreateDayForm } from './components/CreateDayForm'
import type { ProgramDay, NutritionProgram } from '../../types/nutritions'

const { Title } = Typography
const { TextArea } = Input

interface ProgramFormData {
	name: string
	description?: string
}

export const CreateNutritionTrainer = () => {
	const { category } = useParams()
	const navigate = useNavigate()
	const [form] = Form.useForm()
	const [isDayFormVisible, setIsDayFormVisible] = useState(false)
	const [days, setDays] = useState<ProgramDay[]>([])

	const handleSubmit = async (values: ProgramFormData) => {
		try {
			// 1. Сначала создаем программу
			const programData: NutritionProgram = {
				id: '', // сервер сгенерирует
				category_id: category || '',
				name: values.name,
				description: values.description,
				days_count: days.length,
			}

			console.log('Создание программы:', programData)
			// const program = await nutritionApi.createProgram(programData)

			// 2. Потом создаем дни для этой программы
			// for (const day of days) {
			//   await nutritionApi.createDay({
			//     ...day,
			//     program_id: program.id // используем ID созданной программы
			//   })
			// }

			message.success('Программа успешно создана')
			navigate(`/admin/nutrition`)
		} catch (error) {
			message.error('Ошибка при создании программы')
			console.log(error)
		}
	}

	const handleCancel = () => {
		navigate(-1)
	}

	const handleAddDay = () => {
		setIsDayFormVisible(true)
	}

	const handleDayFormCancel = () => {
		setIsDayFormVisible(false)
	}

	const handleDayFormSubmit = (dayData: ProgramDay) => {
		// Корректируем данные дня под нужную структуру
		const correctedDay: ProgramDay = {
			...dayData,
			program_id: '', // будет установлен при создании программы
			day_order: days.length + 1,
			meals: dayData.meals.map((meal) => ({
				...meal,
				day_id: dayData.id,
				items: meal.items.filter((item) => item.trim() !== ''),
			})),
		}

		setDays((prev) => [...prev, correctedDay])
		message.success('День добавлен')
		setIsDayFormVisible(false)
	}

	const handleRemoveDay = (dayId: string) => {
		setDays((prev) => {
			const filtered = prev.filter((day) => day.id !== dayId)
			return filtered.map((day, index) => ({
				...day,
				day_order: index + 1,
			}))
		})
	}

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card max-w-4xl'>
				<div className='section-header'>
					<Title level={2} className='section-title'>
						➕ Создание новой программы
					</Title>
				</div>

				<Form form={form} layout='vertical' onFinish={handleSubmit} className='mt-6'>
					<Form.Item
						name='name'
						label='Название программы'
						rules={[
							{ required: true, message: 'Введите название программы' },
							{ min: 2, message: 'Название должно быть не менее 2 символов' },
						]}
					>
						<Input
							placeholder='Например: Низкоуглеводная диета, Массонабор...'
							size='large'
						/>
					</Form.Item>

					<Form.Item name='description' label='Описание программы'>
						<TextArea placeholder='Опишите программу питания...' rows={3} />
					</Form.Item>

					{/* Секция дней */}
					<div className='mb-6'>
						<div className='flex justify-between items-center mb-4'>
							<Title level={4} className='m-0'>
								Дни программы ({days.length})
							</Title>
							<Button type='primary' icon={<PlusOutlined />} onClick={handleAddDay}>
								Добавить день
							</Button>
						</div>

						{days.length > 0 ? (
							<div className='space-y-3'>
								{days.map((day) => (
									<div
										key={day.id}
										className='p-4 border border-gray-200 rounded-lg bg-white shadow-sm'
									>
										<div className='flex justify-between items-start'>
											<div>
												<div className='font-medium text-lg'>{day.day_title}</div>
												<div className='text-sm text-gray-600 mt-1'>
													Приемов пищи: {day.meals.length} • Порядок: {day.day_order}
												</div>
												<div className='text-xs text-gray-500 mt-2'>
													{day.meals.map((meal) => (
														<div key={meal.id}>
															{meal.name}: {meal.items.length} блюд
														</div>
													))}
												</div>
											</div>
											<Button type='text' danger onClick={() => handleRemoveDay(day.id)}>
												Удалить
											</Button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50'>
								<p className='text-gray-500 mb-3'>Пока нет добавленных дней</p>
								<Button type='primary' onClick={handleAddDay}>
									Добавить первый день
								</Button>
							</div>
						)}
					</div>

					<Form.Item className='mt-8 mb-0'>
						<div className='flex gap-3 justify-end'>
							<Button size='large' onClick={handleCancel}>
								Отмена
							</Button>
							<Button
								type='primary'
								htmlType='submit'
								size='large'
								disabled={days.length === 0}
							>
								Создать программу ({days.length} дней)
							</Button>
						</div>
					</Form.Item>
				</Form>

				<Modal
					title='Добавление нового дня'
					open={isDayFormVisible}
					onCancel={handleDayFormCancel}
					footer={null}
					width={800}
				>
					<CreateDayForm
						onSubmit={handleDayFormSubmit}
						onCancel={handleDayFormCancel}
						programDays={days}
					/>
				</Modal>
			</div>
		</div>
	)
}
