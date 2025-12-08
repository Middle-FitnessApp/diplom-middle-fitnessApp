import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { calculateCycleDays } from '../utils/nutritionCycle.js'
import { GetClientNutritionPlanQuerySchema } from '../validation/zod/nutrition/get-client-plan.dto.js'

// =============================================
//  Личный назначенный план питания клиента
// =============================================

export async function getClientNutritionPlan(req: FastifyRequest, reply: FastifyReply) {
	const clientId = req.user.id

	// Валидация query параметров
	const queryValidation = GetClientNutritionPlanQuerySchema.safeParse(req.query)
	if (!queryValidation.success) {
		throw ApiError.badRequest(queryValidation.error.issues[0].message)
	}

	const { period = 'day', date } = queryValidation.data

	// Целевая дата (или сегодня)
	const targetDate = date ? new Date(date) : new Date()

	// Получаем активный план клиента
	const assignment = await prisma.clientNutritionPlan.findFirst({
		where: {
			clientId,
			isActive: true,
		},
		orderBy: { createdAt: 'desc' },
		include: {
			subcategory: {
				select: {
					id: true,
					name: true,
					description: true,
				},
			},
		},
	})

	if (!assignment) {
		return reply.status(200).send({
			plan: null,
			days: [],
		})
	}

	const { subcatId, dayIds, startDate } = assignment

	// Получаем дни плана
	const days = await prisma.nutritionDay.findMany({
		where: dayIds.length ? { id: { in: dayIds } } : { subcatId },
		orderBy: { dayOrder: 'asc' },
		include: {
			meals: {
				orderBy: { mealOrder: 'asc' },
			},
		},
	})

	// Вычисляем циклические дни с датами
	const cycleDays = calculateCycleDays(startDate, days, period, targetDate)

	return reply.status(200).send({
		plan: {
			id: assignment.id,
			subcategory: assignment.subcategory,
			startDate: assignment.startDate.toISOString().split('T')[0],
			assignedAt: assignment.createdAt.toISOString(),
		},
		days: cycleDays,
	})
}

// =============================================
//  История планов питания клиента
// =============================================

