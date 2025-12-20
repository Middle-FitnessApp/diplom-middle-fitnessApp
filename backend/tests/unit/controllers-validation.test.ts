import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerUser, loginUser } from '../../controllers/user.js'
import { getAllClientsForTrainer } from '../../controllers/trainer.js'
import {
	ClientRegisterDTO,
	TrainerRegisterDTO,
	getRegisterBodySchema,
} from '../../validation/zod/auth/register.dto.js'
import { LoginDTO } from '../../validation/zod/auth/login.dto.js'
import { prisma } from '../../prisma.js'
import { hash, compare } from 'bcryptjs'
import {
	generateAccessToken,
	generateRefreshToken,
} from '../../services/token.service.js'
import { findUserByEmailOrPhone } from '../../utils/findUserByContact.js'
import { CLIENT, TRAINER } from '../../consts/role.js'
// Removed strict Prisma generics in mocks to keep tests implementation-only

// Мокируем зависимости
vi.mock('../../prisma.js', () => ({
	prisma: {
		user: {
			create: vi.fn(),
			findUnique: vi.fn(),
			count: vi.fn(),
			findMany: vi.fn(),
		},
		refreshToken: {
			deleteMany: vi.fn(),
			create: vi.fn(),
		},
		progress: {
			create: vi.fn(),
		},
	},
}))

vi.mock('bcryptjs', () => ({
	hash: vi.fn<() => Promise<string>>().mockResolvedValue('hashed-password'),
	compare: vi.fn<() => Promise<boolean>>().mockResolvedValue(true),
}))

vi.mock('../../services/token.service.js', () => ({
	generateAccessToken: vi.fn(),
	generateRefreshToken: vi.fn(),
}))

vi.mock('../../utils/findUserByContact.js', () => ({
	findUserByEmailOrPhone: vi.fn(),
}))

describe('Unit-тесты: Контроллеры пользователей', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('должен регистрировать нового пользователя', async () => {
		const mockUser = {
			id: '1',
			name: 'Test User',
			email: 'test@example.com',
			phone: null,
			password: 'hashed-password',
			photo: null,
			age: 25,
			weight: 70,
			height: 175,
			waist: 80,
			chest: 90,
			hips: 95,
			arm: 30,
			leg: 50,
			createdAt: new Date(),
			updatedAt: new Date(),
			goal: 'Lose weight',
			restrictions: 'No restrictions',
			experience: 'Beginner',
			diet: 'Balanced',
			telegram: null,
			whatsapp: null,
			instagram: null,
			bio: null,
			role: CLIENT,
		}
		const mockRefreshToken = { id: 'rt1', token: 'refresh-token' }
		const mockAccessToken = 'access-token'

		// Мокируем findUserByEmailOrPhone - пользователь не найден
		vi.mocked(findUserByEmailOrPhone).mockResolvedValue({ user: null, type: 'email' })
		vi.mocked(prisma.user.create).mockResolvedValue(mockUser)
		vi.mocked(generateRefreshToken).mockResolvedValue(mockRefreshToken)
		vi.mocked(generateAccessToken).mockReturnValue(mockAccessToken)

		const data: ClientRegisterDTO = {
			name: 'Test User',
			emailOrPhone: 'test@example.com',
			password: 'password',
			age: 25,
			weight: 70,
			height: 175,
			waist: 80,
			chest: 90,
			hips: 95,
			arm: 30,
			leg: 50,
			goal: 'Lose weight',
			restrictions: 'No restrictions',
			experience: 'Beginner',
			diet: 'Balanced',
		}

		const result = await registerUser(data, CLIENT, {})

		expect(findUserByEmailOrPhone).toHaveBeenCalledWith('test@example.com')
		expect(hash).toHaveBeenCalledWith('password', 10)
		expect(prisma.user.create).toHaveBeenCalled()
		expect(generateRefreshToken).toHaveBeenCalledWith('1')
		expect(generateAccessToken).toHaveBeenCalledWith('1', 'rt1')
		expect(result).toEqual({
			user: { role: CLIENT },
			token: { accessToken: 'access-token', refreshToken: 'refresh-token' },
		})
	})

	it('должен логинить пользователя', async () => {
		const mockUser = {
			id: '1',
			name: 'Test User',
			email: 'test@example.com',
			phone: null,
			password: 'hashed-password',
			photo: null,
			age: 25,
			weight: 70,
			height: 175,
			waist: 80,
			chest: 90,
			hips: 95,
			arm: 30,
			leg: 50,
			createdAt: new Date(),
			updatedAt: new Date(),
			goal: 'Lose weight',
			restrictions: 'No restrictions',
			experience: 'Beginner',
			diet: 'Balanced',
			telegram: null,
			whatsapp: null,
			instagram: null,
			bio: '',
			role: CLIENT,
		}
		const mockRefreshToken = { id: 'rt1', token: 'refresh-token' }
		const mockAccessToken = 'access-token'

		vi.mocked(findUserByEmailOrPhone).mockResolvedValue({ user: mockUser, type: 'email' })
		vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 1 })
		vi.mocked(generateRefreshToken).mockResolvedValue(mockRefreshToken)
		vi.mocked(generateAccessToken).mockReturnValue(mockAccessToken)

		const data: LoginDTO = {
			emailOrPhone: 'test@example.com',
			password: 'password',
		}

		const result = await loginUser(data)

		expect(findUserByEmailOrPhone).toHaveBeenCalledWith('test@example.com')
		expect(compare).toHaveBeenCalledWith('password', 'hashed-password')
		expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
			where: { userId: '1' },
		})
		expect(result).toEqual({
			user: { role: CLIENT },
			token: { accessToken: 'access-token', refreshToken: 'refresh-token' },
		})
	})

	it('должен логинить пользователя с неправильным паролем', async () => {
		const mockUser = {
			id: '1',
			name: 'Test User',
			email: 'test@example.com',
			phone: null,
			password: 'hashed-password',
			photo: null,
			age: 25,
			weight: 70,
			height: 175,
			waist: 80,
			chest: 90,
			hips: 95,
			arm: 30,
			leg: 50,
			createdAt: new Date(),
			updatedAt: new Date(),
			goal: 'Lose weight',
			restrictions: 'No restrictions',
			experience: 'Beginner',
			diet: 'Balanced',
			telegram: null,
			whatsapp: null,
			instagram: null,
			bio: '',
			role: CLIENT,
		}

		vi.mocked(findUserByEmailOrPhone).mockResolvedValue({ user: mockUser, type: 'email' })
		vi.mocked(compare).mockImplementationOnce(() => Promise.resolve(false))

		const data: LoginDTO = {
			emailOrPhone: 'test@example.com',
			password: 'wrong-password',
		}

		await expect(loginUser(data)).rejects.toThrow('Неверный Email/телефон или пароль')
	})
})

