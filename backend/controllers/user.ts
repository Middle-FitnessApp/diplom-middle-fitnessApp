import { prisma } from '../prisma.js'
import { hash, compare } from 'bcryptjs'
import { ApiError } from '../utils/ApiError.js'

import { generateAccessToken, generateRefreshToken } from 'services/token.service.js'
import { findUserByEmailOrPhone } from 'utils/findUserByContact.js'
import {
	ClientRegisterDTO,
	TrainerRegisterDTO,
} from 'validation/zod/auth/register.dto.js'
import { LoginDTO } from 'validation/zod/auth/login.dto.js'
import {
	ClientUpdateProfileDTO,
	TrainerUpdateProfileDTO,
} from 'validation/zod/user/update-profile.dto.js'
import { CLIENT, TRAINER } from 'consts/role.js'
import { deletePhoto } from 'utils/uploadPhotos.js'

// register
export async function registerUser(
	data: ClientRegisterDTO | TrainerRegisterDTO,
	role: typeof CLIENT | typeof TRAINER,
	filesMap: Record<string, string>,
) {
	const { user, type } = await findUserByEmailOrPhone(data.emailOrPhone)

	if (user) {
		throw ApiError.unauthorized('Неверный Email/телефон или пароль')
	}

	const passwordHash = await hash(data.password, 10)

	const { emailOrPhone, ...rest } = data

	let userProfileData: any = { ...rest }

	// Если клиент - извлекаем измерения для Progress
	if (role === CLIENT) {
		const { weight, height, waist, chest, hips, arm, leg, ...clientProfile } =
			data as ClientRegisterDTO
		userProfileData = clientProfile

		// Создаем пользователя без измерений
		const createdUser = await prisma.user.create({
			data: {
				...clientProfile,
				[type]: emailOrPhone,
				password: passwordHash,
				role,
				...filesMap,
			},
			select: {
				id: true,
				role: true,
			},
		})

		// Создаем первый Progress с измерениями
		await prisma.progress.create({
			data: {
				userId: createdUser.id,
				weight,
				waist,
				hips,
				height,
				chest,
				arm,
				leg,
			},
		})

		const refreshTokenData = await generateRefreshToken(createdUser.id)
		const accessToken = generateAccessToken(createdUser.id, refreshTokenData.id)

		return {
			user: {
				role: createdUser.role,
			},
			token: {
				accessToken,
				refreshToken: refreshTokenData.token,
			},
		}
	}

	// Создаем тренера (без измерений и Progress)
	const createdUser = await prisma.user.create({
		data: {
			...userProfileData,
			[type]: emailOrPhone,
			password: passwordHash,
			role,
			...filesMap,
		},
		select: {
			id: true,
			role: true,
		},
	})

	const refreshTokenData = await generateRefreshToken(createdUser.id)
	const accessToken = generateAccessToken(createdUser.id, refreshTokenData.id)

	return {
		user: {
			role: createdUser.role,
		},
		token: {
			accessToken,
			refreshToken: refreshTokenData.token,
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

	// Удаляем все старые refresh токены пользователя
	await prisma.refreshToken.deleteMany({
		where: { userId: user.id },
	})

	const refreshTokenData = await generateRefreshToken(user.id)
	const accessToken = generateAccessToken(user.id, refreshTokenData.id)

	return {
		user: {
			role: user.role,
		},
		token: {
			accessToken,
			refreshToken: refreshTokenData.token,
		},
	}
}

// logout
export async function logoutUser(userId: string) {
	// Проверяем, есть ли активные refresh токены для этого пользователя
	const existingTokens = await prisma.refreshToken.findMany({
		where: { userId },
	})

	if (existingTokens.length === 0) {
		throw ApiError.unauthorized('Пользователь не авторизован или уже вышел из аккаунта')
	}

	// Удаляем все refresh токены пользователя
	await prisma.refreshToken.deleteMany({
		where: { userId },
	})
}

// get user by id
export async function getUser(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			age: true,
			role: true,
			photo: true,
			createdAt: true,
			updatedAt: true,
			bio: true,
			telegram: true,
			whatsapp: true,
			instagram: true,
		},
	})

	if (!user) throw ApiError.notFound('Пользователь не найден')

	const base = {
		id: user.id,
		name: user.name,
		email: user.email,
		phone: user.phone,
		age: user.age,
		role: user.role,
		photo: user.photo,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	}

	const trainer = {
		bio: user.bio,
		telegram: user.telegram,
		whatsapp: user.whatsapp,
		instagram: user.instagram,
	}

	if (user.role === TRAINER) {
		return {
			...base,
			...trainer,
		}
	}

	return base
}

// edit client profile
export async function editClientProfile(
	userId: string,
	data: ClientUpdateProfileDTO,
	filesMap?: Record<string, string>,
) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true, email: true, phone: true, photo: true },
	})

	if (!user) throw ApiError.notFound('Пользователь не найден')

	// Если загружается новое фото, удаляем старое
	if (filesMap?.photo && user.photo && user.photo !== '/uploads/default/user.png') {
		deletePhoto(user.photo)
	}

	// Проверяем уникальность email, если он меняется
	if (data.email && data.email !== user.email) {
		const existingUser = await prisma.user.findUnique({
			where: { email: data.email },
		})
		if (existingUser) {
			throw ApiError.badRequest('Пользователь с таким email уже существует')
		}
	}

	// Проверяем уникальность phone, если он меняется
	if (data.phone && data.phone !== user.phone) {
		const existingUser = await prisma.user.findUnique({
			where: { phone: data.phone },
		})
		if (existingUser) {
			throw ApiError.badRequest('Пользователь с таким телефоном уже существует')
		}
	}

	// Добавляем файлы, если они были загружены
	const updateData = filesMap ? { ...data, ...filesMap } : data

	// Обновляем профиль клиента
	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: updateData,
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			age: true,
			role: true,
			photo: true,
			createdAt: true,
			updatedAt: true,
		},
	})

	return updatedUser
}

// edit trainer profile
export async function editTrainerProfile(
	userId: string,
	data: TrainerUpdateProfileDTO,
	filesMap?: Record<string, string>,
) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true, email: true, phone: true, photo: true },
	})

	if (!user) throw ApiError.notFound('Пользователь не найден')

	// Если загружается новое фото, удаляем старое
	if (filesMap?.photo && user.photo && user.photo !== '/uploads/default/user.png') {
		deletePhoto(user.photo)
	}

	// Проверяем уникальность email, если он меняется
	if (data.email && data.email !== user.email) {
		const existingUser = await prisma.user.findUnique({
			where: { email: data.email },
		})
		if (existingUser) {
			throw ApiError.badRequest('Пользователь с таким email уже существует')
		}
	}

	// Проверяем уникальность phone, если он меняется
	if (data.phone && data.phone !== user.phone) {
		const existingUser = await prisma.user.findUnique({
			where: { phone: data.phone },
		})
		if (existingUser) {
			throw ApiError.badRequest('Пользователь с таким телефоном уже существует')
		}
	}

	// Добавляем файлы, если они были загружены
	const updateData = filesMap ? { ...data, ...filesMap } : data

	// Обновляем профиль тренера
	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: updateData,
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			age: true,
			role: true,
			photo: true,
			createdAt: true,
			updatedAt: true,
			bio: true,
			telegram: true,
			whatsapp: true,
			instagram: true,
		},
	})

	return updatedUser
}
