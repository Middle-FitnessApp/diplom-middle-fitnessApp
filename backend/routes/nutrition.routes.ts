import type { FastifyInstance } from 'fastify'
import { authGuard } from '../middleware/authGuard.js'
import { hasRole } from '../middleware/hasRole.js'
import {
	getClientNutritionPlan,
	getClientNutritionHistory,
	createNutritionCategory,
	getTrainerNutritionCategories,
	updateNutritionCategory,
	deleteNutritionCategory,
	createNutritionSubcategory,
	getNutritionSubcategories,
	updateNutritionSubcategory,
	deleteNutritionSubcategory,
	getSubcategoryDays,
	createNutritionDay,
	getNutritionDay,
	updateNutritionDay,
	deleteNutritionDay,
	createSubcategoryWithDays,
} from '../controllers/nutrition.js'

export default async function nutritionRoutes(app: FastifyInstance) {
	// Получение активного плана питания клиента (CLIENT) или плана принятого клиента (TRAINER)
	app.get(
		'/client/plan',
		{
			preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])],
		},
		getClientNutritionPlan,
	)

	// Получение истории планов питания клиента
	app.get(
		'/client/history',
		{
			preHandler: [authGuard, hasRole(['CLIENT'])],
		},
		getClientNutritionHistory,
	)

	// Создание категории питания
	app.post(
		'/categories',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		createNutritionCategory,
	)

	// Получение всех категорий тренера
	app.get(
		'/categories',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		getTrainerNutritionCategories,
	)

	// Обновление категории питания
	app.put(
		'/categories/:id',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		updateNutritionCategory,
	)

	// Удаление категории питания
	app.delete(
		'/categories/:id',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		deleteNutritionCategory,
	)

	// Создание подкатегории в категории
	app.post(
		'/categories/:id/subcategories',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		createNutritionSubcategory,
	)

	// Получение подкатегорий категории
	app.get(
		'/categories/:id/subcategories',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		getNutritionSubcategories,
	)

	// Обновление подкатегории
	app.put(
		'/subcategories/:id',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		updateNutritionSubcategory,
	)

	// Удаление подкатегории
	app.delete(
		'/subcategories/:id',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		deleteNutritionSubcategory,
	)

	// Создание подкатегории с днями (полная форма)
	app.post(
		'/categories/:id/subcategories/full',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		createSubcategoryWithDays,
	)

	// Получение дней подкатегории с фильтрацией и поиском
	app.get(
		'/subcategories/:id/days',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		getSubcategoryDays,
	)

	// Создание нового дня в подкатегории
	app.post(
		'/subcategories/:id/days',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		createNutritionDay,
	)

	// Получение конкретного дня с приемами пищи
	app.get('/days/:id', { preHandler: [authGuard, hasRole(['TRAINER'])] }, getNutritionDay)

	// Частичное обновление дня
	app.patch(
		'/days/:id',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		updateNutritionDay,
	)

	// Удаление дня с каскадным удалением приемов пищи
	app.delete(
		'/days/:id',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		deleteNutritionDay,
	)
}
