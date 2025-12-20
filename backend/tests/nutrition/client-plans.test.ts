import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { calculateCycleDays } from '../../utils/nutritionCycle.js'

const mocks = vi.hoisted(() => ({
	calculateCycleDays: vi.fn(),
}))

// Мокаём модуль
vi.mock('../../utils/nutritionCycle.js', () => ({
	calculateCycleDays: mocks.calculateCycleDays,
}))

// Мокаем Prisma
const mockPrisma = {
	trainerClient: {
		findFirst: vi.fn(),
	},
	clientNutritionPlan: {
		findFirst: vi.fn(),
	},
	nutritionDay: {
		findMany: vi.fn(),
	},
}

vi.mock('../../prisma.js', () => ({
	get prisma() {
		return mockPrisma
	},
}))

describe('План питания клиента', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	beforeEach(() => {
		mocks.calculateCycleDays.mockReturnValue([
			{
				id: 'day_1',
				dayTitle: 'Понедельник',
				dayOrder: 1,
				date: '2025-12-10',
				isToday: true,
			},
		])
	})

	const trainerId = 'trainer_123'
	const clientId = 'client_456'
	const subcategoryId = 'subcat_1'
	const planId = 'plan_789'

	it('клиент получает свой активный план питания', async () => {
		mockPrisma.trainerClient.findFirst.mockResolvedValue({
			trainerId: 'some_trainer',
			clientId,
			status: 'ACCEPTED',
		})
		mockPrisma.clientNutritionPlan.findFirst.mockResolvedValue({
			id: planId,
			clientId,
			subcatId: subcategoryId,
			dayIds: ['day_1', 'day_2'],
			startDate: new Date('2025-12-01'),
			createdAt: new Date('2025-12-01'),
			isActive: true,
			subcategory: {
				id: subcategoryId,
				name: 'Low carb',
				description: 'Без углеводов',
			},
		})
		mockPrisma.nutritionDay.findMany.mockResolvedValue([
			{ id: 'day_1', dayTitle: 'Понедельник', meals: [] },
			{ id: 'day_2', dayTitle: 'Вторник', meals: [] },
		])

		const { getClientNutritionPlan } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: clientId, role: 'CLIENT' },
			query: {},
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await getClientNutritionPlan(req as any, reply as any)

		expect(mockPrisma.clientNutritionPlan.findFirst).toHaveBeenCalledWith({
			where: { clientId, isActive: true },
			orderBy: { createdAt: 'desc' },
			include: expect.any(Object),
		})
		expect(mockPrisma.nutritionDay.findMany).toHaveBeenCalled()
		expect(vi.mocked(calculateCycleDays)).toHaveBeenCalledWith(
			expect.any(Date),
			expect.arrayContaining([expect.objectContaining({ id: 'day_1' })]),
			'day',
			expect.any(Date),
		)
		expect(reply.send).toHaveBeenCalledWith({
			plan: expect.objectContaining({
				id: planId,
				subcategory: expect.objectContaining({ name: 'Low carb' }),
				startDate: '2025-12-01',
			}),
			days: expect.any(Array),
		})
	})

	it('клиент без активного тренера получает пустой план', async () => {
		mockPrisma.trainerClient.findFirst.mockResolvedValue(null)

		const { getClientNutritionPlan } = await import('../../controllers/nutrition.js')
		const req = { user: { id: clientId, role: 'CLIENT' }, query: {} }
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await getClientNutritionPlan(req as any, reply as any)

		expect(reply.send).toHaveBeenCalledWith({
			plan: null,
			days: [],
		})
		expect(mockPrisma.clientNutritionPlan.findFirst).not.toHaveBeenCalled()
	})

	it('клиент без активного плана получает пустой план', async () => {
		mockPrisma.trainerClient.findFirst.mockResolvedValue({
			trainerId: 'some_trainer',
			clientId,
			status: 'ACCEPTED',
		})
		mockPrisma.clientNutritionPlan.findFirst.mockResolvedValue(null)

		const { getClientNutritionPlan } = await import('../../controllers/nutrition.js')
		const req = { user: { id: clientId, role: 'CLIENT' }, query: {} }
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await getClientNutritionPlan(req as any, reply as any)

		expect(reply.send).toHaveBeenCalledWith({
			plan: null,
			days: [],
		})
	})

	it('тренер получает план питания своего принятого клиента', async () => {
		mockPrisma.trainerClient.findFirst.mockResolvedValue({
			trainerId,
			clientId,
			status: 'ACCEPTED',
		})
		mockPrisma.clientNutritionPlan.findFirst.mockResolvedValue({
			id: planId,
			clientId,
			subcatId: subcategoryId,
			dayIds: [],
			startDate: new Date('2025-12-01'),
			createdAt: new Date('2025-12-01'),
			isActive: true,
			subcategory: {
				id: subcategoryId,
				name: 'High protein',
				description: null,
			},
		})
		mockPrisma.nutritionDay.findMany.mockResolvedValue([])

		const { getClientNutritionPlan } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId, role: 'TRAINER' },
			query: { clientId },
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await getClientNutritionPlan(req as any, reply as any)

		expect(reply.status).toHaveBeenCalledWith(200)
		expect(reply.send).toHaveBeenCalledWith(
			expect.objectContaining({
				plan: expect.objectContaining({ id: planId }),
			}),
		)
	})

	it('тренер не может получить план непринятого клиента', async () => {
		mockPrisma.trainerClient.findFirst.mockResolvedValue(null)

		const { getClientNutritionPlan } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId, role: 'TRAINER' },
			query: { clientId: 'unrelated_client' },
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(getClientNutritionPlan(req as any, reply as any)).rejects.toThrow(
			'Доступ запрещен: Клиент не принят этим тренером',
		)
	})

	it('тренеру обязательно указывать clientId', async () => {
		const { getClientNutritionPlan } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: trainerId, role: 'TRAINER' },
			query: {},
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(getClientNutritionPlan(req as any, reply as any)).rejects.toThrow(
			'Параметр запроса clientId обязателен для тренера',
		)
	})

	it('клиенту запрещено передавать clientId', async () => {
		const { getClientNutritionPlan } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: clientId, role: 'CLIENT' },
			query: { clientId: 'another' },
		}
		const reply = { status: vi.fn(), send: vi.fn() }

		await expect(getClientNutritionPlan(req as any, reply as any)).rejects.toThrow(
			'Параметр запроса clientId не разрешен для клиента',
		)
	})

	it('используется целевая дата из query, если указана', async () => {
		mockPrisma.trainerClient.findFirst.mockResolvedValue({
			trainerId: 't1',
			clientId,
			status: 'ACCEPTED',
		})
		mockPrisma.clientNutritionPlan.findFirst.mockResolvedValue({
			id: planId,
			clientId,
			subcatId: subcategoryId,
			dayIds: [],
			startDate: new Date('2025-12-01'),
			createdAt: new Date('2025-12-01'),
			isActive: true,
			subcategory: { id: subcategoryId, name: 'Plan', description: null },
		})
		mockPrisma.nutritionDay.findMany.mockResolvedValue([])

		const { getClientNutritionPlan } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: clientId, role: 'CLIENT' },
			query: { date: '2025-12-15' },
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await getClientNutritionPlan(req as any, reply as any)

		expect(vi.mocked(calculateCycleDays)).toHaveBeenCalledWith(
			expect.any(Date),
			expect.any(Array),
			'day',
			new Date('2025-12-15'),
		)
	})
})
