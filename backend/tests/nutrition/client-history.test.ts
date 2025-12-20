import { describe, it, expect, vi, afterEach } from 'vitest'

// Мокаем Prisma
const mockPrisma = {
	clientNutritionPlan: {
		findMany: vi.fn(),
		count: vi.fn(),
	},
}

vi.mock('../../prisma.js', () => ({
	get prisma() {
		return mockPrisma
	},
}))

describe('История планов питания клиента', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	const clientId = 'client_123'

	it('возвращает пагинированную историю неактивных планов клиента', async () => {
		const mockPlans = [
			{
				id: 'plan1',
				clientId,
				isActive: false,
				startDate: new Date('2025-11-01'),
				createdAt: new Date('2025-11-01'),
				updatedAt: new Date('2025-12-01'),
				subcategory: {
					name: 'Low carb',
					category: { name: 'Похудение' },
				},
			},
			{
				id: 'plan2',
				clientId,
				isActive: false,
				startDate: new Date('2025-10-01'),
				createdAt: new Date('2025-10-01'),
				updatedAt: new Date('2025-11-01'),
				subcategory: {
					name: 'Detox',
					category: { name: 'Очищение' },
				},
			},
		]

		mockPrisma.clientNutritionPlan.findMany.mockResolvedValue(mockPlans)
		mockPrisma.clientNutritionPlan.count.mockResolvedValue(2)

		const { getClientNutritionHistory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: clientId, role: 'CLIENT' },
			query: { page: '1', limit: '10' },
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await getClientNutritionHistory(req as any, reply as any)

		expect(mockPrisma.clientNutritionPlan.findMany).toHaveBeenCalledWith({
			where: { clientId, isActive: false },
			orderBy: { createdAt: 'desc' },
			skip: 0,
			take: 10,
			include: expect.any(Object),
		})
		expect(mockPrisma.clientNutritionPlan.count).toHaveBeenCalledWith({
			where: { clientId, isActive: false },
		})

		expect(reply.send).toHaveBeenCalledWith(
			expect.objectContaining({
				history: expect.arrayContaining([
					expect.objectContaining({
						id: 'plan1',
						categoryName: 'Похудение',
						subcategoryName: 'Low carb',
						startDate: '2025-11-01T00:00:00.000Z',
						assignedAt: '2025-11-01T00:00:00.000Z',
						replacedAt: '2025-12-01T00:00:00.000Z',
					}),
				]),
				pagination: {
					page: 1,
					limit: 10,
					total: 2,
					totalPages: 1,
				},
			}),
		)
	})

	it('применяет пагинацию корректно (page=2, limit=1)', async () => {
		mockPrisma.clientNutritionPlan.findMany.mockResolvedValue([
			{
				id: 'plan2',
				clientId,
				isActive: false,
				startDate: new Date('2025-10-01'),
				createdAt: new Date('2025-10-01'),
				updatedAt: new Date('2025-11-01'),
				subcategory: { name: 'Detox', category: { name: 'Очищение' } },
			},
		])
		mockPrisma.clientNutritionPlan.count.mockResolvedValue(2)

		const { getClientNutritionHistory } = await import('../../controllers/nutrition.js')
		const req = {
			user: { id: clientId },
			query: { page: '2', limit: '1' },
		}
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await getClientNutritionHistory(req as any, reply as any)

		expect(mockPrisma.clientNutritionPlan.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				skip: 1,
				take: 1,
			}),
		)
		expect(reply.send).toHaveBeenCalledWith(
			expect.objectContaining({
				pagination: expect.objectContaining({
					page: 2,
					limit: 1,
					total: 2,
					totalPages: 2,
				}),
			}),
		)
	})

	it('возвращает пустую историю, если нет неактивных планов', async () => {
		mockPrisma.clientNutritionPlan.findMany.mockResolvedValue([])
		mockPrisma.clientNutritionPlan.count.mockResolvedValue(0)

		const { getClientNutritionHistory } = await import('../../controllers/nutrition.js')
		const req = { user: { id: clientId }, query: {} }
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await getClientNutritionHistory(req as any, reply as any)

		expect(reply.send).toHaveBeenCalledWith(
			expect.objectContaining({
				history: [],
				pagination: expect.objectContaining({
					total: 0,
					totalPages: 0,
				}),
			}),
		)
	})

	it('использует значения по умолчанию для page и limit', async () => {
		mockPrisma.clientNutritionPlan.findMany.mockResolvedValue([])
		mockPrisma.clientNutritionPlan.count.mockResolvedValue(0)

		const { getClientNutritionHistory } = await import('../../controllers/nutrition.js')
		const req = { user: { id: clientId }, query: {} }
		const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		await getClientNutritionHistory(req as any, reply as any)

		expect(mockPrisma.clientNutritionPlan.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				skip: 0,
				take: 10,
			}),
		)
	})
})
