import { describe, it, expect, vi, afterEach } from 'vitest'

// Мокаем Prisma
const mockPrisma = {
	progress: {
		count: vi.fn(),
		findMany: vi.fn(),
	},
}

vi.mock('../../prisma.js', () => ({
	get prisma() {
		return mockPrisma
	},
}))

// Мокаем сервис работы с датами
vi.mock('../../services/date.service.js', () => ({
	parseDateString: vi.fn((dateStr: string) => {
		const [day, month, year] = dateStr.split('/').map(Number)
		return new Date(year, month - 1, day)
	}),
}))

describe('getAllProgress', () => {
	const userId = 'user_123'
	const mockReports = [
		{ id: 'p1', weight: 70, date: new Date('2025-12-01'), comments: [] },
		{ id: 'p2', weight: 69, date: new Date('2025-12-05'), comments: [] },
	]

	afterEach(() => {
		vi.clearAllMocks()
	})

	it('возвращает постраничный список отчётов прогресса пользователя', async () => {
		mockPrisma.progress.count.mockResolvedValue(2)
		mockPrisma.progress.findMany.mockResolvedValue(mockReports)

		const { getAllProgress } = await import('../../controllers/progress.js')

		const result = await getAllProgress(userId, { page: 1, limit: 10 })

		expect(mockPrisma.progress.count).toHaveBeenCalledWith({ where: { userId } })
		expect(mockPrisma.progress.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { userId },
				skip: 0,
				take: 10,
			}),
		)
		expect(result.data).toHaveLength(2)
		expect(result.meta).toEqual({
			page: 1,
			limit: 10,
			total: 2,
			totalPages: 1,
		})
	})

	it('применяет фильтрацию по диапазону дат, если указаны startDate и endDate', async () => {
		mockPrisma.progress.count.mockResolvedValue(1)
		mockPrisma.progress.findMany.mockResolvedValue([mockReports[0]])

		const { getAllProgress } = await import('../../controllers/progress.js')

		await getAllProgress(userId, {
			page: 1,
			limit: 10,
			startDate: '01/12/2025',
			endDate: '02/12/2025',
		})

		expect(mockPrisma.progress.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					userId,
					date: expect.objectContaining({
						gte: expect.any(Date),
						lte: expect.any(Date),
					}),
				}),
			}),
		)
	})

	it('корректно вычисляет пагинацию при нестандартных значениях page и limit', async () => {
		mockPrisma.progress.count.mockResolvedValue(25)
		mockPrisma.progress.findMany.mockResolvedValue(mockReports)

		const { getAllProgress } = await import('../../controllers/progress.js')

		const result = await getAllProgress(userId, { page: 3, limit: 10 })

		expect(mockPrisma.progress.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				skip: 20,
				take: 10,
			}),
		)
		expect(result.meta.totalPages).toBe(3)
	})
})
