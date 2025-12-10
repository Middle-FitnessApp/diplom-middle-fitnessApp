import { useState } from 'react'
import { Typography, Button, Form, Input, message, Modal, Card, Empty } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import type { NutritionDay, MealType } from '../../types/nutritions'
import { CreateDayForm } from '../../components/Admin/CreateDayForm'
import {
	useCreateSubcategoryWithDaysMutation,
	useGetCategoriesQuery,
} from '../../store/api/nutrition.api'

const { Title, Text } = Typography
const { TextArea } = Input

interface ProgramFormData {
	name: string
	description?: string
}

// Тип для локальных данных дня (до сохранения в БД)
interface LocalDay {
	id: string // временный ID
	dayTitle: string
	dayOrder: number
	meals: LocalMeal[]
}

interface LocalMeal {
	type: MealType
	name: string
	mealOrder: number
	items: string[]
}

export const CreateNutritionTrainer = () => {
	const { category: categoryId } = useParams()
	const navigate = useNavigate()
	const [form] = Form.useForm()
	const [isDayFormVisible, setIsDayFormVisible] = useState(false)
	const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null)
	const [days, setDays] = useState<LocalDay[]>([])

	// API
	const [createSubcategoryWithDays, { isLoading: isCreating }] =
		useCreateSubcategoryWithDaysMutation()
	const { data: categories = [] } = useGetCategoriesQuery()

	// Находим текущую категорию для отображения имени
	const currentCategory = categories.find((cat) => cat.id === categoryId)

	const handleSubmit = async (values: ProgramFormData) => {
		if (!categoryId) {
			message.error('Категория не найдена')
			return
		}

		if (days.length === 0) {
			message.warning('Добавьте хотя бы один день в план питания')
			return
		}

		try {
			// Подготавливаем данные для API
			const daysForApi = days.map((day, index) => ({
				dayTitle: day.dayTitle,
				dayOrder: index + 1,
				meals: day.meals.map((meal, mealIndex) => ({
					type: meal.type,
					name: meal.name,
					mealOrder: mealIndex + 1,
					items: meal.items.filter((item) => item.trim() !== ''),
				})),
			}))

			await createSubcategoryWithDays({
				categoryId,
				name: values.name.trim(),
				description: values.description?.trim() || undefined,
				days: daysForApi,
			}).unwrap()

			message.success('План питания успешно создан!')
			navigate('/admin/nutrition')
		} catch (err) {
			console.error('Ошибка при создании плана:', err)
			const error = err as { data?: { message?: string } }
			message.error(error?.data?.message || 'Ошибка при создании плана питания')
		}
	}

	const handleCancel = () => {
		navigate(-1)
	}

	const handleAddDay = () => {
		setEditingDayIndex(null)
		setIsDayFormVisible(true)
	}

	const handleEditDay = (index: number) => {
		setEditingDayIndex(index)
		setIsDayFormVisible(true)
	}

	const handleDayFormCancel = () => {
		setIsDayFormVisible(false)
		setEditingDayIndex(null)
	}

	const handleDayFormSubmit = (
		dayData:
			| Omit<NutritionDay, 'id' | 'subcatId' | 'createdAt' | 'updatedAt'>
			| NutritionDay,
	) => {
		// Преобразуем в локальный формат
		const localDay: LocalDay = {
			id: 'id' in dayData && dayData.id ? dayData.id : `temp_${Date.now()}`,
			dayTitle: dayData.dayTitle,
			dayOrder: dayData.dayOrder,
			meals: dayData.meals.map((meal) => ({
				type: meal.type,
				name: meal.name,
				mealOrder: meal.mealOrder,
				items: meal.items.filter((item) => item.trim() !== ''),
			})),
		}

		if (editingDayIndex !== null) {
			// Редактирование существующего дня
			setDays((prev) => {
				const updated = [...prev]
				updated[editingDayIndex] = localDay
				return updated
			})
			message.success('День обновлён')
		} else {
			// Добавление нового дня
			setDays((prev) => [
				...prev,
				{
					...localDay,
					dayOrder: prev.length + 1,
				},
			])
			message.success('День добавлен')
		}

		setIsDayFormVisible(false)
		setEditingDayIndex(null)
	}

	const handleRemoveDay = (index: number) => {
		setDays((prev) => {
			const filtered = prev.filter((_, i) => i !== index)
			// Пересчитываем порядок дней
			return filtered.map((day, i) => ({
				...day,
				dayOrder: i + 1,
			}))
		})
		message.success('День удалён')
	}

	const getMealTypeLabel = (type: MealType): string => {
		const labels: Record<MealType, string> = {
			BREAKFAST: 'Завтрак',
			SNACK: 'Перекус',
			LUNCH: 'Обед',
			DINNER: 'Ужин',
		}
		return labels[type] || type
	}

	const getMealTypeColor = (type: MealType): string => {
		const colors: Record<MealType, string> = {
			BREAKFAST: '#fa8c16',
			SNACK: '#52c41a',
			LUNCH: '#1890ff',
			DINNER: '#722ed1',
		}
		return colors[type] || '#666'
	}

	// Преобразуем LocalDay в NutritionDay для формы редактирования
	const getEditingDay = (): NutritionDay | null => {
		if (editingDayIndex === null) return null
		const day = days[editingDayIndex]
		if (!day) return null

		return {
			id: day.id,
			subcatId: '',
			dayTitle: day.dayTitle,
			dayOrder: day.dayOrder,
			meals: day.meals.map((meal, index) => ({
				id: `meal_${index}`,
				dayId: day.id,
				...meal,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}
	}

	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-4xl'>
				{/* Header */}
				<div className='flex items-center gap-4 mb-6'>
					<Button
						type='text'
						icon={<ArrowLeftOutlined />}
						onClick={handleCancel}
						className='text-gray-500 hover:text-gray-700'
					/>
					<div>
						<Title level={2} className='m-0'>
							Создание плана питания
						</Title>
						{currentCategory && (
							<Text type='secondary' className='text-sm'>
								Категория: {currentCategory.name}
							</Text>
						)}
					</div>
				</div>

				<Form form={form} layout='vertical' onFinish={handleSubmit}>
					{/* Основная информация */}
					<Card className='mb-6' title='Основная информация'>
						<Form.Item
							name='name'
							label='Название плана'
							rules={[
								{ required: true, message: 'Введите название плана' },
								{ min: 2, message: 'Название должно быть не менее 2 символов' },
							]}
						>
							<Input
								placeholder='Например: Низкоуглеводная диета, План для набора массы...'
								size='large'
							/>
						</Form.Item>

						<Form.Item name='description' label='Описание плана'>
							<TextArea
								placeholder='Подробное описание плана питания, для кого подходит, особенности...'
								rows={3}
							/>
						</Form.Item>
					</Card>

					{/* Секция дней */}
					<Card
						className='mb-6'
						title={
							<div className='flex justify-between items-center'>
								<span>Дни плана ({days.length})</span>
								<Button type='primary' icon={<PlusOutlined />} onClick={handleAddDay}>
									Добавить день
								</Button>
							</div>
						}
					>
						{days.length > 0 ? (
							<div className='space-y-4'>
								{days.map((day, index) => (
									<Card
										key={day.id}
										size='small'
										className='bg-gray-50 border border-gray-200'
										hoverable
										onClick={() => handleEditDay(index)}
									>
										<div className='flex justify-between items-start'>
											<div className='flex-1'>
												<div className='flex items-center gap-3 mb-2'>
													<span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-medium text-sm'>
														{day.dayOrder}
													</span>
													<Text strong className='text-lg'>
														{day.dayTitle}
													</Text>
												</div>

												<div className='ml-11'>
													<Text type='secondary' className='text-sm'>
														{day.meals.length} приёмов пищи
													</Text>

													<div className='flex flex-wrap gap-2 mt-2'>
														{day.meals.map((meal, mealIndex) => (
															<span
																key={mealIndex}
																className='inline-flex items-center px-2 py-1 rounded text-xs'
																style={{
																	backgroundColor: getMealTypeColor(meal.type) + '20',
																	color: getMealTypeColor(meal.type),
																}}
															>
																{getMealTypeLabel(meal.type)}
																{meal.items.length > 0 && (
																	<span className='ml-1 opacity-70'>
																		({meal.items.length})
																	</span>
																)}
															</span>
														))}
													</div>
												</div>
											</div>

											<Button
												type='text'
												danger
												icon={<DeleteOutlined />}
												onClick={(e) => {
													e.stopPropagation()
													handleRemoveDay(index)
												}}
											/>
										</div>
									</Card>
								))}
							</div>
						) : (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description='Дни ещё не добавлены'
								className='py-8'
							>
								<Button type='primary' icon={<PlusOutlined />} onClick={handleAddDay}>
									Добавить первый день
								</Button>
							</Empty>
						)}
					</Card>

					{/* Кнопки действий */}
					<div className='flex justify-end gap-3'>
						<Button size='large' onClick={handleCancel}>
							Отмена
						</Button>
						<Button
							type='primary'
							htmlType='submit'
							size='large'
							loading={isCreating}
							disabled={days.length === 0}
						>
							{isCreating ? 'Создание...' : `Создать план (${days.length} дней)`}
						</Button>
					</div>
				</Form>

				{/* Модальное окно для добавления/редактирования дня */}
				<Modal
					title={
						editingDayIndex !== null ? 'Редактирование дня' : 'Добавление нового дня'
					}
					open={isDayFormVisible}
					onCancel={handleDayFormCancel}
					footer={null}
					width={800}
					destroyOnClose
				>
					<CreateDayForm
						day={getEditingDay()}
						existingDays={days.map((d) => ({
							id: d.id,
							subcatId: '',
							dayTitle: d.dayTitle,
							dayOrder: d.dayOrder,
							meals: d.meals.map((m, i) => ({
								id: `meal_${i}`,
								dayId: d.id,
								...m,
								createdAt: new Date().toISOString(),
								updatedAt: new Date().toISOString(),
							})),
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
						}))}
						onSubmit={handleDayFormSubmit}
						onCancel={handleDayFormCancel}
					/>
				</Modal>
			</div>
		</div>
	)
}
