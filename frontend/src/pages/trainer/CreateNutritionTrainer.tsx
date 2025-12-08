import { useState } from 'react'
import { Typography, Button, Form, Input, message, Modal } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { PlusOutlined } from '@ant-design/icons'
import type { NutritionDay, NutritionSubcategory } from '../../types/nutritions'
import { CreateDayForm } from '../../components/Admin/CreateDayForm'

const { Title } = Typography
const { TextArea } = Input

interface ProgramFormData {
	name: string
	description?: string
}

export const CreateNutritionTrainer = () => {
	const { categoryId } = useParams()
	const navigate = useNavigate()
	const [form] = Form.useForm()
	const [isDayFormVisible, setIsDayFormVisible] = useState(false)
	const [days, setDays] = useState<NutritionDay[]>([])

	const handleSubmit = async (values: ProgramFormData) => {
		try {
			// 1. Сначала создаем подкатегорию
			const nutritionSubcategoryData: Omit<
				NutritionSubcategory,
				'id' | 'createdAt' | 'updatedAt'
			> = {
				categoryId: categoryId || '',
				name: values.name,
				description: values.description,
				days: [], // пока пустой массив
			}

			console.log('Создание подкатегории:', nutritionSubcategoryData)
			const mockSubcategoryId = 'subcat_' + Date.now()

			// 2. Создаем дни
			const daysWithSubcatId = days.map((day) => ({
				...day,
				subcatId: mockSubcategoryId,
				id: 'day_' + Date.now() + '_' + Math.random(),
			}))

			console.log('Дни для создания:', daysWithSubcatId)

			message.success('Подкатегория успешно создана')
			navigate(`/admin/nutrition`)
		} catch (error) {
			message.error('Ошибка при создании подкатегории')
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

	const handleDayFormSubmit = (
		dayData: Omit<NutritionDay, 'id' | 'subcatId' | 'createdAt' | 'updatedAt'>,
	) => {
		// Создаем день с временными ID
		const correctedDay: NutritionDay = {
			...dayData,
			id: 'day_temp_' + Date.now() + '_' + Math.random(),
			subcatId: '',
			dayOrder: days.length + 1,
			meals: dayData.meals.map((meal, index) => ({
				...meal,
				id: 'meal_temp_' + Date.now() + '_' + index,
				dayId: 'day_temp_' + Date.now() + '_' + Math.random(),
				items: meal.items.filter((item) => item.trim() !== ''),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		setDays((prev) => [...prev, correctedDay])
		message.success('День добавлен')
		setIsDayFormVisible(false)
	}

	const handleRemoveDay = (dayId: string) => {
		setDays((prev) => {
			const filtered = prev.filter((day) => day.id !== dayId)
			// Обновляем порядок дней
			return filtered.map((day, index) => ({
				...day,
				dayOrder: index + 1,
			}))
		})
	}

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card max-w-4xl'>
				<div className='section-header'>
					<Title level={2} className='section-title'>
						➕ Создание новой подкатегории
					</Title>
					<p className='text-gray-600 mt-2'>Категория: {categoryId}</p>
				</div>

				<Form form={form} layout='vertical' onFinish={handleSubmit} className='mt-6'>
					<Form.Item
						name='name'
						label='Название подкатегории'
						rules={[
							{ required: true, message: 'Введите название подкатегории' },
							{ min: 2, message: 'Название должно быть не менее 2 символов' },
						]}
					>
						<Input
							placeholder='Например: Низкоуглеводная диета, Массонабор...'
							size='large'
						/>
					</Form.Item>

					<Form.Item name='description' label='Описание подкатегории'>
						<TextArea placeholder='Опишите подкатегорию питания...' rows={3} />
					</Form.Item>

					{/* Секция дней */}
					<div className='mb-6'>
						<div className='flex justify-between items-center mb-4'>
							<Title level={4} className='m-0'>
								Дни подкатегории ({days.length})
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
												<div className='font-medium text-lg'>{day.dayTitle}</div>
												<div className='text-sm text-gray-600 mt-1'>
													Приемов пищи: {day.meals.length} • Порядок: {day.dayOrder}
												</div>
												<div className='text-xs text-gray-500 mt-2'>
													{day.meals.map((meal) => (
														<div key={meal.id} className='mb-1'>
															<span className='font-medium'>{meal.name}</span> (
															{meal.type.toLowerCase()}):
															{meal.items.map((item, idx) => (
																<span key={idx} className='ml-2'>
																	{item}
																</span>
															))}
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
								Создать подкатегорию ({days.length} дней)
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
					{/* Исправленный пропс: programDays -> existingDays */}
					<CreateDayForm
						onSubmit={handleDayFormSubmit}
						onCancel={handleDayFormCancel}
						existingDays={days}
					/>
				</Modal>
			</div>
		</div>
	)
}
