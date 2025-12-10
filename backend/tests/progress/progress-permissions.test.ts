import { describe, it, expect, vi, afterEach } from 'vitest'

// Мокаем Prisma
const mockPrisma = {
	progress: {
		findUnique: vi.fn(),
		findMany: vi.fn(),
		count: vi.fn(),
	},
}

vi.mock('../../prisma.js', () => ({
	get prisma() {
		return mockPrisma
	},
}))

// Мокаем сервис работы с датами
vi.mock('../../services/date.service.js', () => ({
	parseDateString: vi.fn((dateStr: string) => new Date()),
}))

describe('Проверка прав доступа к отчётам прогресса', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	it('CLIENT может получить только свой отчёт через getProgressById', async () => {
		const ownReport = {
			id: 'p1',
			userId: 'userA',
			weight: 70,
			user: { id: 'userA', name: 'Client A' },
			comments: [],
		}
		mockPrisma.progress.findUnique.mockResolvedValue(ownReport)

		const { getProgressById } = await import('../../controllers/progress.js')

		const result = await getProgressById('p1', 'userA', 'CLIENT')
		expect(result).toBe(ownReport)

		const otherReport = { ...ownReport, userId: 'userB' }
		mockPrisma.progress.findUnique.mockResolvedValueOnce(otherReport)

		await expect(getProgressById('p2', 'userA', 'CLIENT')).rejects.toThrow(
			'Нет доступа к этому отчету',
		)
	})

	it('getAllProgress возвращает только отчёты указанного userId', async () => {
		mockPrisma.progress.count.mockResolvedValue(1)
		mockPrisma.progress.findMany.mockResolvedValue([
			{ id: 'p1', userId: 'userX', weight: 70, comments: [] },
		])

		const { getAllProgress } = await import('../../controllers/progress.js')

		await getAllProgress('userX', { page: 1, limit: 10 })

		expect(mockPrisma.progress.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { userId: 'userX' },
			}),
		)
	})
})
