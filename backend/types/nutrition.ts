// Типы для системы питания

export interface CreateSubcategoryWithDaysInput {
	name: string
	description?: string
	days: {
		dayTitle: string
		dayOrder: number
		meals: {
			type: 'BREAKFAST' | 'SNACK' | 'LUNCH' | 'DINNER'
			name: string
			mealOrder?: number
			items: string[]
		}[]
	}[]
}
