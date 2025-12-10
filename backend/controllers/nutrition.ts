import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { calculateCycleDays } from '../utils/nutritionCycle.js'
import { GetClientNutritionPlanQuerySchema } from '../validation/zod/nutrition/get-client-plan.dto.js'
import {
	CreateNutritionDaySchema,
	type CreateNutritionDayDto,
} from '../validation/zod/nutrition/create-day.dto.js'
import type { CreateSubcategoryWithDaysInput } from '../types/nutrition.js'

// =============================================
//  Личный назначенный план питания клиента
// =============================================

export async function getClientNutritionPlan(req: FastifyRequest, reply: FastifyReply) {
	// Валидация query параметров
	const queryValidation = GetClientNutritionPlanQuerySchema.safeParse(req.query)
	if (!queryValidation.success) {
		throw ApiError.badRequest(queryValidation.error.issues[0].message)
	}

	const { clientId: queryClientId, period = 'day', date } = queryValidation.data

	const userRole = req.user.role
	const userId = req.user.id

	let clientId: string

	if (userRole === 'TRAINER') {
		if (!queryClientId) {
			throw ApiError.badRequest('Параметр запроса clientId обязателен для тренера')
		}
		clientId = queryClientId
		// Проверяем, что клиент принят тренером
		const trainerClient = await prisma.trainerClient.findFirst({
			where: {
				trainerId: userId,
				clientId,
				status: 'ACCEPTED',
			},
		})
		if (!trainerClient) {
			throw ApiError.forbidden('Доступ запрещен: Клиент не принят этим тренером')
		}
	} else if (userRole === 'CLIENT') {
		if (queryClientId) {
			throw ApiError.badRequest('Параметр запроса clientId не разрешен для клиента')
		}
		clientId = userId
		// Проверяем, что у клиента есть активный тренер
		const activeTrainer = await prisma.trainerClient.findFirst({
			where: {
				clientId,
				status: 'ACCEPTED',
			},
		})
		if (!activeTrainer) {
			throw ApiError.forbidden('Доступ запрещен: У вас нет активного тренера')
		}
	} else {
		throw ApiError.forbidden('Доступ запрещен')
	}

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
			totalDays: days.length,
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
			subcategories: {
				include: {
					days: {
						select: {
							id: true,
						},
					},
				},
			},
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

export async function getSubcategoryDays(req: FastifyRequest, reply: FastifyReply) {
	const { id: subcategoryId } = req.params as { id: string }
	const query = req.query as { search?: string; limit?: string; offset?: string }

	// Проверяем права доступа через категорию
	const subcategory = await prisma.nutritionSubcategory.findUnique({
		where: { id: subcategoryId },
		include: { category: true },
	})

	if (!subcategory || subcategory.category.trainerId !== req.user.id) {
		throw ApiError.notFound('Подкатегория не найдена или нет прав доступа')
	}

	const limit = Math.min(100, Math.max(1, parseInt(query.limit || '50', 10)))
	const offset = Math.max(0, parseInt(query.offset || '0', 10))
	const search = query.search?.trim()

	// Получаем дни с meals
	const where: any = { subcatId: subcategoryId }
	if (search) {
		where.dayTitle = { contains: search, mode: 'insensitive' }
	}

	const days = await prisma.nutritionDay.findMany({
		where,
		orderBy: { dayOrder: 'asc' },
		skip: offset,
		take: limit,
		include: {
			meals: {
				orderBy: { mealOrder: 'asc' },
			},
		},
	})

	const total = await prisma.nutritionDay.count({ where })

	return reply.status(200).send({
		days,
		pagination: {
			total,
			limit,
			offset,
			hasMore: offset + limit < total,
		},
	})
}

// =============================================
//  CRUD для дней (NutritionDay)
// =============================================

export async function createNutritionDay(req: FastifyRequest, reply: FastifyReply) {
	const { id: subcatId } = req.params as { id: string }

	// Валидация тела запроса
	const validation = CreateNutritionDaySchema.safeParse(req.body)
	if (!validation.success) {
		throw ApiError.badRequest(validation.error.issues[0].message)
	}

	const { dayTitle, dayOrder, meals } = validation.data

	// Проверяем права доступа через категорию
	const subcategory = await prisma.nutritionSubcategory.findUnique({
		where: { id: subcatId },
		include: { category: true },
	})

	if (!subcategory || subcategory.category.trainerId !== req.user.id) {
		throw ApiError.notFound('Подкатегория не найдена или нет прав доступа')
	}

	// Создаем день с приемами пищи
	const day = await prisma.nutritionDay.create({
		data: {
			subcatId,
			dayTitle,
			dayOrder,
			meals: {
				create: meals.map((meal, index) => ({
					type: meal.type,
					name: meal.name,
					mealOrder: meal.mealOrder || index + 1,
					items: meal.items,
				})),
			},
		},
		include: {
			meals: {
				orderBy: { mealOrder: 'asc' },
			},
		},
	})

	return reply.status(201).send(day)
}

export async function getNutritionDay(req: FastifyRequest, reply: FastifyReply) {
	const { id } = req.params as { id: string }

	const day = await prisma.nutritionDay.findUnique({
		where: { id },
		include: {
			subcategory: {
				include: { category: true },
			},
			meals: {
				orderBy: { mealOrder: 'asc' },
			},
		},
	})

	if (!day || day.subcategory.category.trainerId !== req.user.id) {
		throw ApiError.notFound('День не найден или нет прав доступа')
	}

	return reply.status(200).send(day)
}

export async function updateNutritionDay(req: FastifyRequest, reply: FastifyReply) {
	const { id } = req.params as { id: string }
	const updateData = req.body as Partial<CreateNutritionDayDto>

	// Проверяем права доступа
	const existingDay = await prisma.nutritionDay.findUnique({
		where: { id },
		include: {
			subcategory: {
				include: { category: true },
			},
		},
	})

	if (!existingDay || existingDay.subcategory.category.trainerId !== req.user.id) {
		throw ApiError.notFound('День не найден или нет прав доступа')
	}

	// Обновляем день и meals в транзакции
	const updatedDay = await prisma.$transaction(async (tx) => {
		let data: any = {}

		if (updateData.dayTitle !== undefined) data.dayTitle = updateData.dayTitle
		if (updateData.dayOrder !== undefined) data.dayOrder = updateData.dayOrder

		// Если есть новые meals - удаляем старые и создаём новые
		if (updateData.meals) {
			await tx.nutritionMeal.deleteMany({
				where: { dayId: id },
			})
			data.meals = {
				create: updateData.meals.map((meal, index) => ({
					type: meal.type,
					name: meal.name,
					mealOrder: meal.mealOrder || index + 1,
					items: meal.items,
				})),
			}
		}

		return tx.nutritionDay.update({
			where: { id },
			data,
			include: {
				meals: {
					orderBy: { mealOrder: 'asc' },
				},
			},
		})
	})

	return reply.status(200).send(updatedDay)
}

export async function deleteNutritionDay(req: FastifyRequest, reply: FastifyReply) {
	const { id } = req.params as { id: string }

	// Проверяем права доступа
	const day = await prisma.nutritionDay.findUnique({
		where: { id },
		include: {
			subcategory: {
				include: { category: true },
			},
		},
	})

	if (!day || day.subcategory.category.trainerId !== req.user.id) {
		throw ApiError.notFound('День не найден или нет прав доступа')
	}

	await prisma.nutritionDay.delete({
		where: { id },
	})

	return reply.status(204).send()
}

// =============================================
//  Создание подкатегории с днями (полная форма)
// =============================================

export async function createSubcategoryWithDays(
	req: FastifyRequest,
	reply: FastifyReply,
) {
	const { id: categoryId } = req.params as { id: string }
	const { name, description, days } = req.body as CreateSubcategoryWithDaysInput

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

	// Проверяем уникальность имени подкатегории
	const existing = await prisma.nutritionSubcategory.findUnique({
		where: { name },
	})

	if (existing) {
		throw ApiError.badRequest('Подкатегория с таким названием уже существует')
	}

	// Создаем подкатегорию с днями и meals в одной транзакции
	const subcategory = await prisma.nutritionSubcategory.create({
		data: {
			name,
			description,
			categoryId,
			days: {
				create: days.map((day, dayIndex) => ({
					dayTitle: day.dayTitle,
					dayOrder: day.dayOrder || dayIndex + 1,
					meals: {
						create: day.meals.map((meal, mealIndex) => ({
							type: meal.type,
							name: meal.name,
							mealOrder: meal.mealOrder || mealIndex + 1,
							items: meal.items,
						})),
					},
				})),
			},
		},
		include: {
			days: {
				orderBy: { dayOrder: 'asc' },
				include: {
					meals: {
						orderBy: { mealOrder: 'asc' },
					},
				},
			},
		},
	})

	return reply.status(201).send(subcategory)
}
