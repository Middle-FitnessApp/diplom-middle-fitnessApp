import type { MealType } from '../types/nutritions'

export const mealTypes: { value: MealType; label: string }[] = [
	{ value: 'BREAKFAST', label: 'Завтрак' },
	{ value: 'SNACK', label: 'Перекус' },
	{ value: 'LUNCH', label: 'Обед' },
	{ value: 'DINNER', label: 'Ужин' },
]
