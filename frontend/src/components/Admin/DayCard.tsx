// DayCard.tsx
import React from 'react'
import { Card, Button, Typography, Tag } from 'antd'
import { EditOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'
import type { NutritionDay, MealType } from '../../types/nutritions'

const { Title, Text } = Typography

interface DayCardProps {
	day: NutritionDay
	openedDayId: string | null
	onDayClick: (dayId: string) => void
	onEditDay: (day: NutritionDay, e: React.MouseEvent) => void
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

export const DayCard = ({ day, openedDayId, onDayClick, onEditDay }: DayCardProps) => {
	const getDayIcon = (dayId: string) => {
		return openedDayId === dayId ? <DownOutlined /> : <RightOutlined />
	}

	return (
		<Card
			className='bg-light border-muted cursor-pointer hover:shadow-md transition-shadow'
			onClick={() => onDayClick(day.id)}
		>
			<div className='flex justify-between items-center'>
				<div className='flex items-center gap-3'>
					<span className='text-lg'>{getDayIcon(day.id)}</span>
					<div className='flex items-center gap-2'>
						<span className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm'>
							{day.dayOrder}
						</span>
						<Title level={4} className='text-custom m-0'>
							{day.dayTitle}
						</Title>
					</div>
					<Button
						type='text'
						icon={<EditOutlined />}
						onClick={(e) => onEditDay(day, e)}
						className='text-primary hover:text-info'
					/>
				</div>
				<Text type='secondary' className='text-sm'>
					{day.meals.length} приёмов пищи
				</Text>
			</div>

			{openedDayId === day.id && (
				<div className='mt-4 space-y-4'>
					{day.meals
						.sort((a, b) => a.mealOrder - b.mealOrder)
						.map((meal) => (
							<div key={meal.id} className='border-l-4 border-primary pl-4 bg-gray-50 rounded-r-lg p-3'>
								<div className='flex items-center gap-2 mb-2'>
									<Tag color={getMealTypeColor(meal.type)}>{getMealTypeLabel(meal.type)}</Tag>
									<Title level={5} className='text-custom m-0'>
										{meal.name}
									</Title>
								</div>
								{meal.items.length > 0 ? (
									<ul className='list-disc ml-6 text-custom'>
										{meal.items.map((item, index) => (
											<li key={index} className='mb-1 text-sm'>
												{item}
											</li>
										))}
									</ul>
								) : (
									<p className='text-muted text-sm'>Нет элементов</p>
								)}
							</div>
						))}
				</div>
			)}
		</Card>
	)
}