export async function getClientNutritionHistory(
	req: FastifyRequest,
	reply: FastifyReply,
) {
	const clientId = req.user.id
	const query = req.query as { page?: string; limit?: string }

	// Парсинг и валидация параметров пагинации
	const page = Math.max(1, parseInt(query.page || '1', 10))
	const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)))
	const skip = (page - 1) * limit

	// Получаем неактивные планы (история)
	const [history, total] = await Promise.all([
		prisma.clientNutritionPlan.findMany({
			where: {
				clientId,
				isActive: false,
			},
			orderBy: {
				createdAt: 'desc',
			},
			skip,
			take: limit,
			include: {
				subcategory: {
					include: {
						category: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		}),
		prisma.clientNutritionPlan.count({
			where: {
				clientId,
				isActive: false,
			},
		}),
	])

	// Форматируем ответ
	const formattedHistory = history.map((plan) => ({
		id: plan.id,
		categoryName: plan.subcategory.category.name,
		subcategoryName: plan.subcategory.name,
		startDate: plan.startDate.toISOString(),
		assignedAt: plan.createdAt.toISOString(),
		replacedAt: plan.updatedAt.toISOString(),
	}))

	return reply.status(200).send({
		history: formattedHistory,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	})
}

// =============================================
//  Категории
// =============================================

export async function createNutritionCategory(req: FastifyRequest, reply: FastifyReply) {
	const { name, description } = req.body as { name: string; description?: string }

	const existing = await prisma.nutritionCategory.findUnique({
		where: { name },
	})

	if (existing) {
		throw ApiError.badRequest('Категория с таким названием уже существует')
	}

	const category = await prisma.nutritionCategory.create({
		data: {
			name,
			description,
			trainerId: req.user.id,
		},
	})

	return reply.status(201).send(category)
}

export async function getTrainerNutritionCategories(
	req: FastifyRequest,
	reply: FastifyReply,
) {
	const categories = await prisma.nutritionCategory.findMany({
		where: { trainerId: req.user.id },
		include: {
			subcategories: true,
		},
	})

	return reply.status(200).send(categories)
}

export async function updateNutritionCategory(req: FastifyRequest, reply: FastifyReply) {
	const { id } = req.params as { id: string }
	const { name, description } = req.body as Partial<{ name: string; description: string }>

	const category = await prisma.nutritionCategory.findFirst({
		where: {
			id,
			trainerId: req.user.id,
		},
	})

	if (!category) {
		throw ApiError.notFound('Категория не найдена или нет прав доступа')
	}

	if (name) {
		const existing = await prisma.nutritionCategory.findUnique({
			where: { name },
		})

		if (existing && existing.id !== id) {
			throw ApiError.badRequest('Категория с таким названием уже существует')
		}
	}

	const updated = await prisma.nutritionCategory.update({
		where: { id },
		data: { name, description },
	})

	return reply.status(200).send(updated)
}

export async function deleteNutritionCategory(req: FastifyRequest, reply: FastifyReply) {
	const { id } = req.params as { id: string }

	const category = await prisma.nutritionCategory.findFirst({
		where: {
			id,
			trainerId: req.user.id,
		},
	})

	if (!category) {
		throw ApiError.notFound('Категория не найдена или нет прав доступа')
	}

	await prisma.nutritionCategory.delete({
		where: { id },
	})

	return reply.status(204).send()
}

// =============================================
//  Подкатегории
// =============================================

export async function createNutritionSubcategory(
	req: FastifyRequest,
	reply: FastifyReply,
) {
	const { id: categoryId } = req.params as { id: string }
	const { name, description } = req.body as { name: string; description?: string }

	// Проверяем, что категория существует и принадлежит тренеру
	const category = await prisma.nutritionCategory.findFirst({
		where: {
			id: categoryId,
			trainerId: req.user.id,
		},
	})

	if (!category) {
		throw ApiError.notFound('Категория не найдена или нет прав доступа')
	}

	const existing = await prisma.nutritionSubcategory.findUnique({
		where: { name },
	})

	if (existing) {
		throw ApiError.badRequest('Подкатегория с таким названием уже существует')
	}

	const subcategory = await prisma.nutritionSubcategory.create({
		data: {
			name,
			description,
			categoryId,
		},
	})

	return reply.status(201).send(subcategory)
}

export async function getNutritionSubcategories(
	req: FastifyRequest,
	reply: FastifyReply,
) {
	const { id: categoryId } = req.params as { id: string }

	const category = await prisma.nutritionCategory.findFirst({
		where: {
			id: categoryId,
			trainerId: req.user.id,
		},
	})

	if (!category) {
		throw ApiError.notFound('Категория не найдена или нет прав доступа')
	}

	const subcategories = await prisma.nutritionSubcategory.findMany({
		where: { categoryId },
		orderBy: { createdAt: 'asc' },
	})

	return reply.status(200).send(subcategories)
}

export async function updateNutritionSubcategory(
	req: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = req.params as { id: string }
	const { name, description } = req.body as Partial<{ name: string; description: string }>

	// Проверяем права доступа через категорию
	const subcategory = await prisma.nutritionSubcategory.findUnique({
		where: { id },
		include: { category: true },
	})

	if (!subcategory || subcategory.category.trainerId !== req.user.id) {
		throw ApiError.notFound('Подкатегория не найдена или нет прав доступа')
	}

	if (name) {
		const existing = await prisma.nutritionSubcategory.findUnique({
			where: { name },
		})

		if (existing && existing.id !== id) {
			throw ApiError.badRequest('Подкатегория с таким названием уже существует')
		}
	}

	const updated = await prisma.nutritionSubcategory.update({
		where: { id },
		data: { name, description },
	})

	return reply.status(200).send(updated)
}

export async function deleteNutritionSubcategory(
	req: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = req.params as { id: string }

	// Проверяем права доступа через категорию
	const subcategory = await prisma.nutritionSubcategory.findUnique({
		where: { id },
		include: { category: true },
	})

	if (!subcategory || subcategory.category.trainerId !== req.user.id) {
		throw ApiError.notFound('Подкатегория не найдена или нет прав доступа')
	}

	await prisma.nutritionSubcategory.delete({ where: { id } })

	return reply.status(204).send()
}

// =============================================
//  Дни подкатегории (для тренера)
// =============================================

export async function getSubcategoryDays(
	req: FastifyRequest,
	reply: FastifyReply,
) {
	const { id: subcategoryId } = req.params as { id: string }

	// Проверяем права доступа через категорию
	const subcategory = await prisma.nutritionSubcategory.findUnique({
		where: { id: subcategoryId },
		include: { category: true },
	})

	if (!subcategory || subcategory.category.trainerId !== req.user.id) {
		throw ApiError.notFound('Подкатегория не найдена или нет прав доступа')
	}

	// Получаем дни с meals
	const days = await prisma.nutritionDay.findMany({
		where: { subcatId: subcategoryId },
		orderBy: { dayOrder: 'asc' },
		include: {
			meals: {
				orderBy: { mealOrder: 'asc' },
			},
		},
	})

	return reply.status(200).send(days)
}
