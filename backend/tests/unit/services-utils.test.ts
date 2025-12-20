import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'
import { prisma } from '../../prisma.js'
import * as tokenService from '../../services/token.service.js'
import { createNotification } from '../../services/notification.service.js'
import { calculateCycleDays, getCurrentDayIndex } from '../../utils/nutritionCycle.js'
import { findUserByEmailOrPhone } from '../../utils/findUserByContact.js'
import { refreshTokenService } from '../../services/refreshToken.service.js'
import { ApiError } from '../../utils/ApiError.js'

// Моки
vi.mock('jsonwebtoken')
vi.mock('../../prisma.js', () => ({
	prisma: {
		refreshToken: {
			create: vi.fn(),
			findUnique: vi.fn(),
			delete: vi.fn(),
		},
		notification: {
			create: vi.fn(),
		},
		user: {
			findFirst: vi.fn(),
		},
	},
}))
vi.mock('../../utils/ApiError.js')
vi.mock('socket.io', () => ({
	Server: vi.fn().mockImplementation(() => ({
		to: vi.fn().mockReturnThis(),
		emit: vi.fn(),
	})),
}))

const mockJwt = vi.mocked(jwt)
const mockApiError = vi.mocked(ApiError)

let mockPrisma: any

beforeEach(async () => {
	const { prisma } = await import('../../prisma.js')
	mockPrisma = prisma
	vi.clearAllMocks()
	process.env.JWT_ACCESS_SECRET = 'test-access-secret'
	process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
})

describe('Unit-тесты: Сервисы токенов', () => {
	it('должен генерировать валидный JWT токен', async () => {
		const userId = 'user123'
		const refreshTokenId = 'refresh123'
		const mockToken = 'mocked-jwt-token'

		mockJwt.sign.mockImplementation(() => mockToken)

		const token = tokenService.generateAccessToken(userId, refreshTokenId)

		expect(mockJwt.sign).toHaveBeenCalledWith(
			{ user: { id: userId }, refreshTokenId },
			process.env.JWT_ACCESS_SECRET,
			{ expiresIn: expect.any(String) },
		)
		expect(token).toBe(mockToken)
	})

	it('должен верифицировать токен корректно', async () => {
		const token = 'valid-token'
		const decoded = { user: { id: 'user123' }, refreshTokenId: 'refresh123' }

		mockJwt.verify.mockImplementation(() => decoded)

		const result = tokenService.verifyAccessToken(token)

		expect(mockJwt.verify).toHaveBeenCalledWith(token, process.env.JWT_ACCESS_SECRET)
		expect(result).toEqual(decoded)
	})

	it('должен выбрасывать ошибку при верификации невалидного токена', async () => {
		const token = 'invalid-token'

		mockJwt.verify.mockImplementation(() => {
			throw new Error('Invalid token')
		})

		expect(() => tokenService.verifyAccessToken(token)).toThrow('Invalid token')
	})

	it('должен генерировать refresh токен', async () => {
		const userId = 'user123'
		const mockToken = { token: 'refresh-token', id: 'token-id' }

		mockPrisma.refreshToken.create.mockResolvedValue(mockToken)

		const result = await tokenService.generateRefreshToken(userId)

		expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith({
			data: {
				token: expect.any(String),
				userId,
				expiresAt: expect.any(Date),
			},
		})
		expect(result).toEqual(mockToken)
	})

	it('должен обновлять refresh токен', async () => {
		const refreshToken = 'old-refresh-token'
		const user = { id: 'user123', role: 'CLIENT' }
		const tokenRecord = { user }
		const newRefreshToken = { token: 'new-refresh', id: 'new-id' }
		const accessToken = 'new-access'

		mockPrisma.refreshToken.findUnique.mockResolvedValue(tokenRecord)
		mockPrisma.refreshToken.delete.mockResolvedValue({})
		vi.spyOn(tokenService, 'generateRefreshToken').mockResolvedValue(newRefreshToken)
		vi.spyOn(tokenService, 'generateAccessToken').mockReturnValue(accessToken)

		const result = await refreshTokenService({ refreshToken })

		expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith({
			where: { token: refreshToken },
			include: { user: true },
		})
		expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
			where: { token: refreshToken },
		})
		expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(user.id)
		expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
			user.id,
			newRefreshToken.id,
		)
		expect(result).toEqual({
			token: { accessToken, refreshToken: newRefreshToken.token },
			user: { role: user.role },
		})
	})

	it('должен выбрасывать ошибку при обновлении несуществующего refresh токена', async () => {
		const refreshToken = 'invalid-refresh-token'

		mockPrisma.refreshToken.findUnique.mockResolvedValue(null)
		mockApiError.unauthorized = vi.fn(
			(msg: string) => ({ message: msg, statusCode: 401, name: 'ApiError' } as ApiError),
		)

		await expect(refreshTokenService({ refreshToken })).rejects.toThrow(
			'Неверный или устаревший refresh token',
		)
	})
})

