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
	// План питания для текущего клиента (CLIENT) или для принятого клиента (TRAINER)
	app.get(
		'/client/plan',
		{
			preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])],
		},
		getClientNutritionPlan,
	)

	// История планов питания клиента (CLIENT)
	app.get(
		'/client/history',
		{
			preHandler: [authGuard, hasRole(['CLIENT'])],
		},
		getClientNutritionHistory,
	)

	// CRUD КАТЕГОРИЙ (TRAINER)

	app.post(
		'/categories',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		createNutritionCategory,
	)

	app.get(
		'/categories',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		getTrainerNutritionCategories,
	)

	app.put(
		'/categories/:id',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		updateNutritionCategory,
	)

	app.delete(
		'/categories/:id',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		deleteNutritionCategory,
	)

	// CRUD ПОДКАТЕГОРИЙ (TRAINER)

	// Создание подкатегории с днями (полная форма)
	app.post(
		'/categories/:id/subcategories/full',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		createSubcategoryWithDays,
	)

	app.post(
		'/categories/:id/subcategories',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		createNutritionSubcategory,
	)

	app.get(
		'/categories/:id/subcategories',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		getNutritionSubcategories,
	)

	app.put(
		'/subcategories/:id',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		updateNutritionSubcategory,
	)

	app.delete(
		'/subcategories/:id',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		deleteNutritionSubcategory,
	)

	// CRUD ДНЕЙ (TRAINER)

	// Получение дней подкатегории с meals
	app.get(
		'/subcategories/:id/days',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		getSubcategoryDays,
	)

	// Создание нового дня
	app.post('/days', { preHandler: [authGuard, hasRole(['TRAINER'])] }, createNutritionDay)

	// Получение конкретного дня
	app.get('/days/:id', { preHandler: [authGuard, hasRole(['TRAINER'])] }, getNutritionDay)

	// Обновление дня
	app.put(
		'/days/:id',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		updateNutritionDay,
	)

	// Удаление дня
	app.delete(
		'/days/:id',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		deleteNutritionDay,
	)
}
