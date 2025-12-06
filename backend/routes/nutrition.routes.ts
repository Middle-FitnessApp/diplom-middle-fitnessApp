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
} from '../controllers/nutrition.js'
import { GetClientNutritionPlanQuerySchema } from '../validation/zod/nutrition/get-client-plan.dto.js'
import { GetNutritionHistoryQuerySchema } from '../validation/zod/nutrition/get-history.dto.js'

export default async function nutritionRoutes(app: FastifyInstance) {
	// План питания для текущего клиента (CLIENT)
	app.get(
		'/client/plan',
		{
			preHandler: [authGuard, hasRole(['CLIENT'])],
			schema: {
				querystring: GetClientNutritionPlanQuerySchema,
			},
		},
		getClientNutritionPlan,
	)

	// История планов питания клиента (CLIENT)
	app.get(
		'/client/history',
		{
			preHandler: [authGuard, hasRole(['CLIENT'])],
			schema: {
				querystring: GetNutritionHistoryQuerySchema,
			},
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
}
