export interface NutritionCategory {
	id: string
	trainer_id: string
	name: string
	description?: string
	programs: NutritionProgram[] // массив подкатегорий
}

export interface NutritionProgram {
	id: string
	category_id: string
	name: string
	description?: string
	days_count: number // вычисляемое поле для UI
}

export interface ProgramDay {
	id: string
	program_id: string
	day_title: string
	day_order: number
	meals: Meal[]
}

export interface Meal {
	id: string
	day_id: string
	type: 'breakfast' | 'snack' | 'lunch' | 'dinner'
	name: string
	meal_order: number
	items: MealItem[]
}

export interface MealItem {
	id: string
	meal_id: string
	item_text: string
	item_order: number
	links: string[]
}
