export interface NutritionCategory {
	id: string
	trainerId: string
	name: string
	description?: string
	subcategories: NutritionSubcategory[]
	createdAt: string | Date
	updatedAt: string | Date
}

export interface NutritionSubcategory {
	id: string
	categoryId: string
	name: string
	description?: string
	days: NutritionDay[]
	createdAt: string | Date
	updatedAt: string | Date
}

export interface NutritionDay {
	id: string
	subcatId: string
	dayTitle: string
	dayOrder: number
	meals: NutritionMeal[]
	createdAt: string | Date
	updatedAt: string | Date
}

export interface NutritionMeal {
	id: string
	dayId: string
	type: MealType
	name: string
	mealOrder: number
	items: string[]
	createdAt: string | Date
	updatedAt: string | Date
}

export type MealType = 'BREAKFAST' | 'SNACK' | 'LUNCH' | 'DINNER'
