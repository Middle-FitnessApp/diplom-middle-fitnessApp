import type { NutritionDay } from '../types/nutritions'

export const mockNutritionDays: NutritionDay[] = [
	// Дни для subcat_1_1
	{
		id: 'day_1',
		subcatId: 'subcat_1_1',
		dayTitle: 'День 1',
		dayOrder: 1,
		meals: [
			{
				id: 'meal_1_1',
				dayId: 'day_1',
				type: 'BREAKFAST',
				name: 'Завтрак',
				mealOrder: 1,
				items: ['Яичница из двух яиц', 'Огурец свежий', 'Болгарский перец'],
				createdAt: '2024-01-10T08:00:00.000Z',
				updatedAt: '2024-01-10T08:00:00.000Z',
			},
			{
				id: 'meal_1_2',
				dayId: 'day_1',
				type: 'LUNCH',
				name: 'Обед',
				mealOrder: 2,
				items: ['Куриная грудка на гриле'],
				createdAt: '2024-01-10T08:00:00.000Z',
				updatedAt: '2024-01-10T08:00:00.000Z',
			},
		],
		createdAt: '2024-01-10T08:00:00.000Z',
		updatedAt: '2024-01-10T08:00:00.000Z',
	},
	{
		id: 'day_2',
		subcatId: 'subcat_1_1',
		dayTitle: 'День 2',
		dayOrder: 2,
		meals: [
			{
				id: 'meal_2_1',
				dayId: 'day_2',
				type: 'BREAKFAST',
				name: 'Завтрак',
				mealOrder: 1,
				items: ['Овсянка на воде'],
				createdAt: '2024-01-10T08:00:00.000Z',
				updatedAt: '2024-01-10T08:00:00.000Z',
			},
		],
		createdAt: '2024-01-10T08:00:00.000Z',
		updatedAt: '2024-01-10T08:00:00.000Z',
	},
	// День для subcat_2_1
	{
		id: 'day_3',
		subcatId: 'subcat_2_1',
		dayTitle: 'День 1 - Набор',
		dayOrder: 1,
		meals: [
			{
				id: 'meal_3_1',
				dayId: 'day_3',
				type: 'BREAKFAST',
				name: 'Завтрак',
				mealOrder: 1,
				items: ['Омлет из 4 яиц', 'Бананы'],
				createdAt: '2024-01-20T09:15:00.000Z',
				updatedAt: '2024-01-20T09:15:00.000Z',
			},
		],
		createdAt: '2024-01-20T09:15:00.000Z',
		updatedAt: '2024-01-20T09:15:00.000Z',
	},
]
