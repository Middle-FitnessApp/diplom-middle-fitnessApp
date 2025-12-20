import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authGuard } from '../../middleware/authGuard.js'
import { hasRole } from '../../middleware/hasRole.js'
import { errorHandler } from '../../middleware/globalErrorHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import { prisma } from '../../prisma.js'
import { verifyAccessToken } from '../../services/token.service.js'
import { FastifyRequest, FastifyReply } from 'fastify'
import { ZodError } from 'zod'

// Моки
vi.mock('../../prisma.js', () => ({
	prisma: {
		refreshToken: {
			findUnique: vi.fn(),
		},
		user: {
			findUnique: vi.fn(),
		},
	},
}))

vi.mock('../../services/token.service.js', () => ({
	verifyAccessToken: vi.fn(),
}))

describe('Unit-тесты: Middleware аутентификации', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('должен пропускать запрос с валидным токеном', async () => {
		const mockReq = {
			headers: { authorization: 'Bearer valid-token' },
			cookies: { refreshToken: 'valid-refresh-token' },
		} as unknown as FastifyRequest

		const mockPayload = {
			user: { id: 'user-id' },
			refreshTokenId: 'refresh-id',
		}

		const mockTokenInDb = { id: 'refresh-id', token: 'valid-refresh-token' }
		const mockUser = { id: 'user-id', role: 'CLIENT' }

		vi.mocked(verifyAccessToken).mockReturnValue(mockPayload)
		vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockTokenInDb as any)
		vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

		await expect(authGuard(mockReq)).resolves.toBeUndefined()
		expect(mockReq.user).toEqual({ id: 'user-id', role: 'CLIENT' })
	})

	it('должен блокировать запрос без токена', async () => {
		const mockReq = {
			headers: {},
			cookies: {},
		} as unknown as FastifyRequest

		await expect(authGuard(mockReq)).rejects.toThrow(ApiError)
		await expect(authGuard(mockReq)).rejects.toMatchObject({
			statusCode: 401,
			message: 'Пользователь не авторизован',
		})
	})

	it('должен блокировать запрос с недействительным токеном', async () => {
		const mockReq = {
			headers: { authorization: 'Bearer invalid-token' },
			cookies: { refreshToken: 'refresh-token' },
		} as unknown as FastifyRequest

		vi.mocked(verifyAccessToken).mockImplementation(() => {
			throw new Error('Invalid token')
		})

		await expect(authGuard(mockReq)).rejects.toThrow(ApiError)
		await expect(authGuard(mockReq)).rejects.toMatchObject({
			statusCode: 401,
		})
	})
})

describe('Unit-тесты: Middleware ролей', () => {
	it('должен разрешать доступ тренеру', async () => {
		const mockReq = {
			user: { role: 'TRAINER' },
		} as unknown as FastifyRequest

		const mockRes = {} as FastifyReply
		const mockNext = vi.fn()

		const middleware = hasRole(['TRAINER'])
		middleware(mockReq, mockRes, mockNext)

		expect(mockNext).toHaveBeenCalled()
	})

	it('должен блокировать доступ клиенту к тренеру', async () => {
		const mockReq = {
			user: { role: 'CLIENT' },
		} as unknown as FastifyRequest

		const mockRes = {} as FastifyReply
		const mockNext = vi.fn()

		const middleware = hasRole(['TRAINER'])

		expect(() => middleware(mockReq, mockRes, mockNext)).toThrow(ApiError)
		expect(() => middleware(mockReq, mockRes, mockNext)).toThrow('Недостаточно прав!')
		expect(mockNext).not.toHaveBeenCalled()
	})
})

describe('Unit-тесты: Глобальный обработчик ошибок', () => {
	it('должен обрабатывать ApiError', async () => {
		const mockApp = {
			setErrorHandler: vi.fn(),
		} as unknown as any

		const mockReply = {
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
		} as unknown as FastifyReply

		errorHandler(mockApp)

		const errorHandlerFn = mockApp.setErrorHandler.mock.calls[0][0]

		const apiError = ApiError.unauthorized('Test error')
		await errorHandlerFn(apiError, {} as any, mockReply)

		expect(mockReply.status).toHaveBeenCalledWith(401)
		expect(mockReply.send).toHaveBeenCalledWith({
			error: {
				message: 'Test error',
				statusCode: 401,
			},
		})
	})

	it('должен обрабатывать ZodError', async () => {
		const mockApp = {
			setErrorHandler: vi.fn(),
		} as unknown as any

		const mockReply = {
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
		} as unknown as FastifyReply

		errorHandler(mockApp)

		const errorHandlerFn = mockApp.setErrorHandler.mock.calls[0][0]

		const zodError = new ZodError([
			{
				code: 'invalid_type',
				expected: 'string',
				path: ['field'],
				message: 'Expected string, received number',
			} as any,
		])
		await errorHandlerFn(zodError, {} as any, mockReply)

		expect(mockReply.status).toHaveBeenCalledWith(400)
		expect(mockReply.send).toHaveBeenCalledWith({
			error: {
				message: 'Expected string, received number',
				statusCode: 400,
			},
		})
	})

	it('должен обрабатывать неизвестную ошибку', async () => {
		const mockApp = {
			setErrorHandler: vi.fn(),
		} as unknown as any

		const mockReply = {
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
		} as unknown as FastifyReply

		errorHandler(mockApp)

		const errorHandlerFn = mockApp.setErrorHandler.mock.calls[0][0]

		const unknownError = new Error('Unknown error')
		await errorHandlerFn(unknownError, {} as any, mockReply)

		expect(mockReply.status).toHaveBeenCalledWith(500)
		expect(mockReply.send).toHaveBeenCalledWith({
			error: {
				message: 'Внутренняя ошибка сервера',
				statusCode: 500,
			},
		})
	})
})