describe('Unit-тесты: Контроллеры тренеров', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('должен получать список клиентов тренера', async () => {
		type MockClient = {
			id: string
			name: string
			email: string | null
			age: number
			phone: string | null
			photo: string | null
			goal: string
			password: string
			weight: number
			height: number
			waist: number
			chest: number
			hips: number
			arm: number
			leg: number
			createdAt: Date
			updatedAt: Date
			restrictions: string
			experience: string
			diet: string
			telegram: string | null
			whatsapp: string | null
			instagram: string | null
			bio: string | null
			role: 'CLIENT' | 'TRAINER'
			asClientOf: { status: string; isFavorite: boolean }[]
		}

		const mockClients: MockClient[] = [
			{
				id: '1',
				name: 'Client 1',
				email: 'client1@example.com',
				age: 25,
				phone: '1234567890',
				photo: null,
				goal: 'Lose weight',
				password: 'hashed',
				weight: 70,
				height: 175,
				waist: 80,
				chest: 90,
				hips: 95,
				arm: 30,
				leg: 50,
				createdAt: new Date(),
				updatedAt: new Date(),
				restrictions: 'None',
				experience: 'Beginner',
				diet: 'Balanced',
				telegram: null,
				whatsapp: null,
				instagram: null,
				bio: null,
				role: 'CLIENT',
				asClientOf: [{ status: 'ACCEPTED', isFavorite: false }],
			},
		]

		vi.mocked(prisma.user.count).mockResolvedValue(1)
		vi.mocked(prisma.user.findMany).mockResolvedValue(mockClients)

		const result = await getAllClientsForTrainer('trainer1', 'Client', 1, 10)

		expect(prisma.user.count).toHaveBeenCalledWith({
			where: {
				role: 'CLIENT',
				name: { contains: 'Client', mode: 'insensitive' },
			},
		})
		expect(prisma.user.findMany).toHaveBeenCalled()
		expect(result).toHaveProperty('clients')
		expect(result).toHaveProperty('pagination')
		expect(result.pagination).toHaveProperty('total')
		expect(result.pagination).toHaveProperty('page')
		expect(result.pagination).toHaveProperty('limit')
	})
})

describe('Unit-тесты: Валидация', () => {
	it('должен валидировать схему пользователя', () => {
		const clientSchema = getRegisterBodySchema(CLIENT)

		const validData = {
			name: 'Test User',
			emailOrPhone: 'test@example.com',
			password: 'password',
			age: 25,
			weight: 70,
			height: 175,
			waist: 80,
			chest: 90,
			hips: 95,
			arm: 30,
			leg: 50,
			goal: 'Lose weight',
			restrictions: 'No restrictions',
			experience: 'Beginner',
			diet: 'Balanced',
		}

		expect(() => clientSchema.parse(validData)).not.toThrow()

		const invalidData = {
			name: '',
			emailOrPhone: 'invalid',
			password: '123',
			age: -1,
		}

		expect(() => clientSchema.parse(invalidData)).toThrow()
	})
})
