import { describe, it, expect, vi, afterEach } from 'vitest'
import { createProgress } from '../../controllers/progress.js'
import { ApiError } from '../../utils/ApiError.js'

// Мокаем Prisma
const mockPrisma = {
	progress: {
		findFirst: vi.fn(),
		create: vi.fn(),
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
	getDayRange: vi.fn((date: Date) => ({
		start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
		end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
	})),
}))

describe('createProgress', () => {
	const userId = 'user_123'
	const validData = {
		date: '10/12/2025',
		weight: 70.5,
		waist: 80.2,
		hips: 90.1,
	}

	afterEach(() => {
		vi.clearAllMocks()
	})

	it('создаёт новый отчёт о прогрессе с корректными данными и опциональными фото', async () => {
		mockPrisma.progress.findFirst.mockResolvedValue(null)
		mockPrisma.progress.create.mockResolvedValue({
			id: 'report_1',
			userId,
			...validData,
			photoFront: '/photos/front.jpg',
			createdAt: new Date(),
			updatedAt: new Date(),
		})

		const filesMap = { photoFront: '/photos/front.jpg' }

		const result = await createProgress(userId, validData, filesMap)

		expect(mockPrisma.progress.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					userId: userId,
					weight: 70.5,
					waist: 80.2,
					hips: 90.1,
					photoFront: '/photos/front.jpg',
					date: expect.any(Date),
				}),
			}),
		)
		expect(result.id).toBe('report_1')
	})

	it('выбрасывает ошибку, если отчёт за указанную дату уже существует', async () => {
		mockPrisma.progress.findFirst.mockResolvedValue({ id: 'existing_report' })

		await expect(createProgress(userId, validData, {})).rejects.toThrow(ApiError)
		await expect(createProgress(userId, validData, {})).rejects.toThrow(
			'Отчет за эту дату уже существует',
		)
	})

	it('не требует опциональные поля (рост, грудь и т.д.)', async () => {
		mockPrisma.progress.findFirst.mockResolvedValue(null)
		mockPrisma.progress.create.mockResolvedValue({
			id: 'report_2',
			userId,
			...validData,
			createdAt: new Date(),
			updatedAt: new Date(),
		})

		const result = await createProgress(userId, validData, {})

		expect(result).toBeDefined()
		expect(result.weight).toBe(70.5)
	})
})
