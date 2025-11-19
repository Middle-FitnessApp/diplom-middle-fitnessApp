import { prisma } from '../prisma.js'
import { hash } from 'bcryptjs'
import { ApiError } from '../utils/ApiError.js'
import { LoginDTO, RegisterDTO } from '../types/auth.js'

// register
export async function registerUser(data: RegisterDTO) {
	const exists = await prisma.user.findUnique({
		where: { email: data.email },
	})

	if (exists) {
		throw ApiError.badRequest('Email уже занят')
	}

	const passwordHash = await hash(data.password, 10)

	return prisma.user.create({
		data: {
			...data,
			password: passwordHash,
		},
		select: {
			id: true,
			name: true,
			email: true,
		},
	})
}

// login
export async function loginUser(data: LoginDTO) {
	const { emailOrPhone, password } = data

	const isEmail = emailOrPhone.includes('@')

	const user = await prisma.user.findFirst({
		where: isEmail
			? { email: emailOrPhone }
			: { phone: emailOrPhone },
	})

	if (!user) {
		throw ApiError.unauthorized('Неверный Email/телефон или пароль')
	}

	return {
		id: user.id,
		name: user.name,
		age: user.age,
		email: user.email,
		phone: user.phone,
	}
}
