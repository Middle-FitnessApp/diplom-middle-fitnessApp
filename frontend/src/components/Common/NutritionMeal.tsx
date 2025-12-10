import React from 'react'
import { Typography, Tag } from 'antd'
import { CoffeeOutlined, AppleOutlined } from '@ant-design/icons'
import type { NutritionMeal } from '../../types/nutritions'

const { Text } = Typography

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

interface MealCardProps {
	meal: NutritionMeal
	variant?: 'trainer' | 'client'
}

export const MealCard: React.FC<MealCardProps> = ({ meal, variant = 'client' }) => {
	if (variant === 'trainer') {
		// Стиль для тренера - с цветами и градиентами
		return (
			<div
				className='mb-4 p-4 rounded-xl'
				style={{
					background: `linear-gradient(135deg, ${mealTypeColors[meal.type]}10, ${
						mealTypeColors[meal.type]
					}05)`,
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
	}

	// Стиль для клиента - более простой
	return (
		<div className='border-l-4 border-primary pl-4'>
			<div className='font-semibold text-gray-800 mb-2 text-lg'>{meal.name}:</div>

			{meal.items && meal.items.length > 0 ? (
				<ul className='list-disc ml-6 text-gray-700 space-y-2'>
					{meal.items.map((item, idx) => (
						<li key={idx} className='text-base'>
							{item}
						</li>
					))}
				</ul>
			) : (
				<div className='text-gray-500 italic text-base'>Информация отсутствует</div>
			)}
		</div>
	)
}
