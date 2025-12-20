import React from 'react'
import { Card, Typography, Collapse, Empty, Tag, Button, Tooltip, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { MealCard } from './NutritionMeal'
import type { NutritionDay } from '../../types/nutritions'
import { ThemedTag } from './ThemedTag'

const { Title, Text } = Typography

interface NutritionDayCardProps {
	day: NutritionDay
	variant?: 'trainer' | 'client'
	date?: string
	isToday?: boolean
	showMealsByDefault?: boolean
	onEdit?: (day: NutritionDay, e: React.MouseEvent) => void
	onDelete?: (day: NutritionDay, e: React.MouseEvent) => void
	isDark?: boolean
}

export const NutritionDayCard: React.FC<NutritionDayCardProps> = ({
	day,
	variant = 'client',
	date,
	isToday = false,
	showMealsByDefault = false,
	onEdit,
	onDelete,
	isDark = false,
}) => {
	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr)
		return date.toLocaleDateString('ru-RU', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
		})
	}

	const getMealTypeLabel = (type: string) => {
		switch (type) {
			case 'BREAKFAST':
				return 'Завтрак'
			case 'LUNCH':
				return 'Обед'
			case 'DINNER':
				return 'Ужин'
			case 'SNACK':
				return 'Перекус'
			default:
				return type
		}
	}

	const getMealTypeColor = (type: string) => {
		switch (type) {
			case 'BREAKFAST':
				return '#faad14'
			case 'LUNCH':
				return '#1890ff'
			case 'DINNER':
				return '#722ed1'
			case 'SNACK':
				return '#52c41a'
			default:
				return '#d9d9d9'
		}
	}

	const uniqueTypes = [...new Set(day.meals.map((meal) => meal.type))]

	const titleClass = isDark ? 'text-white' : 'text-gray-800'
	const textSecondaryClass = isDark ? 'text-slate-300' : 'text-gray-500'

	if (variant === 'trainer') {
		// Стиль для тренера - с выбором и интерактивностью
		return (
			<Card className='mb-4 transition-all duration-300 hover:shadow-md'>
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
							<Title level={5} className={`mb-1! ${titleClass}`}>
								{day.dayTitle}
							</Title>
							<div className='flex items-center gap-2 mt-1'>
								<Text className={`text-sm ${textSecondaryClass}`}>
									{day.meals?.length || 0} приёмов пищи
								</Text>
								<div className='flex flex-wrap gap-1'>
									{uniqueTypes.map((type) => (
										<ThemedTag
											key={type}
											baseColor={getMealTypeColor(type)}
											isDark={isDark}
										>
											{getMealTypeLabel(type)}
										</ThemedTag>
									))}
								</div>
							</div>
						</div>
					</div>
					{(onEdit || onDelete) && (
						<div className='flex items-center gap-2'>
							{onEdit && (
								<Tooltip title='Редактировать'>
									<Button
										type='text'
										icon={<EditOutlined />}
										onClick={(e) => onEdit(day, e)}
									/>
								</Tooltip>
							)}
							{onDelete && (
								<Popconfirm
									title='Удалить день?'
									description='Это действие нельзя отменить'
									onConfirm={(e) => e && onDelete(day, e)}
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
										/>
									</Tooltip>
								</Popconfirm>
							)}
						</div>
					)}
				</div>

				<Collapse
					ghost
					defaultActiveKey={showMealsByDefault ? '1' : undefined}
					items={[
						{
							key: '1',
							label: (
								<Text className={`text-sm ${textSecondaryClass}`}>
									Показать детали приёмов пищи
								</Text>
							),
							children:
								day.meals && day.meals.length > 0 ? (
									day.meals
										.slice()
										.sort((a, b) => a.mealOrder - b.mealOrder)
										.map((meal) => (
											<MealCard key={meal.id} meal={meal} variant='trainer' />
										))
								) : (
									<Empty
										description='Нет приёмов пищи'
										image={Empty.PRESENTED_IMAGE_SIMPLE}
									/>
								),
						},
					]}
				/>
			</Card>
		)
	}

	// Стиль для клиента - красивый и информативный
	return (
		<Card className='nutrition-day-card card-hover'>
			<div className='flex items-start justify-between mb-6'>
				<div className='flex items-center gap-4'>
					<div
						className='w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg'
						style={{
							background: 'linear-gradient(135deg, #667eea, #764ba2)',
							boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
						}}
					>
						{day.dayOrder}
					</div>
					<div>
						<Title level={4} className={`mb-1! ${titleClass}`}>
							{day.dayTitle}
						</Title>
						<div className='flex items-center gap-3'>
							<Text className={`text-sm ${textSecondaryClass}`}>
								{day.meals?.length || 0} приёмов пищи
							</Text>
							<div className='flex flex-wrap gap-1'>
								{uniqueTypes.map((type) => (
									<ThemedTag
										key={type}
										baseColor={getMealTypeColor(type)}
										isDark={isDark}
									>
										{getMealTypeLabel(type)}
									</ThemedTag>
								))}
							</div>
							{date && (
								<>
									<span className='text-gray-300'>•</span>
									<Text className={`text-sm ${textSecondaryClass}`}>
										{formatDate(date)}
									</Text>
								</>
							)}
							{isToday && (
								<Tag
									style={{
										backgroundColor: isDark ? '#52c41a' : '#f6ffed',
										borderColor: isDark ? '#52c41a' : '#b7eb8f',
										color: isDark ? '#ffffff' : '#52c41a',
										borderRadius: '4px',
									}}
								>
									Сегодня
								</Tag>
							)}
						</div>
					</div>
				</div>
			</div>

			<Collapse
				ghost
				items={[
					{
						key: '1',
						label: (
							<Text className={`text-sm ${textSecondaryClass}`}>
								Показать детали приёмов пищи
							</Text>
						),
						children:
							day.meals && day.meals.length > 0 ? (
								day.meals
									.slice()
									.sort((a, b) => a.mealOrder - b.mealOrder)
									.map((meal) => <MealCard key={meal.id} meal={meal} variant='trainer' />)
							) : (
								<Empty
									description='Информация отсутствует'
									image={Empty.PRESENTED_IMAGE_SIMPLE}
								/>
							),
					},
				]}
			/>
		</Card>
	)
}
