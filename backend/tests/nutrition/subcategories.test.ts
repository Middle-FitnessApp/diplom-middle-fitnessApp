import { describe, it, expect, vi, afterEach } from 'vitest'

// Мокаем Prisma
const mockPrisma = {
	nutritionCategory: {
		findFirst: vi.fn(),
	},
	nutritionSubcategory: {
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
}

vi.mock('../../prisma.js', () => ({
	get prisma() {
		return mockPrisma
	},
}))

describe('Подкатегории питания', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	const trainerId = 'trainer_123'
	const categoryId = 'cat_1'

	it('тренер может создать подкатегорию в своей категории', async () => {
		mockPrisma.nutritionCategory.findFirst.mockResolvedValue({
			id: categoryId,
			trainerId,
		})
		mockPrisma.nutritionSubcategory.findUnique.mockResolvedValue(null)
		mockPrisma.nutritionSubcategory.create.mockResolvedValue({
			id: 'subcat_1',
			name: 'Low carb',
			description: 'Без углеводов',
			categoryId,
		})

		const { createNutritionSubcategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: categoryId },
			body: { name: 'Low carb', description: 'Без углеводов' },
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await createNutritionSubcategory(req as any, reply as any)

		expect(mockPrisma.nutritionCategory.findFirst).toHaveBeenCalledWith({
			where: { id: categoryId, trainerId },
		})
		expect(mockPrisma.nutritionSubcategory.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: {
					name: 'Low carb',
					description: 'Без углеводов',
					categoryId,
				},
			}),
		)
		expect(reply.status).toHaveBeenCalledWith(201)
	})

	it('нельзя создать подкатегорию в чужой категории', async () => {
		mockPrisma.nutritionCategory.findFirst.mockResolvedValue(null)

		const { createNutritionSubcategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: 'other_cat' },
			body: { name: 'Попытка' },
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(createNutritionSubcategory(req as any, reply as any)).rejects.toThrow(
			'Категория не найдена или нет прав доступа',
		)
	})

	it('нельзя создать подкатегорию с уже существующим названием', async () => {
		mockPrisma.nutritionCategory.findFirst.mockResolvedValue({
			id: categoryId,
			trainerId,
		})
		mockPrisma.nutritionSubcategory.findUnique.mockResolvedValue({ id: 'existing' })

		const { createNutritionSubcategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: categoryId },
			body: { name: 'Дубль' },
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(createNutritionSubcategory(req as any, reply as any)).rejects.toThrow(
			'Подкатегория с таким названием уже существует',
		)
	})

	it('тренер получает подкатегории только своей категории', async () => {
		mockPrisma.nutritionCategory.findFirst.mockResolvedValue({
			id: categoryId,
			trainerId,
		})
		const mockSubcategories = [
			{ id: 'sub1', name: 'Low carb', categoryId },
			{ id: 'sub2', name: 'High protein', categoryId },
		]
		mockPrisma.nutritionSubcategory.findMany.mockResolvedValue(mockSubcategories)

		const { getNutritionSubcategories } = await import('../../controllers/nutrition.js')
		const req = { user: { id: trainerId }, params: { id: categoryId } }
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await getNutritionSubcategories(req as any, reply as any)

		expect(mockPrisma.nutritionSubcategory.findMany).toHaveBeenCalledWith({
			where: { categoryId },
			orderBy: { createdAt: 'asc' },
		})
		expect(reply.send).toHaveBeenCalledWith(mockSubcategories)
	})

	it('нельзя получить подкатегории чужой категории', async () => {
		mockPrisma.nutritionCategory.findFirst.mockResolvedValue(null)

		const { getNutritionSubcategories } = await import('../../controllers/nutrition.js')
		const req = { user: { id: trainerId }, params: { id: 'other_cat' } }
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(getNutritionSubcategories(req as any, reply as any)).rejects.toThrow(
			'Категория не найдена или нет прав доступа',
		)
	})

	it('тренер может обновить свою подкатегорию с новым уникальным названием', async () => {
		mockPrisma.nutritionSubcategory.findUnique
			.mockResolvedValueOnce({
				id: 'sub_1',
				category: { trainerId },
			})
			.mockResolvedValueOnce(null)

		const { updateNutritionSubcategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: 'sub_1' },
			body: { name: 'Новое имя' },
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await updateNutritionSubcategory(req as any, reply as any)

		expect(mockPrisma.nutritionSubcategory.update).toHaveBeenCalledWith({
			where: { id: 'sub_1' },
			data: { name: 'Новое имя' },
		})
	})

	it('нельзя обновить подкатегорию с именем, которое уже занято', async () => {
		mockPrisma.nutritionSubcategory.findUnique
			.mockResolvedValueOnce({
				id: 'sub_1',
				category: { trainerId },
			})
			.mockResolvedValueOnce({ id: 'other_sub' })

		const { updateNutritionSubcategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: 'sub_1' },
			body: { name: 'Занятое имя' },
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(updateNutritionSubcategory(req as any, reply as any)).rejects.toThrow(
			'Подкатегория с таким названием уже существует',
		)
	})

	it('нельзя обновить подкатегорию из чужой категории', async () => {
		mockPrisma.nutritionSubcategory.findUnique.mockResolvedValue({
			id: 'sub_1',
			category: { trainerId: 'other_trainer' },
		})

		const { updateNutritionSubcategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: 'sub_1' },
			body: { description: 'Обновление' },
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(updateNutritionSubcategory(req as any, reply as any)).rejects.toThrow(
			'Подкатегория не найдена или нет прав доступа',
		)
	})

	it('тренер может удалить свою подкатегорию', async () => {
		mockPrisma.nutritionSubcategory.findUnique.mockResolvedValue({
			id: 'sub_1',
			category: { trainerId },
		})

		const { deleteNutritionSubcategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: 'sub_1' },
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await deleteNutritionSubcategory(req as any, reply as any)

		expect(mockPrisma.nutritionSubcategory.delete).toHaveBeenCalledWith({
			where: { id: 'sub_1' },
		})
		expect(reply.status).toHaveBeenCalledWith(204)
	})

	it('нельзя удалить подкатегорию из чужой категории', async () => {
		mockPrisma.nutritionSubcategory.findUnique.mockResolvedValue({
			id: 'sub_1',
			category: { trainerId: 'other_trainer' },
		})

		const { deleteNutritionSubcategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: 'sub_1' },
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(deleteNutritionSubcategory(req as any, reply as any)).rejects.toThrow(
			'Подкатегория не найдена или нет прав доступа',
		)
	})
})
