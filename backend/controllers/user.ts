import { prisma } from '../prisma.js'
import { hash, compare } from 'bcryptjs'
import { ApiError } from '../utils/ApiError.js'

import { generateAccessToken, generateRefreshToken } from 'services/token.service.js'
import { findUserByEmailOrPhone } from 'utils/findUserByContact.js'
import { RegisterDTO } from 'validation/zod/auth/register.dto.js'
import { LoginDTO } from 'validation/zod/auth/login.dto.js'

// register
export async function registerUser(data: RegisterDTO, role: 'CLIENT' | 'TRAINER', filesMap: Record<string, string>) {
	const { user, type } = await findUserByEmailOrPhone(data.emailOrPhone)

	if (user) {
		throw ApiError.unauthorized('Неверный Email/телефон или пароль')
	}

	const passwordHash = await hash(data.password, 10)

	const { emailOrPhone, ...rest } = data

	const createdUser = await prisma.user.create({
		data: {
			...rest,
			[type]: emailOrPhone,
			password: passwordHash,
			role,
			...filesMap
		},
		select: {
			id: true,
			role: true,
		},
	})

	const accessToken = generateAccessToken(createdUser.id)
	const refreshToken = await generateRefreshToken(createdUser.id)

	return {
		user: {
			role: createdUser.role,
		},
		token: {
			accessToken,
			refreshToken,
		},
	}
}

// login
export async function loginUser(data: LoginDTO) {
	const { emailOrPhone, password } = data

	const { user } = await findUserByEmailOrPhone(emailOrPhone)

	if (!user) {
		throw ApiError.unauthorized('Неверный Email/телефон или пароль')
	}

	const isPasswordValid = await compare(password, user.password)

	if (!isPasswordValid) {
		throw ApiError.unauthorized('Неверный Email/телефон или пароль')
	}

	const accessToken = generateAccessToken(user.id)
	const refreshToken = await generateRefreshToken(user.id)

	return {
		user: {
			role: user.role,
		},
		token: {
			accessToken,
			refreshToken,
		},
	}
}

// logout
export async function logoutUser(userId: string) {
	await prisma.refreshToken.deleteMany({
		where: { userId },
	})
}
