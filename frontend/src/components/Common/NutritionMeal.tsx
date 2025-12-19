import React from 'react'
import { Typography } from 'antd'
import { CoffeeOutlined, AppleOutlined } from '@ant-design/icons'
import type { NutritionMeal } from '../../types/nutritions'
import { useAppSelector } from '../../store/hooks'
import { ThemedTag } from './ThemedTag'

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
	const theme = useAppSelector((state) => state.ui.theme)
	const isDark = theme === 'dark'

	const baseColor = mealTypeColors[meal.type] || '#d9d9d9'

	if (variant === 'trainer') {
		// Стиль для тренера - с цветами и градиентами
		return (
			<div
				className='mb-4 p-4 rounded-xl'
				style={{
					background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}05)`,
					border: `1px solid ${baseColor}30`,
				}}
			>
				<div className='flex items-center gap-2 mb-2'>
					<span style={{ color: isDark ? '#ffffff' : baseColor, fontSize: '18px' }}>
						{mealTypeIcons[meal.type]}
					</span>
					<Text
						strong
						style={{ color: isDark ? '#ffffff' : baseColor }}
						className='text-base'
					>
						{meal.name || mealTypeLabels[meal.type]}
					</Text>
					<ThemedTag baseColor={baseColor} isDark={isDark} className='ml-auto'>
						{mealTypeLabels[meal.type]}
					</ThemedTag>
				</div>
				{meal.items && meal.items.length > 0 ? (
					<ul className='list-disc ml-6 mt-2 space-y-1'>
						{meal.items.map((item: string, index: number) => (
							<li key={index} className={isDark ? 'text-slate-300' : 'text-gray-700'}>
								{item}
							</li>
						))}
					</ul>
				) : (
					<Text className={isDark ? 'text-slate-400 italic' : 'text-gray-500 italic'}>
						Нет продуктов
					</Text>
				)}
			</div>
		)
	}

	const titleClass = isDark ? 'text-white' : 'text-gray-800'
	const textClass = isDark ? 'text-slate-300' : 'text-gray-700'
	const emptyClass = isDark ? 'text-slate-400 italic' : 'text-gray-500 italic'

	// Стиль для клиента - более простой
	return (
		<div className='border-l-4 pl-4' style={{ borderColor: baseColor }}>
			<div className={`font-semibold mb-2 text-lg ${titleClass}`}>{meal.name}:</div>

			{meal.items && meal.items.length > 0 ? (
				<ul className='list-disc ml-6 space-y-2'>
					{meal.items.map((item, idx) => (
						<li key={idx} className={`text-base ${textClass}`}>
							{item}
						</li>
					))}
				</ul>
			) : (
				<div className={`text-base ${emptyClass}`}>Информация отсутствует</div>
			)}
		</div>
	)
}
