import React from 'react'
import { Card, Typography, Collapse, Empty, Tag } from 'antd'
import { MealCard } from './NutritionMeal'
import type { NutritionDay } from '../../types/nutritions'

const { Title, Text } = Typography

interface NutritionDayCardProps {
	day: NutritionDay
	variant?: 'trainer' | 'client'
	date?: string
	isToday?: boolean
	showMealsByDefault?: boolean
}

export const NutritionDayCard: React.FC<NutritionDayCardProps> = ({
	day,
	variant = 'client',
	date,
	isToday = false,
	showMealsByDefault = false,
}) => {
	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr)
		return date.toLocaleDateString('ru-RU', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
		})
	}

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
							<Title level={5} className='!mb-0'>
								{day.dayTitle}
							</Title>
							<Text type='secondary'>{day.meals?.length || 0} приёмов пищи</Text>
						</div>
					</div>
				</div>

				<Collapse
					ghost
					defaultActiveKey={showMealsByDefault ? '1' : undefined}
					items={[
						{
							key: '1',
							label: (
								<Text type='secondary' className='text-sm'>
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
						<Title level={4} className='!mb-1 !text-gray-800'>
							{day.dayTitle}
						</Title>
						<div className='flex items-center gap-3'>
							<Text type='secondary' className='text-sm'>
								{day.meals?.length || 0} приёмов пищи
							</Text>
							{date && (
								<>
									<span className='text-gray-300'>•</span>
									<Text type='secondary' className='text-sm'>
										{formatDate(date)}
									</Text>
								</>
							)}
							{isToday && <Tag color='green'>Сегодня</Tag>}
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
							<Text type='secondary' className='text-sm'>
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
