import type { NutritionCategory } from '../types/nutritions'

export const mockCategories: NutritionCategory[] = [
	{
		id: '1',
		trainer_id: 'trainer_1',
		name: 'Похудение',
		description: 'Программы для снижения веса',
		programs: [
			{
				id: '1-1',
				category_id: '1',
				name: 'Низкоуглеводная диета',
				description: 'Снижение веса за счет ограничения углеводов',
				days_count: 7,
			},
			{
				id: '1-2',
				category_id: '1',
				name: 'Интервальное голодание',
				description: '16/8 - 16 часов голодания, 8 часов питания',
				days_count: 0, // если дней нет - показываем "Создать первый день"
			},
		],
	},
	{
		id: '2',
		trainer_id: 'trainer_1',
		name: 'Набор массы',
		description: 'Программы для увеличения мышечной массы',
		programs: [
			{
				id: '2-1',
				category_id: '2',
				name: 'Массонабор 3500 ккал',
				description: 'Высококалорийная программа для эктоморфов',
				days_count: 3,
			},
		],
	},
]
