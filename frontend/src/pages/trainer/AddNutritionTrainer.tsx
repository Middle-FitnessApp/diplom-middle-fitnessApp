import { useState, useMemo } from 'react'
import {
	Typography,
	Button,
	Select,
	Card,
	message,
	Spin,
	Empty,
	Tag,
	Checkbox,
	Collapse,
	Divider,
	Badge,
} from 'antd'
import {
	ArrowLeftOutlined,
	CheckCircleOutlined,
	CalendarOutlined,
	CoffeeOutlined,
	AppleOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import {
	useGetCategoriesQuery,
	useGetSubcategoryDaysQuery,
	useAssignNutritionPlanMutation,
} from '../../store/api/nutrition.api'
import type { NutritionCategory, NutritionSubcategory, NutritionDay, NutritionMeal } from '../../types/nutritions'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { Panel } = Collapse

// Маппинг типов приёмов пищи на русский
const mealTypeLabels: Record<string, string> = {
	BREAKFAST: 'Завтрак',
	SNACK: 'Перекус',
	LUNCH: 'Обед',
	DINNER: 'Ужин',
}

const mealTypeIcons: Record<string, React.ReactNode> = {
	BREAKFAST: <CoffeeOutlined />,
	SNACK: <AppleOutlined />,
	LUNCH: '🍽️',
	DINNER: '🌙',
}

const mealTypeColors: Record<string, string> = {
	BREAKFAST: '#faad14',
	SNACK: '#52c41a',
	LUNCH: '#1890ff',
	DINNER: '#722ed1',
}

export const AddNutritionTrainer = () => {
	const { id: clientId } = useParams<{ id: string }>()
	const navigate = useNavigate()

	// Состояния для выбора
	const [selectedCategory, setSelectedCategory] = useState<string>('')
	const [selectedSubcategory, setSelectedSubcategory] = useState<string>('')
	const [selectedDayIds, setSelectedDayIds] = useState<string[]>([])
	const [selectAllDays, setSelectAllDays] = useState(true)

	// API запросы
	const {
		data: categories = [],
		isLoading: isLoadingCategories,
		isError: isErrorCategories,
	} = useGetCategoriesQuery()

	const {
		data: days = [],
		isLoading: isLoadingDays,
		isFetching: isFetchingDays,
	} = useGetSubcategoryDaysQuery(selectedSubcategory, {
		skip: !selectedSubcategory,
	})

	const [assignPlan, { isLoading: isAssigning }] = useAssignNutritionPlanMutation()

	// Получаем подкатегории выбранной категории
	const subcategories: NutritionSubcategory[] = useMemo(() => {
		const category = categories.find((cat: NutritionCategory) => cat.id === selectedCategory)
		return category?.subcategories || []
	}, [categories, selectedCategory])

	// Получаем информацию о выбранной подкатегории
	const selectedSubcategoryInfo = useMemo(() => {
		return subcategories.find((sub) => sub.id === selectedSubcategory)
	}, [subcategories, selectedSubcategory])

	// Обработчики изменений
	const handleCategoryChange = (value: string) => {
		setSelectedCategory(value)
		setSelectedSubcategory('')
		setSelectedDayIds([])
		setSelectAllDays(true)
	}

	const handleSubcategoryChange = (value: string) => {
		setSelectedSubcategory(value)
		setSelectedDayIds([])
		setSelectAllDays(true)
	}

	const handleDayToggle = (dayId: string) => {
		setSelectedDayIds((prev) => {
			if (prev.includes(dayId)) {
				return prev.filter((id) => id !== dayId)
			}
			return [...prev, dayId]
		})
		setSelectAllDays(false)
	}

	const handleSelectAllDays = (checked: boolean) => {
		setSelectAllDays(checked)
		if (checked) {
			setSelectedDayIds([])
		}
	}

	const handlePublish = async () => {
		if (!selectedSubcategory) {
			message.error('Выберите программу питания')
			return
		}

		if (!selectAllDays && selectedDayIds.length === 0) {
			message.error('Выберите хотя бы один день или все дни')
			return
		}

		try {
			await assignPlan({
				clientId: clientId!,
				subcategoryId: selectedSubcategory,
				dayIds: selectAllDays ? undefined : selectedDayIds,
			}).unwrap()

			message.success('План питания успешно назначен клиенту!')
			navigate(`/admin/client/${clientId}`)
		} catch (error: any) {
			console.error('Ошибка при назначении плана:', error)
			message.error(error?.data?.message || 'Ошибка при назначении плана питания')
		}
	}

	const handleCancel = () => {
		navigate(-1)
	}

	// Рендер приёма пищи
	const renderMeal = (meal: NutritionMeal) => (
		<div
			key={meal.id}
			className='mb-4 p-4 rounded-xl'
			style={{
				background: `linear-gradient(135deg, ${mealTypeColors[meal.type]}10, ${mealTypeColors[meal.type]}05)`,
				border: `1px solid ${mealTypeColors[meal.type]}30`,
			}}
		>
			<div className='flex items-center gap-2 mb-2'>
				<span style={{ color: mealTypeColors[meal.type], fontSize: '18px' }}>
					{mealTypeIcons[meal.type]}
				</span>
				<Text strong style={{ color: mealTypeColors[meal.type] }}>
					{meal.name || mealTypeLabels[meal.type]}
				</Text>
				<Tag color={mealTypeColors[meal.type]} className='ml-auto'>
					{mealTypeLabels[meal.type]}
				</Tag>
			</div>
			{meal.items && meal.items.length > 0 ? (
				<ul className='list-disc ml-6 mt-2 space-y-1'>
					{meal.items.map((item: string, index: number) => (
						<li key={index} className='text-gray-600'>
							{item}
						</li>
					))}
				</ul>
			) : (
				<Text type='secondary' className='italic'>
					Нет продуктов
				</Text>
			)}
		</div>
	)

	// Рендер дня
	const renderDay = (day: NutritionDay) => {
		const isSelected = selectAllDays || selectedDayIds.includes(day.id)

		return (
			<Card
				key={day.id}
				className={`mb-4 transition-all duration-300 cursor-pointer ${
					isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
				}`}
				onClick={() => !selectAllDays && handleDayToggle(day.id)}
				style={{
					borderColor: isSelected ? '#1890ff' : undefined,
					background: isSelected ? 'linear-gradient(135deg, #e6f7ff, #f0f5ff)' : undefined,
				}}
			>
				<div className='flex items-start justify-between mb-4'>
					<div className='flex items-center gap-3'>
						<div
							className='w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg'
							style={{
								background: 'linear-gradient(135deg, #667eea, #764ba2)',
							}}
						>
							{day.dayOrder}
						</div>
						<div>
							<Title level={5} className='!mb-0'>
								{day.dayTitle}
							</Title>
							<Text type='secondary'>
								{day.meals?.length || 0} приёмов пищи
							</Text>
						</div>
					</div>
					{!selectAllDays && (
						<Checkbox
							checked={isSelected}
							onClick={(e) => e.stopPropagation()}
							onChange={() => handleDayToggle(day.id)}
						/>
					)}
					{isSelected && selectAllDays && (
						<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
					)}
				</div>

				<Collapse ghost>
					<Panel
						header={
							<Text type='secondary' className='text-sm'>
								Показать детали приёмов пищи
							</Text>
						}
						key='1'
					>
						{day.meals && day.meals.length > 0 ? (
							day.meals
								.slice()
								.sort((a, b) => a.mealOrder - b.mealOrder)
								.map(renderMeal)
						) : (
							<Empty description='Нет приёмов пищи' image={Empty.PRESENTED_IMAGE_SIMPLE} />
						)}
					</Panel>
				</Collapse>
			</Card>
		)
	}

	// Состояния загрузки и ошибок
	if (isLoadingCategories) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Spin size='large' tip='Загрузка категорий...' />
			</div>
		)
	}

	if (isErrorCategories) {
		return (
			<div className='page-container gradient-bg'>
				<div className='page-card max-w-4xl'>
					<Empty
						description='Ошибка при загрузке категорий питания'
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					>
						<Button type='primary' onClick={() => navigate(-1)}>
							Вернуться назад
						</Button>
					</Empty>
				</div>
			</div>
		)
	}

	const canAssign = selectedSubcategory && (selectAllDays || selectedDayIds.length > 0)
	const daysCount = selectAllDays ? days.length : selectedDayIds.length

	return (
		<div className='page-container gradient-bg'>
			<div className='page-card max-w-5xl'>
				{/* Заголовок */}
				<div className='section-header'>
					<Button
						type='text'
						icon={<ArrowLeftOutlined />}
						onClick={handleCancel}
						className='!absolute !left-8 !top-8'
					>
						Назад
					</Button>
					<Title level={2} className='section-title'>
						🍽️ Назначение плана питания
					</Title>
					<Paragraph type='secondary' className='max-w-xl mx-auto'>
						Выберите категорию, программу питания и дни, которые хотите назначить клиенту
					</Paragraph>
				</div>

				{/* Селекторы */}
				<Card className='mb-6 card-hover'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{/* Категория */}
						<div>
							<label className='block text-sm font-semibold mb-2 text-gray-700'>
								📁 Категория
							</label>
							<Select
								placeholder='Выберите категорию'
								value={selectedCategory || undefined}
								onChange={handleCategoryChange}
								className='w-full'
								size='large'
								showSearch
								optionFilterProp='children'
							>
								{categories.map((category: NutritionCategory) => (
									<Option key={category.id} value={category.id}>
										<div className='flex items-center justify-between'>
											<span>{category.name}</span>
											<Badge
												count={category.subcategories?.length || 0}
												style={{ backgroundColor: '#667eea' }}
											/>
										</div>
									</Option>
								))}
							</Select>
							{categories.length === 0 && (
								<Text type='secondary' className='text-xs mt-1 block'>
									У вас пока нет категорий питания
								</Text>
							)}
						</div>

						{/* Программа (подкатегория) */}
						<div>
							<label className='block text-sm font-semibold mb-2 text-gray-700'>
								📋 Программа питания
							</label>
							<Select
								placeholder={
									selectedCategory
										? 'Выберите программу'
										: 'Сначала выберите категорию'
								}
								value={selectedSubcategory || undefined}
								onChange={handleSubcategoryChange}
								disabled={!selectedCategory}
								className='w-full'
								size='large'
								showSearch
								optionFilterProp='children'
							>
								{subcategories.map((subcategory) => (
									<Option key={subcategory.id} value={subcategory.id}>
										{subcategory.name}
									</Option>
								))}
							</Select>
							{selectedCategory && subcategories.length === 0 && (
								<Text type='secondary' className='text-xs mt-1 block'>
									В этой категории нет программ
								</Text>
							)}
						</div>
					</div>

					{/* Информация о выбранной программе */}
					{selectedSubcategoryInfo && (
						<div className='mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100'>
							<div className='flex items-center gap-2 mb-2'>
								<CalendarOutlined className='text-blue-500' />
								<Text strong className='text-blue-700'>
									{selectedSubcategoryInfo.name}
								</Text>
							</div>
							{selectedSubcategoryInfo.description && (
								<Text type='secondary'>{selectedSubcategoryInfo.description}</Text>
							)}
						</div>
					)}
				</Card>

				{/* Выбор дней */}
				{selectedSubcategory && (
					<Card className='mb-6'>
						<div className='flex items-center justify-between mb-4'>
							<div>
								<Title level={4} className='!mb-1'>
									📅 Дни питания
								</Title>
								<Text type='secondary'>
									{isLoadingDays || isFetchingDays
										? 'Загрузка дней...'
										: `${days.length} дней в программе`}
								</Text>
							</div>
							<div className='flex items-center gap-4'>
								<Checkbox
									checked={selectAllDays}
									onChange={(e) => handleSelectAllDays(e.target.checked)}
								>
									<Text strong>Назначить все дни</Text>
								</Checkbox>
							</div>
						</div>

						<Divider className='!my-4' />

						{isLoadingDays || isFetchingDays ? (
							<div className='flex justify-center py-8'>
								<Spin size='large' tip='Загрузка дней питания...' />
							</div>
						) : days.length > 0 ? (
							<div className='space-y-4'>
								{!selectAllDays && (
									<div className='p-3 bg-yellow-50 rounded-lg border border-yellow-200 mb-4'>
										<Text type='warning'>
											💡 Нажмите на день, чтобы выбрать или отменить выбор
										</Text>
									</div>
								)}
								{days
									.slice()
									.sort((a, b) => a.dayOrder - b.dayOrder)
									.map(renderDay)}
							</div>
						) : (
							<Empty
								description='В этой программе пока нет дней питания'
								image={Empty.PRESENTED_IMAGE_SIMPLE}
							/>
						)}
					</Card>
				)}

				{/* Итоговая информация и кнопки */}
				<Card className='sticky bottom-4'>
					<div className='flex items-center justify-between'>
						<div>
							{canAssign && (
								<div className='flex items-center gap-2'>
									<CheckCircleOutlined className='text-green-500 text-xl' />
									<div>
										<Text strong className='text-green-700'>
											Готово к назначению
										</Text>
										<Text type='secondary' className='block text-sm'>
											{selectAllDays
												? `Все ${days.length} дней программы`
												: `Выбрано ${daysCount} из ${days.length} дней`}
										</Text>
									</div>
								</div>
							)}
						</div>
						<div className='flex gap-3'>
							<Button size='large' onClick={handleCancel}>
								Отмена
							</Button>
							<Button
								type='primary'
								size='large'
								onClick={handlePublish}
								disabled={!canAssign}
								loading={isAssigning}
								icon={<CheckCircleOutlined />}
							>
								Назначить план
							</Button>
						</div>
					</div>
				</Card>
			</div>
		</div>
	)
}
