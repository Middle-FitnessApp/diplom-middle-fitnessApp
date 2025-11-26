import type { ProgramDay } from '../types/nutritions'

export const mockProgramDays: ProgramDay[] = [
	{
		id: 'day_1',
		program_id: '1-1', // ссылка на программу
		day_title: 'День 1',
		day_order: 1,
		meals: [
			{
				id: 'meal_1',
				day_id: 'day_1',
				type: 'breakfast',
				name: 'Завтрак',
				meal_order: 1,
				items: ['яичница из двух яиц', 'огурец свежий и болгарский перец'],
			},
			{
				id: 'meal_2',
				day_id: 'day_1',
				type: 'lunch',
				name: 'Обед',
				meal_order: 2,
				items: ['куриная грудка на гриле'],
			},
		],
	},
	{
		id: 'day_2',
		program_id: '1-1',
		day_title: 'День 2',
		day_order: 2,
		meals: [
			{
				id: 'meal_1',
				day_id: 'day_1',
				type: 'breakfast',
				name: 'Завтрак',
				meal_order: 1,
				items: ['яичница из двух яиц', 'огурец свежий и болгарский перец'],
			},
			{
				id: 'meal_2',
				day_id: 'day_1',
				type: 'lunch',
				name: 'Обед',
				meal_order: 2,
				items: ['куриная грудка на гриле'],
			},
		],
	},
]
