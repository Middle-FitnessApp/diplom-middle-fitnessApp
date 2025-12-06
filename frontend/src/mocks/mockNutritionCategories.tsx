import type { NutritionCategory } from '../types/nutritions'
import { mockNutritionDays } from './mockProgramDays'

export const mockCategories: NutritionCategory[] = [
	{
		id: 'cat_1',
		trainerId: 'trainer_1',
		name: 'Похудение',
		description: 'Программы для снижения веса',
		subcategories: [
			{
				id: 'subcat_1_1',
				categoryId: 'cat_1',
				name: 'Низкоуглеводная диета',
				description: 'Снижение веса за счет ограничения углеводов',
				days: mockNutritionDays.filter((day) => day.subcatId === 'subcat_1_1'), // 2 дня
				createdAt: '2024-01-10T10:00:00.000Z',
				updatedAt: '2024-01-10T10:00:00.000Z',
			},
			{
				id: 'subcat_1_2',
				categoryId: 'cat_1',
				name: 'Интервальное голодание',
				description: '16/8 - 16 часов голодания, 8 часов питания',
				days: [], // нет дней
				createdAt: '2024-01-15T14:30:00.000Z',
				updatedAt: '2024-01-15T14:30:00.000Z',
			},
		],
		createdAt: '2024-01-01T08:00:00.000Z',
		updatedAt: '2024-01-01T08:00:00.000Z',
	},
	{
		id: 'cat_2',
		trainerId: 'trainer_1',
		name: 'Набор массы',
		description: 'Программы для увеличения мышечной массы',
		subcategories: [
			{
				id: 'subcat_2_1',
				categoryId: 'cat_2',
				name: 'Массонабор 3500 ккал',
				description: 'Высококалорийная программа для эктоморфов',
				days: mockNutritionDays.filter((day) => day.subcatId === 'subcat_2_1'), // 1 день
				createdAt: '2024-01-20T09:15:00.000Z',
				updatedAt: '2024-01-20T09:15:00.000Z',
			},
		],
		createdAt: '2024-01-05T11:00:00.000Z',
		updatedAt: '2024-01-05T11:00:00.000Z',
	},
]
