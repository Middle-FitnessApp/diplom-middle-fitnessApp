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
				items: [
					{
						id: 'item_1',
						meal_id: 'meal_1',
						item_text: 'яичница из двух яиц',
						item_order: 1,
						links: [],
					},
					{
						id: 'item_2',
						meal_id: 'meal_1',
						item_text: 'огурец свежий и болгарский перец',
						item_order: 2,
						links: [],
					},
				],
			},
			{
				id: 'meal_2',
				day_id: 'day_1',
				type: 'lunch',
				name: 'Обед',
				meal_order: 2,
				items: [
					{
						id: 'item_3',
						meal_id: 'meal_2',
						item_text: 'куриная грудка на гриле',
						item_order: 1,
						links: ['https://recipe.example.com/chicken'],
					},
				],
			},
		],
	},
	{
		id: 'day_2',
		program_id: '1-1',
		day_title: 'День 2',
		day_order: 2,
		meals: [
			//...
		],
	},
]
