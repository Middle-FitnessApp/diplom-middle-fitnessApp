import { describe, it, expect, vi, afterEach } from 'vitest'
import { ApiError } from '../../utils/ApiError.js'

// Мокаем Prisma
const mockPrisma = {
	$transaction: vi.fn((fn) => fn(mockPrisma)),
	nutritionDay: {
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		count: vi.fn(),
	},
	nutritionSubcategory: {
		findUnique: vi.fn(),
	},
	nutritionMeal: {
		deleteMany: vi.fn(),
	},
}

vi.mock('../../prisma.js', () => ({
	get prisma() {
		return mockPrisma
	},
}))

describe('Дни плана питания', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	const trainerId = 'trainer_123'
	const subcategoryId = 'subcat_1'
	const dayId = 'day_1'

	const validMeals = [
		{ type: 'BREAKFAST', name: 'Омлет', items: ['Яйца', 'Помидоры'], mealOrder: 1 },
		{ type: 'LUNCH', name: 'Суп', items: ['Бульон', 'Овощи'], mealOrder: 2 },
	]

	it('тренер может создать день в своей подкатегории', async () => {
		mockPrisma.nutritionSubcategory.findUnique.mockResolvedValue({
			id: subcategoryId,
			category: { trainerId },
		})

		mockPrisma.nutritionDay.count.mockResolvedValue(0)

		mockPrisma.nutritionDay.create.mockResolvedValue({
			id: dayId,
			subcatId: subcategoryId,
			dayTitle: 'Понедельник',
			dayOrder: 1,
			meals: validMeals,
		})

		const { createNutritionDay } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: subcategoryId },
			body: {
				dayTitle: 'Понедельник',
				dayOrder: 1,
				meals: validMeals,
			},
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await createNutritionDay(req as any, reply as any)

		expect(mockPrisma.nutritionSubcategory.findUnique).toHaveBeenCalledWith({
			where: { id: subcategoryId },
			include: { category: true },
		})

		expect(mockPrisma.nutritionDay.count).toHaveBeenCalledWith({
			where: { subcatId: subcategoryId },
		})
		expect(mockPrisma.nutritionDay.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					subcatId: subcategoryId,
					dayTitle: 'Понедельник',
					dayOrder: 1,
					meals: {
						create: validMeals,
					},
				}),
			}),
		)
		expect(reply.status).toHaveBeenCalledWith(201)
	})

	// 🔥 ИСПРАВЛЕННЫЙ ТЕСТ: проверка лимита 31 день
	it('нельзя создать больше 31 дня в подкатегории', async () => {
		mockPrisma.nutritionSubcategory.findUnique.mockResolvedValue({
			id: subcategoryId,
			category: { trainerId },
		})
		// Мокаем, что уже существует 31 день
		mockPrisma.nutritionDay.count.mockResolvedValue(31)

		const { createNutritionDay } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: subcategoryId },
			body: {
				dayTitle: '32-й день',
				dayOrder: 32,
				meals: validMeals,
			},
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		// Проверяем, что выбрасывается ApiError
		await expect(createNutritionDay(req as any, reply as any)).rejects.toThrow(ApiError)

		// Альтернатива: проверяем конкретное сообщение
		try {
			await createNutritionDay(req as any, reply as any)
			// Если не выбросилась ошибка - тест должен упасть
			expect.fail('Ожидалась ошибка, но её не было')
		} catch (error) {
			expect(error).toBeInstanceOf(ApiError)
			expect((error as ApiError).message).toContain('31')
			expect((error as ApiError).statusCode).toBe(400)
		}

		// Проверяем, что create НЕ вызывался
		expect(mockPrisma.nutritionDay.create).not.toHaveBeenCalled()
	})

	it('нельзя создать день в чужой подкатегории', async () => {
		mockPrisma.nutritionSubcategory.findUnique.mockResolvedValue({
			id: subcategoryId,
			category: { trainerId: 'other_trainer' },
		})

		const { createNutritionDay } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: subcategoryId },
			body: {
				dayTitle: 'Невозможный день',
				dayOrder: 1,
				meals: validMeals,
			},
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(createNutritionDay(req as any, reply as any)).rejects.toThrow(
			'Подкатегория не найдена или нет прав доступа',
		)
	})

	it('валидация Zod: тип приёма должен быть из списка', async () => {
		mockPrisma.nutritionSubcategory.findUnique.mockResolvedValue({
			id: subcategoryId,
			category: { trainerId },
		})

		mockPrisma.nutritionDay.count.mockResolvedValue(0)

		const { createNutritionDay } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: subcategoryId },
			body: {
				dayTitle: 'Неверный тип',
				dayOrder: 1,
				meals: [{ type: 'DESSERT', name: 'Торт', items: ['Шоколад'], mealOrder: 1 }],
			},
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(createNutritionDay(req as any, reply as any)).rejects.toThrow(ApiError)
	})

	it('тренер может получить свой день с приёмами', async () => {
		mockPrisma.nutritionDay.findUnique.mockResolvedValue({
			id: dayId,
			subcategory: {
				category: { trainerId },
			},
			meals: validMeals,
		})

		const { getNutritionDay } = await import('../../controllers/nutrition.js')
		const req = { user: { id: trainerId }, params: { id: dayId } }
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await getNutritionDay(req as any, reply as any)

		expect(mockPrisma.nutritionDay.findUnique).toHaveBeenCalledWith({
			where: { id: dayId },
			include: expect.any(Object),
		})
		expect(reply.status).toHaveBeenCalledWith(200)
	})

	it('нельзя получить день из чужой категории', async () => {
		mockPrisma.nutritionDay.findUnique.mockResolvedValue({
			id: dayId,
			subcategory: {
				category: { trainerId: 'other_trainer' },
			},
			meals: validMeals,
		})

		const { getNutritionDay } = await import('../../controllers/nutrition.js')
		const req = { user: { id: trainerId }, params: { id: dayId } }
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(getNutritionDay(req as any, reply as any)).rejects.toThrow(
			'День не найден или нет прав доступа',
		)
	})

	it('тренер может обновить свой день и заменить приёмы пищи', async () => {
		mockPrisma.nutritionDay.findUnique.mockResolvedValue({
			id: dayId,
			subcategory: { category: { trainerId } },
		})
		mockPrisma.nutritionMeal.deleteMany.mockResolvedValue(undefined)
		mockPrisma.nutritionDay.update.mockResolvedValue({
			id: dayId,
			dayTitle: 'Обновлённый понедельник',
			meals: [{ type: 'DINNER', name: 'Стейк', items: ['Мясо'], mealOrder: 1 }],
		})

		const { updateNutritionDay } = await import('../../controllers/nutrition.js')
		const newMeals = [{ type: 'DINNER', name: 'Стейк', items: ['Мясо'], mealOrder: 1 }]
		const req = {
			user: { id: trainerId },
			params: { id: dayId },
			body: {
				dayTitle: 'Обновлённый понедельник',
				meals: newMeals,
			},
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await updateNutritionDay(req as any, reply as any)

		expect(mockPrisma.nutritionMeal.deleteMany).toHaveBeenCalledWith({
			where: { dayId },
		})

		const updateCall = mockPrisma.nutritionDay.update.mock.calls[0][0]

		expect(updateCall.where).toEqual({ id: dayId })
		expect(updateCall.data).toEqual(
			expect.objectContaining({
				dayTitle: 'Обновлённый понедельник',
				meals: {
					create: newMeals,
				},
			}),
		)
		expect(reply.status).toHaveBeenCalledWith(200)
	})

	it('тренер может удалить свой день', async () => {
		mockPrisma.nutritionDay.findUnique.mockResolvedValue({
			id: dayId,
			subcategory: { category: { trainerId } },
		})

		const { deleteNutritionDay } = await import('../../controllers/nutrition.js')
		const req = { user: { id: trainerId }, params: { id: dayId } }
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await deleteNutritionDay(req as any, reply as any)

		expect(mockPrisma.nutritionDay.delete).toHaveBeenCalledWith({
			where: { id: dayId },
		})
		expect(reply.status).toHaveBeenCalledWith(204)
	})

	it('нельзя удалить день из чужой категории', async () => {
		mockPrisma.nutritionDay.findUnique.mockResolvedValue({
			id: dayId,
			subcategory: { category: { trainerId: 'other_trainer' } },
		})

		const { deleteNutritionDay } = await import('../../controllers/nutrition.js')
		const req = { user: { id: trainerId }, params: { id: dayId } }
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(deleteNutritionDay(req as any, reply as any)).rejects.toThrow(
			'День не найден или нет прав доступа',
		)
	})
})
