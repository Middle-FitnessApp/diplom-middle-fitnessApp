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

export async function getClientsForTrainer(trainerId: string) {
	// 1) все клиенты
	const [allClients, links] = await Promise.all([
		prisma.user.findMany({
			where: { role: 'CLIENT' },
			select: {
				id: true,
				email: true,
				name: true,
				age: true,
				phone: true,
				photo: true,
				role: true,
			},
		}),
		prisma.trainerClient.findMany({
			where: { trainerId },
			select: { clientId: true, isFavorite: true },
		}),
	])

	const map = new Map<string, boolean>()
	links.forEach((l) => map.set(l.clientId, l.isFavorite))

	// 2) всем клиентам добавляем флаг isFavorite, если есть связь
	return allClients.map((c) => ({
		...c,
		isFavorite: map.get(c.id) ?? false,
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
