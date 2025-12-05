import { prisma } from '../prisma.js'

/**
 * Получение всех тренеров для публичного просмотра
 * @returns Список тренеров с базовой информацией
 */
export async function getAllTrainers() {
	return await prisma.user.findMany({
		where: { role: 'TRAINER' },
		select: {
			id: true,
			name: true,
			photo: true,
			bio: true,
			telegram: true,
			whatsapp: true,
			instagram: true,
		},
		orderBy: { name: 'asc' },
	})
}

/**
 * Получение клиентов тренера в работе
 * @param trainerId - ID тренера
 * @param favorites - Фильтр по избранным (опционально)
 * @param search - Поиск по имени (опционально)
 * @param page - Номер страницы
 * @param limit - Количество элементов на странице
 * @returns Список клиентов со статусом ACCEPTED
 */
export async function getClientsForTrainer(
	trainerId: string,
	favorites?: boolean,
	search?: string,
	page: number = 1,
	limit: number = 10,
) {
	const skip = (page - 1) * limit

	// Строим фильтр для клиентов
	const whereClause: any = {
		trainerClients: {
			some: {
				trainerId,
				status: 'ACCEPTED',
				...(favorites !== undefined && { isFavorite: favorites }),
			},
		},
	}

	// Добавляем поиск по имени если указан
	if (search) {
		whereClause.name = {
			contains: search,
			mode: 'insensitive',
		}
	}

	const clients = await prisma.user.findMany({
		where: whereClause,
		select: {
			id: true,
			email: true,
			name: true,
			age: true,
			phone: true,
			photo: true,
			role: true,
			trainerClients: {
				where: {
					trainerId,
					status: 'ACCEPTED',
				},
				select: {
					isFavorite: true,
				},
			},
		},
		orderBy: { name: 'asc' },
		skip,
		take: limit,
	})

	return clients.map((client) => ({
		id: client.id,
		email: client.email,
		name: client.name,
		age: client.age,
		phone: client.phone,
		photo: client.photo,
		role: client.role,
		isFavorite: client.trainerClients[0]?.isFavorite ?? false,
	}))
}

/**
 * Получение профиля конкретного тренера
 * @param trainerId - ID тренера
 * @param clientId - ID авторизованного клиента (опционально)
 * @returns Полная информация о тренере с дополнительными полями для авторизованного клиента
 */
export async function getTrainerById(trainerId: string, clientId?: string) {
	const trainer = await prisma.user.findUnique({
		where: { id: trainerId, role: 'TRAINER' },
		select: {
			id: true,
			name: true,
			photo: true,
			age: true,
			bio: true,
			telegram: true,
			whatsapp: true,
			instagram: true,
			createdAt: true,
		},
	})

	if (!trainer) {
		return null
	}

	// Если пользователь не авторизован - возвращаем базовую информацию
	if (!clientId) {
		return trainer
	}

	// Если авторизован - проверяем связь с тренером
	const relationship = await prisma.trainerClient.findUnique({
		where: {
			clientId_trainerId: {
				clientId,
				trainerId,
			},
		},
		select: {
			status: true,
		},
	})

	return {
		...trainer,
		inviteStatus: relationship?.status ?? null,
		isMyTrainer: relationship?.status === 'ACCEPTED',
	}
}

export async function toggleClientFavorite(trainerId: string, clientId: string) {
	const existing = await prisma.trainerClient.findUnique({
		where: {
			clientId_trainerId: {
				clientId,
				trainerId,
			},
		},
	})

	if (!existing) {
		const created = await prisma.trainerClient.create({
			data: {
				trainerId,
				clientId,
				status: 'ACCEPTED',
				isFavorite: true,
				acceptedAt: new Date(),
			},
		})
		return created.isFavorite
	}

	const updated = await prisma.trainerClient.update({
		where: {
			clientId_trainerId: {
				clientId,
				trainerId,
			},
		},
		data: { isFavorite: !existing.isFavorite },
	})

	return updated.isFavorite
}

/**
 * Получение приглашений для тренера с пагинацией
 * @param trainerId - ID тренера
 * @param status - Статус приглашений (PENDING, ACCEPTED, REJECTED)
 * @param page - Номер страницы
 * @param limit - Количество элементов на странице
 * @returns Список приглашений с информацией о клиентах
 */
