import { describe, it, expect, vi, afterEach } from 'vitest'

// Мокаем Prisma
const mockPrisma = {
	progress: {
		findUnique: vi.fn(),
	},
}

vi.mock('../../prisma.js', () => ({
	get prisma() {
		return mockPrisma
	},
}))

describe('getProgressById', () => {
	const progressId = 'prog_123'
	const ownerId = 'user_123'

	afterEach(() => {
		vi.clearAllMocks()
	})

	it('возвращает отчёт о прогрессе, если пользователь является владельцем (роль CLIENT)', async () => {
		const mockProgress = {
			id: progressId,
			userId: ownerId,
			weight: 70,
			user: { id: ownerId, name: 'Client' },
			comments: [],
		}
		mockPrisma.progress.findUnique.mockResolvedValue(mockProgress)

		const { getProgressById } = await import('../../controllers/progress.js')
		const result = await getProgressById(progressId, ownerId, 'CLIENT')
		expect(result).toEqual(mockProgress)
	})

	it('возвращает отчёт для TRAINER независимо от ID владельца (на уровне контроллера)', async () => {
		const mockProgress = {
			id: progressId,
			userId: ownerId,
			weight: 70,
			user: { id: ownerId, name: 'Client' },
			comments: [],
		}
		mockPrisma.progress.findUnique.mockResolvedValue(mockProgress)

		const { getProgressById } = await import('../../controllers/progress.js')
		const result = await getProgressById(progressId, 'trainer_789', 'TRAINER')
		expect(result).toEqual(mockProgress)
	})

	it('выбрасывает ошибку "не найдено", если отчёт не существует', async () => {
		mockPrisma.progress.findUnique.mockResolvedValue(null)

		const { getProgressById } = await import('../../controllers/progress.js')
		await expect(getProgressById(progressId, ownerId, 'CLIENT')).rejects.toThrow(
			'Отчет о прогрессе не найден',
		)
	})
})
