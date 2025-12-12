import { describe, it, expect, vi, afterEach } from 'vitest'
import { ApiError } from '../../utils/ApiError.js'

// Мокаем Prisma
const mockPrisma = {
	nutritionCategory: {
		findUnique: vi.fn(),
		findFirst: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
		findMany: vi.fn(),
	},
}

vi.mock('../../prisma.js', () => ({
	get prisma() {
		return mockPrisma
	},
}))

describe('Категории питания', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	const trainerId = 'trainer_123'

	it('тренер может создать новую категорию с уникальным названием', async () => {
		mockPrisma.nutritionCategory.findUnique.mockResolvedValue(null)
		mockPrisma.nutritionCategory.create.mockResolvedValue({
			id: 'cat_1',
			name: 'Похудение',
			description: 'План для снижения веса',
			trainerId,
		})

		const { createNutritionCategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId, role: 'TRAINER' },
			body: { name: 'Похудение', description: 'План для снижения веса' },
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await createNutritionCategory(req as any, reply as any)

		expect(mockPrisma.nutritionCategory.findUnique).toHaveBeenCalledWith({
			where: { name: 'Похудение' },
		})
		expect(mockPrisma.nutritionCategory.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: {
					name: 'Похудение',
					description: 'План для снижения веса',
					trainerId,
				},
			}),
		)
		expect(reply.status).toHaveBeenCalledWith(201)
	})

	it('нельзя создать категорию с уже существующим названием', async () => {
		mockPrisma.nutritionCategory.findUnique.mockResolvedValue({ id: 'existing_cat' })

		const { createNutritionCategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			body: { name: 'Дубль' },
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(createNutritionCategory(req as any, reply as any)).rejects.toThrow(
			ApiError,
		)
		await expect(createNutritionCategory(req as any, reply as any)).rejects.toThrow(
			'Категория с таким названием уже существует',
		)
	})

	it('тренер получает только свои категории', async () => {
		const mockCategories = [
			{ id: 'cat1', name: 'Похудение', trainerId },
			{ id: 'cat2', name: 'Набор массы', trainerId },
		]
		mockPrisma.nutritionCategory.findMany.mockResolvedValue(mockCategories)

		const { getTrainerNutritionCategories } = await import(
			'../../controllers/nutrition.js'
		)
		const req = { user: { id: trainerId } }
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await getTrainerNutritionCategories(req as any, reply as any)

		expect(mockPrisma.nutritionCategory.findMany).toHaveBeenCalledWith({
			where: { trainerId },
			include: expect.any(Object),
		})
		expect(reply.send).toHaveBeenCalledWith(mockCategories)
	})

	it('тренер может обновить свою категорию с новым уникальным названием', async () => {
		mockPrisma.nutritionCategory.findFirst.mockResolvedValue({
			id: 'cat_1',
			trainerId,
		})
		mockPrisma.nutritionCategory.findUnique.mockResolvedValue(null)
		mockPrisma.nutritionCategory.update.mockResolvedValue({
			id: 'cat_1',
			name: 'ЗОЖ',
			trainerId,
		})

		const { updateNutritionCategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: 'cat_1' },
			body: { name: 'ЗОЖ' },
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await updateNutritionCategory(req as any, reply as any)

		expect(mockPrisma.nutritionCategory.update).toHaveBeenCalledWith({
			where: { id: 'cat_1' },
			data: { name: 'ЗОЖ' },
		})
	})

	it('нельзя обновить категорию с именем, которое уже занято другой категорией', async () => {
		mockPrisma.nutritionCategory.findFirst.mockResolvedValue({
			id: 'cat_1',
			trainerId,
		})
		mockPrisma.nutritionCategory.findUnique.mockResolvedValue({ id: 'other_cat' })

		const { updateNutritionCategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: 'cat_1' },
			body: { name: 'Занятое имя' },
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(updateNutritionCategory(req as any, reply as any)).rejects.toThrow(
			'Категория с таким названием уже существует',
		)
	})

	it('нельзя обновить чужую категорию (проверка прав доступа)', async () => {
		mockPrisma.nutritionCategory.findFirst.mockResolvedValue(null)

		const { updateNutritionCategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: 'cat_1' },
			body: { description: 'Новое описание' },
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(updateNutritionCategory(req as any, reply as any)).rejects.toThrow(
			'Категория не найдена или нет прав доступа',
		)
	})

	it('тренер может удалить свою категорию', async () => {
		mockPrisma.nutritionCategory.findFirst.mockResolvedValue({
			id: 'cat_1',
			trainerId,
		})

		const { deleteNutritionCategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: 'cat_1' },
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await deleteNutritionCategory(req as any, reply as any)

		expect(mockPrisma.nutritionCategory.delete).toHaveBeenCalledWith({
			where: { id: 'cat_1' },
		})
		expect(reply.status).toHaveBeenCalledWith(204)
	})

	it('нельзя удалить чужую категорию', async () => {
		mockPrisma.nutritionCategory.findFirst.mockResolvedValue(null)

		const { deleteNutritionCategory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId },
			params: { id: 'cat_1' },
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await expect(deleteNutritionCategory(req as any, reply as any)).rejects.toThrow(
			'Категория не найдена или нет прав доступа',
		)
	})
})