export async function getTrainerInvites(
	trainerId: string,
	status: 'PENDING' | 'ACCEPTED' | 'REJECTED',
	page: number,
	limit: number,
) {
	const skip = (page - 1) * limit

	const invites = await prisma.trainerClient.findMany({
		where: {
			trainerId,
			status,
		},
		select: {
			id: true,
			status: true,
			createdAt: true,
			client: {
				select: {
					id: true,
					name: true,
					photo: true,
					age: true,
					goal: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
		skip,
		take: limit,
	})

	return invites.map((invite) => ({
		id: invite.id,
		status: invite.status,
		createdAt: invite.createdAt,
		client: invite.client,
	}))
}

/**
 * Принятие приглашения от клиента
 * @param trainerId - ID тренера
 * @param inviteId - ID приглашения
 * @returns Информация о принятом клиенте
 */
export async function acceptInvite(trainerId: string, inviteId: string) {
	const { ApiError } = await import('../utils/ApiError.js')

	// 1. Проверяем, что приглашение существует и в статусе PENDING
	const invite = await prisma.trainerClient.findUnique({
		where: { id: inviteId },
		include: {
			client: {
				select: {
					id: true,
					name: true,
					photo: true,
				},
			},
		},
	})

	if (!invite) {
		throw ApiError.notFound('Приглашение не найдено')
	}

	if (invite.trainerId !== trainerId) {
		throw ApiError.forbidden('Это приглашение предназначено другому тренеру')
	}

	if (invite.status !== 'PENDING') {
		throw ApiError.badRequest('Приглашение уже обработано')
	}

	// 2. Проверяем, что у клиента ещё нет активного тренера
	const activeTrainer = await prisma.trainerClient.findFirst({
		where: {
			clientId: invite.clientId,
			status: 'ACCEPTED',
		},
	})

	if (activeTrainer) {
		throw ApiError.conflict('Клиент уже работает с другим тренером')
	}

	// 3. Принимаем приглашение и отклоняем остальные приглашения этого клиента
	await prisma.$transaction([
		// Принимаем текущее приглашение
		prisma.trainerClient.update({
			where: { id: inviteId },
			data: {
				status: 'ACCEPTED',
				acceptedAt: new Date(),
			},
		}),
		// Отклоняем все остальные PENDING приглашения этого клиента
		prisma.trainerClient.updateMany({
			where: {
				clientId: invite.clientId,
				status: 'PENDING',
				id: { not: inviteId },
			},
			data: {
				status: 'REJECTED',
			},
		}),
	])

	return {
		id: invite.client.id,
		name: invite.client.name,
		photo: invite.client.photo,
		isFavorite: invite.isFavorite,
	}
}

/**
 * Отклонение приглашения от клиента
 * @param trainerId - ID тренера
 * @param inviteId - ID приглашения
 * @returns Подтверждение отклонения
 */
export async function rejectInvite(trainerId: string, inviteId: string) {
	const { ApiError } = await import('../utils/ApiError.js')

	// 1. Проверяем, что приглашение существует и в статусе PENDING
	const invite = await prisma.trainerClient.findUnique({
		where: { id: inviteId },
	})

	if (!invite) {
		throw ApiError.notFound('Приглашение не найдено')
	}

	if (invite.trainerId !== trainerId) {
		throw ApiError.forbidden('Это приглашение предназначено другому тренеру')
	}

	if (invite.status !== 'PENDING') {
		throw ApiError.badRequest('Приглашение уже обработано')
	}

	// 2. Отклоняем приглашение
	await prisma.trainerClient.update({
		where: { id: inviteId },
		data: {
			status: 'REJECTED',
		},
	})

	return {
		message: 'Приглашение отклонено',
	}
}

/**
 * Получение полной информации о клиенте для тренера
 * @param trainerId - ID тренера
 * @param clientId - ID клиента
 * @returns Полная информация о клиенте, последний отчет, статистика и планы питания
 */
export async function getClientProfileForTrainer(trainerId: string, clientId: string) {
	const { ApiError } = await import('../utils/ApiError.js')

	// 1. Проверяем связь между тренером и клиентом
	const relationship = await prisma.trainerClient.findUnique({
		where: {
			clientId_trainerId: {
				clientId,
				trainerId,
			},
		},
	})

	if (!relationship || relationship.status !== 'ACCEPTED') {
		throw ApiError.forbidden('Вы не работаете с этим клиентом')
	}

	// 2. Получаем полную информацию о клиенте
	const client = await prisma.user.findUnique({
		where: { id: clientId, role: 'CLIENT' },
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			photo: true,
			age: true,
			goal: true,
			restrictions: true,
			experience: true,
			diet: true,
			createdAt: true,
		},
	})

	if (!client) {
		throw ApiError.notFound('Клиент не найден')
	}

	// 3. Получаем последний отчет о прогрессе
	const lastProgress = await prisma.progress.findFirst({
		where: { userId: clientId },
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			date: true,
			weight: true,
			waist: true,
			hips: true,
			height: true,
			chest: true,
			arm: true,
			leg: true,
			photoFront: true,
			photoSide: true,
			photoBack: true,
			createdAt: true,
		},
	})

	// 4. Получаем статистику по отчетам
	const totalReports = await prisma.progress.count({
		where: { userId: clientId },
	})

	// 5. Получаем динамику (первый и последний отчеты для сравнения)
	const firstProgress = await prisma.progress.findFirst({
		where: { userId: clientId },
		orderBy: { createdAt: 'asc' },
		select: {
			weight: true,
			waist: true,
			hips: true,
			createdAt: true,
		},
	})

	let dynamics = null
	if (firstProgress && lastProgress && totalReports > 1) {
		dynamics = {
			weightChange: lastProgress.weight - firstProgress.weight,
			waistChange: lastProgress.waist - firstProgress.waist,
			hipsChange: lastProgress.hips - firstProgress.hips,
			periodDays: Math.floor(
				(lastProgress.createdAt.getTime() - firstProgress.createdAt.getTime()) /
					(1000 * 60 * 60 * 24),
			),
		}
	}

	// 6. Получаем назначенные планы питания
	const nutritionPlans = await prisma.clientNutritionPlan.findMany({
		where: { clientId },
		select: {
			id: true,
			createdAt: true,
			subcategory: {
				select: {
					id: true,
					name: true,
					description: true,
					category: {
						select: {
							id: true,
							name: true,
							description: true,
						},
					},
				},
			},
			dayIds: true,
		},
		orderBy: { createdAt: 'desc' },
	})

	return {
		client,
		lastProgress,
		statistics: {
			totalReports,
			dynamics,
		},
		nutritionPlans: nutritionPlans.map((plan) => ({
			id: plan.id,
			categoryName: plan.subcategory.category.name,
			subcategoryName: plan.subcategory.name,
			subcategoryDescription: plan.subcategory.description,
			assignedDays: plan.dayIds,
			assignedAt: plan.createdAt,
		})),
	}
}
