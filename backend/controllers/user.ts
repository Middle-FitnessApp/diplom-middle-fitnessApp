import { prisma } from '../prisma.js'
import { hash } from 'bcryptjs'
import { ApiError } from '../utils/ApiError.js'
import { RegisterDTO } from '../types/auth.js'


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
