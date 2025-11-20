import { prisma } from '../prisma.js'
import { hash, compare } from 'bcryptjs'
import { ApiError } from '../utils/ApiError.js'
import { LoginDTO, RegisterDTO } from '../types/auth.js'
import { generateAccessToken, generateRefreshToken } from 'services/token.service.js'
import { findUserByEmailOrPhone } from 'utils/findUserByContact.js'

// register
export async function registerUser(data: RegisterDTO) {
	const { user, type } = await findUserByEmailOrPhone(data.emailOrPhone)

	if (user) {
		throw ApiError.badRequest('Неверный Email/телефон или пароль')
	}

	const passwordHash = await hash(data.password, 10)

	const { emailOrPhone, ...rest } = data

	const createdUser = await prisma.user.create({
		data: {
			...rest,
			[type]: emailOrPhone,
			password: passwordHash,
		},
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
		},
	})

	const accessToken = generateAccessToken(createdUser.id)
	const refreshToken = await generateRefreshToken(createdUser.id)

	return {
		user: {
			id: createdUser.id,
			name: createdUser.name,
			email: createdUser.email,
			phone: createdUser.phone,
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
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone,
		},
		token: {
			accessToken,
			refreshToken,
		},
	}
}
