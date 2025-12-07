export interface NutritionCategory {
	id: string
	trainerId: string
	name: string
	description?: string
	subcategories: NutritionSubcategory[] // массив подкатегорий
	createdAt: string | Date
	updatedAt: string | Date
}

export interface NutritionSubcategory {
	id: string
	categoryId: string
	name: string
	description?: string
	days: NutritionDay[] // полный массив дней
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

export interface AssignedNutritionPlan {
	id: string
	clientId: string
	subcatId: string // изменил programId → subcatId
	dayIds: string[]
	createdAt: string | Date
}

// Тип для дня плана питания с дополнительными полями от API
export interface NutritionDayWithDate extends NutritionDay {
	date: string
	isToday: boolean
}

// Информация о плане питания
export interface NutritionPlanInfo {
	id: string
	subcategory: {
		id: string
		name: string
		description?: string
	}
	startDate: string
	assignedAt: string
}

// Ответ API для плана питания клиента
export interface ClientNutritionPlanResponse {
	plan: NutritionPlanInfo | null
	days: NutritionDayWithDate[]
}