describe('Unit-тесты: Сервисы уведомлений', () => {
	it('должен отправлять уведомление', async () => {
		const userId = 'user123'
		const type = 'REPORT'
		const message = 'Test notification'
		const mockNotification = {
			id: 'notif-id',
			userId,
			type,
			message,
			createdAt: new Date(),
			isRead: false,
		}
		const mockIo = {
			to: vi.fn().mockReturnThis(),
			emit: vi.fn(),
		}

		mockPrisma.notification.create.mockResolvedValue(mockNotification)

		const result = await createNotification(userId, type as any, message, mockIo as any)

		expect(mockPrisma.notification.create).toHaveBeenCalledWith({
			data: { userId, type, message },
		})
		expect(mockIo.to).toHaveBeenCalledWith(`user_${userId}`)
		expect(mockIo.emit).toHaveBeenCalledWith('notification', {
			id: mockNotification.id,
			type: mockNotification.type,
			message: mockNotification.message,
			createdAt: mockNotification.createdAt,
			isRead: mockNotification.isRead,
		})
		expect(result).toEqual(mockNotification)
	})
})

describe('Unit-тесты: Утилиты', () => {
	it('должен вычислять цикл питания', async () => {
		const startDate = new Date(Date.UTC(2023, 0, 1)) // 2023-01-01 UTC
		const days = [
			{ id: '1', dayTitle: 'Day 1', dayOrder: 1 },
			{ id: '2', dayTitle: 'Day 2', dayOrder: 2 },
			{ id: '3', dayTitle: 'Day 3', dayOrder: 3 },
		]
		const targetDate = new Date(Date.UTC(2023, 0, 3)) // 2023-01-03 UTC

		const result = calculateCycleDays(startDate, days, 'day', targetDate)

		expect(result).toHaveLength(1)
		expect(result[0]).toMatchObject({
			id: '3',
			dayTitle: 'Day 3',
			dayOrder: 3,
			date: '2023-01-03',
			isToday: true,
		})
	})

	it('должен вычислять индекс текущего дня', () => {
		const startDate = new Date('2023-01-01T00:00:00Z') // 2023-01-01 UTC
		const totalDays = 7
		const targetDate = new Date('2023-01-05T00:00:00Z') // 2023-01-05 UTC

		const index = getCurrentDayIndex(startDate, totalDays, targetDate)

		expect(index).toBe(4)
	})

	it('должен находить пользователя по контакту', async () => {
		const email = 'test@example.com'
		const mockUser = { id: 'user123', email }

		mockPrisma.user.findFirst.mockResolvedValue(mockUser)

		const result = await findUserByEmailOrPhone(email)

		expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
			where: { email },
		})
		expect(result).toEqual({ user: mockUser, type: 'email' })

		const phone = '+1234567890'
		mockPrisma.user.findFirst.mockResolvedValue(null)

		const result2 = await findUserByEmailOrPhone(phone)

		expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
			where: { phone },
		})
		expect(result2).toEqual({ user: null, type: 'phone' })
	})
})
