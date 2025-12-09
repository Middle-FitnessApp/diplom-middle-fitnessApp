import React, { useState } from 'react'
import {
	Typography,
	Button,
	Empty,
	Modal,
	Card,
	Spin,
	message,
	Breadcrumb,
	Tag,
	Tooltip,
	Popconfirm,
} from 'antd'
import {
	PlusOutlined,
	ArrowLeftOutlined,
	DeleteOutlined,
	EditOutlined,
	HomeOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate, Link } from 'react-router-dom'
import type { NutritionDay, MealType } from '../../types/nutritions'
import { CreateDayForm } from '../../components/Admin/CreateDayForm'
import {
	useGetSubcategoryDaysQuery,
	useCreateDayMutation,
	useUpdateDayMutation,
	useDeleteDayMutation,
	useGetCategoriesQuery,
} from '../../store/api/nutrition.api'

const { Title, Text } = Typography

export const NutritionPlanTrainer = () => {
	const { category: categoryId, subcategory: subcategoryId } = useParams()
	const navigate = useNavigate()

	const [openedDayId, setOpenedDayId] = useState<string | null>(null)
	const [isDayFormVisible, setIsDayFormVisible] = useState(false)
	const [editingDay, setEditingDay] = useState<NutritionDay | null>(null)

	// API queries
	const {
		data: daysResponse,
		isLoading,
		isError,
		refetch,
	} = useGetSubcategoryDaysQuery(subcategoryId || '', {
		skip: !subcategoryId,
	})

	// Извлекаем days из пагинированного ответа
	const days = daysResponse?.days ?? []

	const { data: categories = [] } = useGetCategoriesQuery()

	// Mutations
	const [createDay, { isLoading: isCreating }] = useCreateDayMutation()
	const [updateDay, { isLoading: isUpdating }] = useUpdateDayMutation()
	const [deleteDay, { isLoading: isDeleting }] = useDeleteDayMutation()

	// Находим информацию о категории и подкатегории
	const currentCategory = categories.find((cat) => cat.id === categoryId)
	const currentSubcategory = currentCategory?.subcategories?.find(
		(sub) => sub.id === subcategoryId,
	)

	const handleAddDay = () => {
		setEditingDay(null)
		setIsDayFormVisible(true)
	}

	const handleEditDay = (day: NutritionDay, e: React.MouseEvent) => {
		e.stopPropagation()
		setEditingDay(day)
		setIsDayFormVisible(true)
	}

	const handleDeleteDay = async (dayId: string, e: React.MouseEvent) => {
		e.stopPropagation()
		try {
			await deleteDay(dayId).unwrap()
			message.success('День удалён')
			if (openedDayId === dayId) {
				setOpenedDayId(null)
			}
		} catch (error: any) {
			message.error(error?.data?.message || 'Ошибка при удалении дня')
		}
	}

	const handleDayClick = (dayId: string) => {
		setOpenedDayId((prev) => (prev === dayId ? null : dayId))
	}

	const handleDayFormCancel = () => {
		setIsDayFormVisible(false)
		setEditingDay(null)
	}

	const handleDayFormSubmit = async (
		dayData:
			| Omit<NutritionDay, 'id' | 'subcatId' | 'createdAt' | 'updatedAt'>
			| NutritionDay,
	) => {
		try {
			if ('id' in dayData && dayData.id && !dayData.id.startsWith('temp_')) {
				// Обновление существующего дня
				await updateDay({
					id: dayData.id,
					dayTitle: dayData.dayTitle,
					dayOrder: dayData.dayOrder,
					meals: dayData.meals.map((meal, index) => ({
						type: meal.type,
						name: meal.name,
						mealOrder: index + 1,
						items: meal.items.filter((item) => item.trim() !== ''),
					})),
				}).unwrap()
				message.success('День обновлён')
			} else {
				// Создание нового дня
				if (!subcategoryId) {
					message.error('Подкатегория не найдена')
					return
				}
				await createDay({
					subcatId: subcategoryId,
					dayTitle: dayData.dayTitle,
					dayOrder: dayData.dayOrder,
					meals: dayData.meals.map((meal, index) => ({
						type: meal.type,
						name: meal.name,
						mealOrder: index + 1,
						items: meal.items.filter((item) => item.trim() !== ''),
					})),
				}).unwrap()
				message.success('День создан')
			}

			setIsDayFormVisible(false)
			setEditingDay(null)
		} catch (error: any) {
			message.error(error?.data?.message || 'Ошибка при сохранении дня')
		}
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
			BREAKFAST: 'orange',
			SNACK: 'green',
			LUNCH: 'blue',
			DINNER: 'purple',
		}
		return colors[type] || 'default'
	}

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Spin size='large' />
			</div>
		)
	}

	if (isError) {
		return (
			<div className='page-container gradient-bg'>
				<div className='page-card'>
					<Empty
						description='Ошибка при загрузке дней'
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					>
						<Button type='primary' onClick={() => refetch()}>
							Попробовать снова
						</Button>
					</Empty>
				</div>
			</div>
		)
	}

	// Сортируем дни по dayOrder
	const sortedDays = [...days].sort((a, b) => a.dayOrder - b.dayOrder)

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card max-w-4xl mx-auto'>
				{/* Breadcrumb */}
				<Breadcrumb
					className='mb-4'
					items={[
						{
							title: (
								<Link to='/admin/nutrition' className='flex items-center'>
									<HomeOutlined className='mr-2' />
									Питание
								</Link>
							),
						},
						{
							title: currentCategory?.name || 'Категория',
						},
						{
							title: currentSubcategory?.name || 'Подкатегория',
						},
					]}
				/>

				{/* Header */}
				<div className='flex items-start justify-between mb-6'>
					<div className='flex items-center gap-4'>
						<Button
							type='text'
							icon={<ArrowLeftOutlined />}
							onClick={() => navigate('/admin/nutrition')}
							className='text-gray-500 hover:text-gray-700'
						/>
						<div>
							<Title level={2} className='m-0'>
								{currentSubcategory?.name || 'План питания'}
							</Title>
							{currentSubcategory?.description && (
								<Text type='secondary' className='text-sm mt-1 block'>
									{currentSubcategory.description}
								</Text>
							)}
						</div>
					</div>
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={handleAddDay}
						loading={isCreating}
					>
						Добавить день
					</Button>
				</div>

				{/* Stats */}
				<div className='mb-6 flex items-center gap-4'>
					<Tag color='blue' className='text-sm px-3 py-1'>
						{sortedDays.length} дней
					</Tag>
					<Tag color='green' className='text-sm px-3 py-1'>
						{sortedDays.reduce((acc, day) => acc + (day.meals?.length || 0), 0)} приёмов пищи
					</Tag>
				</div>

				{/* Days list */}
				{sortedDays.length > 0 ? (
					<div className='flex flex-col gap-4'>
						{sortedDays.map((day) => {
							const meals = day.meals ?? []
							return (
								<Card
									key={day.id}
									className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
										openedDayId === day.id ? 'border-primary shadow-md' : ''
									}`}
									onClick={() => handleDayClick(day.id)}
								>
									<div className='flex justify-between items-start'>
										<div className='flex items-center gap-4 flex-1'>
											<div className='flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg'>
												{day.dayOrder}
											</div>
											<div className='flex-1'>
												<Text strong className='text-lg block'>
													{day.dayTitle}
												</Text>
												<div className='flex flex-wrap gap-2 mt-2'>
													{meals.map((meal) => (
														<Tag key={meal.id} color={getMealTypeColor(meal.type)}>
															{getMealTypeLabel(meal.type)}
														</Tag>
													))}
												</div>
											</div>
										</div>

										<div className='flex items-center gap-2'>
											<Tooltip title='Редактировать'>
												<Button
													type='text'
													icon={<EditOutlined />}
													onClick={(e) => handleEditDay(day, e)}
													loading={isUpdating}
												/>
											</Tooltip>
											<Popconfirm
												title='Удалить день?'
												description='Это действие нельзя отменить'
												onConfirm={(e) => e && handleDeleteDay(day.id, e as any)}
												onCancel={(e) => e?.stopPropagation()}
												okText='Удалить'
												cancelText='Отмена'
											>
												<Tooltip title='Удалить'>
													<Button
														type='text'
														danger
														icon={<DeleteOutlined />}
														onClick={(e) => e.stopPropagation()}
														loading={isDeleting}
													/>
												</Tooltip>
											</Popconfirm>
										</div>
									</div>

									{/* Expanded content */}
									{openedDayId === day.id && (
										<div className='mt-4 pt-4 border-t border-gray-100'>
											{meals.length > 0 ? (
												<div className='space-y-4'>
													{[...meals]
														.sort((a, b) => a.mealOrder - b.mealOrder)
														.map((meal) => (
															<div
																key={meal.id}
																className='bg-gray-50 rounded-lg p-4'
															>
																<div className='flex items-center gap-2 mb-2'>
																	<Tag color={getMealTypeColor(meal.type)}>
																		{getMealTypeLabel(meal.type)}
																	</Tag>
																	<Text strong>{meal.name}</Text>
																</div>
																{meal.items && meal.items.length > 0 ? (
																	<ul className='ml-4 space-y-1'>
																		{meal.items.map((item, index) => (
																			<li
																				key={index}
																				className='text-gray-600 text-sm'
																			>
																				• {item}
																			</li>
																		))}
																	</ul>
																) : (
																	<Text type='secondary' className='text-sm'>
																		Нет элементов
																	</Text>
																)}
															</div>
														))}
												</div>
											) : (
												<Empty
													image={Empty.PRESENTED_IMAGE_SIMPLE}
													description='Нет приёмов пищи'
												/>
											)}
										</div>
									)}
								</Card>
							)
						})}
					</div>
				) : (
					<Card className='text-center py-12'>
						<Empty
							description='В этом плане пока нет дней'
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						>
							<Button
								type='primary'
								icon={<PlusOutlined />}
								onClick={handleAddDay}
								className='mt-4'
							>
								Создать первый день
							</Button>
						</Empty>
					</Card>
				)}

				{/* Modal for creating/editing day */}
				<Modal
					title={editingDay ? 'Редактирование дня' : 'Добавление нового дня'}
					open={isDayFormVisible}
					onCancel={handleDayFormCancel}
					footer={null}
					width={800}
					destroyOnClose
				>
					<CreateDayForm
						day={editingDay}
						existingDays={sortedDays}
						onSubmit={handleDayFormSubmit}
						onCancel={handleDayFormCancel}
					/>
				</Modal>
			</div>
		</div>
	)
}
