import React, { useState, useEffect, useRef } from 'react'
import {
	Typography,
	Button,
	Empty,
	Modal,
	Card,
	Spin,
	message,
	Breadcrumb,
	Pagination,
} from 'antd'
import { PlusOutlined, ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import type { NutritionDay } from '../../types/nutritions'
import { CreateDayForm } from '../../components/Admin/CreateDayForm'
import { NutritionDayCard } from '../../components/Common/NutritionDayCard'
import {
	useGetSubcategoryDaysQuery,
	useCreateDayMutation,
	useUpdateDayMutation,
	useDeleteDayMutation,
	useGetCategoriesQuery,
} from '../../store/api/nutrition.api'
import { MAX_DAYS } from '../../constants/nutritionTrainer'
import { useAppSelector } from '../../store/hooks'
import { ThemedTag } from '../../components'

const { Title, Text } = Typography

// Константа для пагинации дней
const DAYS_PER_PAGE = 10

export const NutritionPlanTrainer = () => {
	const { category: categoryId, subcategory: subcategoryId } = useParams()
	const navigate = useNavigate()

	const [isDayFormVisible, setIsDayFormVisible] = useState(false)
	const [editingDay, setEditingDay] = useState<NutritionDay | null>(null)

	const [searchParams, setSearchParams] = useSearchParams()
	const currentPage = parseInt(searchParams.get('page') || '1', 10)

	const prevSubcategoryIdRef = useRef<string | undefined>()

	const theme = useAppSelector((state) => state.ui.theme)
	const isDark = theme === 'dark'

	useEffect(() => {
		if (prevSubcategoryIdRef.current && prevSubcategoryIdRef.current !== subcategoryId) {
			setSearchParams({ page: '1' })
		}
		prevSubcategoryIdRef.current = subcategoryId
	}, [subcategoryId, setSearchParams])

	// API queries
	const {
		data: daysResponse,
		isLoading,
		isError,
		refetch,
	} = useGetSubcategoryDaysQuery(
		{
			subcategoryId: subcategoryId || '',
			page: currentPage,
			limit: DAYS_PER_PAGE,
		},
		{
			skip: !subcategoryId,
		},
	)

	// Извлекаем days из пагинированного ответа
	const days = daysResponse?.days ?? []

	const { data: categories = [] } = useGetCategoriesQuery()

	// Найти текущую категорию и подкатегорию
	const currentCategory = categories.find((cat) => cat.id === categoryId)
	const currentSubcategory = currentCategory?.subcategories?.find(
		(sub) => sub.id === subcategoryId,
	)
	const [createDay, { isLoading: isCreating }] = useCreateDayMutation()
	const [updateDay] = useUpdateDayMutation()
	const [deleteDay] = useDeleteDayMutation()

	const handlePageChange = (page: number) => {
		setSearchParams({ page: page.toString() })
		// Прокрутка к началу списка дней
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	const handleAddDay = () => {
		setEditingDay(null)
		setIsDayFormVisible(true)
	}

	const handleEditDay = (day: NutritionDay, e: React.MouseEvent) => {
		e.stopPropagation()
		setEditingDay(day)
		setIsDayFormVisible(true)
	}

	const handleDeleteDay = async (day: NutritionDay, e?: React.MouseEvent) => {
		e?.stopPropagation()
		try {
			await deleteDay(day.id).unwrap()
			message.success('День удалён')
		} catch (error: unknown) {
			message.error(error instanceof Error ? error.message : 'Ошибка при удалении дня')
		}
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
		} catch (error: unknown) {
			message.error(error instanceof Error ? error.message : 'Ошибка при сохранении дня')
		}
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
			<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
				<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-[1200px]'>
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

	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div className='bg-light rounded-2xl p-10 shadow-xl border border-gray-200 w-full max-w-4xl'>
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
							title: String(currentCategory?.name || 'Категория'),
						},
						{
							title: String(currentSubcategory?.name || 'Подкатегория'),
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
							<Title level={2} className={isDark ? 'text-white' : 'text-gray-800'}>
								{String(currentSubcategory?.name || 'План питания')}
							</Title>
							{currentSubcategory?.description && (
								<Text className={isDark ? 'text-slate-300' : 'text-sm mt-1 block'}>
									{String(currentSubcategory.description)}
								</Text>
							)}
						</div>
					</div>
					{(daysResponse?.pagination?.total || 0) < MAX_DAYS && (
						<Button
							type='primary'
							icon={<PlusOutlined />}
							onClick={handleAddDay}
							loading={isCreating}
						>
							Добавить день
						</Button>
					)}
				</div>

				{/* Stats */}
				<div className='mb-6 flex items-center gap-4'>
					<ThemedTag baseColor='#1890ff' isDark={isDark} className='text-sm px-3 py-1'>
						{String(daysResponse?.pagination?.total || 0)} дней
					</ThemedTag>
					<ThemedTag baseColor='#52c41a' isDark={isDark} className='text-sm px-3 py-1'>
						{String(days.reduce((acc, day) => acc + day.meals.length, 0))} приёмов пищи
					</ThemedTag>
				</div>

				{/* Days list */}
				{days.length > 0 ? (
					<>
						<div className='space-y-4!'>
							{days.map((day) => (
								<NutritionDayCard
									key={day.id}
									day={day}
									variant='trainer'
									onEdit={handleEditDay}
									onDelete={handleDeleteDay}
									isDark={isDark}
								/>
							))}
						</div>

						{(daysResponse?.pagination?.total || 0) > DAYS_PER_PAGE && (
							<div className='flex justify-center mt-8'>
								<Pagination
									current={currentPage}
									total={daysResponse?.pagination?.total || 0}
									pageSize={DAYS_PER_PAGE}
									onChange={handlePageChange}
									showSizeChanger={false}
									showTotal={(total) => `Всего ${total} дней`}
								/>
							</div>
						)}
					</>
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
						existingDays={days}
						onSubmit={handleDayFormSubmit}
						onCancel={handleDayFormCancel}
					/>
				</Modal>
			</div>
		</div>
	)
}
