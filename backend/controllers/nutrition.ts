import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../prisma.js'

// =============================================
//  Личный назначенный план питания клиента
// =============================================

export async function getClientNutritionPlan(req: FastifyRequest, reply: FastifyReply) {
	const clientId = req.user.id

	const assignment = await prisma.clientNutritionPlan.findFirst({
		where: { clientId },
		orderBy: { createdAt: 'desc' },
	})

	if (!assignment) {
		return reply.status(200).send([])
	}

	const { subcatId, dayIds } = assignment

	const days = await prisma.nutritionDay.findMany({
		where: dayIds.length ? { id: { in: dayIds } } : { subcatId },
		orderBy: { dayOrder: 'asc' },
		include: {
			meals: {
				orderBy: { mealOrder: 'asc' },
			},
		},
	})

	return reply.status(200).send(days)
}

// =============================================
//  Категории
// =============================================

export async function createNutritionCategory(req: FastifyRequest, reply: FastifyReply) {
	const { name, description } = req.body as { name: string; description?: string }

	try {
		const category = await prisma.nutritionCategory.create({
			data: {
				name,
				description,
				trainerId: req.user.id,
			},
		})
		return reply.status(201).send(category)
	} catch (error: any) {
		if (error.code === 'P2002') {
			return reply
				.status(409)
				.send({ error: 'Категория с таким названием уже существует' })
		}
		return reply.status(500).send({ error: 'Ошибка создания категории' })
	}
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

	try {
		const category = await prisma.nutritionCategory.updateMany({
			where: {
				id,
				trainerId: req.user.id,
			},
			data: { name, description },
		})

		if (category.count === 0) {
			return reply
				.status(404)
				.send({ error: 'Категория не найдена или нет прав доступа' })
		}

		const updated = await prisma.nutritionCategory.findUnique({ where: { id } })
		return reply.status(200).send(updated)
	} catch (error: any) {
		if (error.code === 'P2002') {
			return reply
				.status(409)
				.send({ error: 'Категория с таким названием уже существует' })
		}
		return reply.status(500).send({ error: 'Ошибка обновления категории' })
	}
}

export async function deleteNutritionCategory(req: FastifyRequest, reply: FastifyReply) {
	const { id } = req.params as { id: string }

	try {
		const deleted = await prisma.nutritionCategory.deleteMany({
			where: {
				id,
				trainerId: req.user.id,
			},
		})

		if (deleted.count === 0) {
			return reply
				.status(404)
				.send({ error: 'Категория не найдена или нет прав доступа' })
		}

		return reply.status(204).send()
	} catch (error: any) {
		return reply.status(500).send({ error: 'Ошибка удаления категории' })
	}
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

	try {
		// Проверяем, что категория существует и принадлежит тренеру
		const category = await prisma.nutritionCategory.findFirst({
			where: {
				id: categoryId,
				trainerId: req.user.id,
			},
		})

		if (!category) {
			return reply
				.status(404)
				.send({ error: 'Категория не найдена или нет прав доступа' })
		}

		const subcategory = await prisma.nutritionSubcategory.create({
			data: {
				name,
				description,
				categoryId,
			},
		})

		return reply.status(201).send(subcategory)
	} catch (error: any) {
		if (error.code === 'P2002') {
			return reply
				.status(409)
				.send({ error: 'Подкатегория с таким названием уже существует' })
		}
		return reply.status(500).send({ error: 'Ошибка создания подкатегории' })
	}
}

export async function getNutritionSubcategories(
	req: FastifyRequest,
	reply: FastifyReply,
) {
	const { id: categoryId } = req.params as { id: string }

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

	try {
		// Проверяем права доступа через категорию
		const subcategory = await prisma.nutritionSubcategory.findUnique({
			where: { id },
			include: { category: true },
		})

		if (!subcategory || subcategory.category.trainerId !== req.user.id) {
			return reply
				.status(404)
				.send({ error: 'Подкатегория не найдена или нет прав доступа' })
		}

		const updated = await prisma.nutritionSubcategory.update({
			where: { id },
			data: { name, description },
		})

		return reply.status(200).send(updated)
	} catch (error: any) {
		if (error.code === 'P2002') {
			return reply
				.status(409)
				.send({ error: 'Подкатегория с таким названием уже существует' })
		}
		if (error.code === 'P2025') {
			return reply.status(404).send({ error: 'Подкатегория не найдена' })
		}
		return reply.status(500).send({ error: 'Ошибка обновления подкатегории' })
	}
}

export async function deleteNutritionSubcategory(
	req: FastifyRequest,
	reply: FastifyReply,
) {
	const { id } = req.params as { id: string }

	try {
		// Проверяем права доступа через категорию
		const subcategory = await prisma.nutritionSubcategory.findUnique({
			where: { id },
			include: { category: true },
		})

		if (!subcategory || subcategory.category.trainerId !== req.user.id) {
			return reply
				.status(404)
				.send({ error: 'Подкатегория не найдена или нет прав доступа' })
		}

		await prisma.nutritionSubcategory.delete({ where: { id } })

		return reply.status(204).send()
	} catch (error: any) {
		if (error.code === 'P2025') {
			return reply.status(404).send({ error: 'Подкатегория не найдена' })
		}
		return reply.status(500).send({ error: 'Ошибка удаления подкатегории' })
	}
}
