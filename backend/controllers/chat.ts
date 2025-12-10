import { prisma } from '../prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { SendMessageDTO } from '../validation/zod/chat/send-message.dto.js'
import { GetMessagesQueryDTO } from '../validation/zod/chat/get-messages.dto.js'
import type { UserRole } from '@prisma/client'

/**
 * Отправка сообщения в чат
 * @param chatId - ID чата
 * @param senderId - ID отправителя
 * @param data - Данные сообщения (text, image опционально)
 * @param filesMap - Карта загруженных файлов (для изображений)
 * @returns Созданное сообщение
 */
export async function sendMessage(
	chatId: string | null,
	senderId: string,
	data: SendMessageDTO,
	filesMap: Record<string, string>,
) {
	// Если chatId передан, проверяем существование чата
	let chat = null
	if (chatId) {
		chat = await prisma.chat.findUnique({
			where: { id: chatId },
			include: { trainer: true, client: true },
		})

		if (!chat) {
			throw ApiError.notFound('Чат не найден')
		}
	} else {
		// chatId не передан - создаем новый чат для клиента с его тренером
		const sender = await prisma.user.findUnique({
			where: { id: senderId },
		})

		if (!sender) {
			throw ApiError.notFound('Пользователь не найден')
		}

		if (sender.role !== 'CLIENT') {
			throw ApiError.badRequest('Только клиенты могут создавать чаты автоматически')
		}

		// Находим активного тренера клиента
		const activeTrainerRelation = await prisma.trainerClient.findFirst({
			where: {
				clientId: senderId,
				status: 'ACCEPTED',
			},
			include: {
				trainer: true,
			},
		})

		if (!activeTrainerRelation) {
			throw ApiError.badRequest('У вас нет активного тренера')
		}

		// Создаем чат
		chat = await prisma.chat.create({
			data: {
				trainerId: activeTrainerRelation.trainerId,
				clientId: senderId,
			},
			include: { trainer: true, client: true },
		})
	}

	// Проверяем, что отправитель — участник чата
	if (chat.trainerId !== senderId && chat.clientId !== senderId) {
		throw ApiError.forbidden('Вы не участник этого чата')
	}

	// Определяем получателя
	const receiverId = chat.trainerId === senderId ? chat.clientId : chat.trainerId

	// Используем транзакцию для сохранения
	const message = await prisma.$transaction(async (tx) => {
		// Создаём сообщение
		const newMessage = await tx.message.create({
			data: {
				chatId: chat.id,
				senderId,
				text: data.text,
				imageUrl: data.image || filesMap.image, // Используем либо переданный URL, либо загруженный файл
			},
			include: {
				sender: {
					select: { id: true, name: true, photo: true },
				},
			},
		})

		// Обновляем updatedAt чата
		await tx.chat.update({
			where: { id: chat.id },
			data: { updatedAt: new Date() },
		})

		return newMessage
	})

	// Возвращаем сообщение с данными отправителя
	return message
}

/**
 * Получение истории сообщений чата с пагинацией
 * @param chatId - ID чата
 * @param userId - ID пользователя (для проверки доступа)
 * @param query - Параметры пагинации
 * @returns Объект с сообщениями и метаданными пагинации
 */
export async function getMessages(
	chatId: string,
	userId: string,
	query: GetMessagesQueryDTO,
) {
	// Проверяем, существует ли чат и доступ
	const chat = await prisma.chat.findUnique({
		where: { id: chatId },
		include: { trainer: true, client: true },
	})

	if (!chat) {
		throw ApiError.notFound('Чат не найден')
	}

	// Проверяем, что пользователь — участник чата
	if (chat.trainerId !== userId && chat.clientId !== userId) {
		throw ApiError.forbidden('Вы не участник этого чата')
	}

	const { page, limit } = query
	const skip = (page - 1) * limit

	// Получаем сообщения с пагинацией
	const [messages, total] = await Promise.all([
		prisma.message.findMany({
			where: { chatId },
			include: {
				sender: {
					select: { id: true, name: true, photo: true },
				},
			},
			orderBy: { createdAt: 'desc' },
			skip,
			take: limit,
		}),
		prisma.message.count({
			where: { chatId },
		}),
	])

	// Отмечаем входящие сообщения как прочитанные
	await prisma.message.updateMany({
		where: {
			chatId,
			senderId: { not: userId }, // Сообщения от других
			isRead: false,
		},
		data: { isRead: true },
	})

	// Переворачиваем порядок для фронтенда (старые сначала)
	const reversedMessages = messages.reverse()

	return {
		messages: reversedMessages,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	}
}

/**
 * Получение списка чатов пользователя
 * @param userId - ID пользователя
 * @param role - Роль пользователя
 * @returns Список чатов с последним сообщением и счетчиком непрочитанных
 */
export async function getChats(userId: string, role: UserRole) {
	if (role === 'TRAINER') {
		// Для тренера: чаты с клиентами
		const chats = await prisma.chat.findMany({
			where: {
				trainerId: userId,
			},
			include: {
				client: {
					select: { id: true, name: true, photo: true },
				},
				messages: {
					orderBy: { createdAt: 'desc' },
					take: 1,
					include: {
						sender: {
							select: { id: true, name: true },
						},
					},
				},
			},
		})

		// Получаем избранных клиентов
		const favoriteClients = await prisma.trainerClient.findMany({
			where: {
				trainerId: userId,
				isFavorite: true,
			},
			select: { clientId: true },
		})
		const favoriteClientIds = new Set(favoriteClients.map((tc) => tc.clientId))

		// Добавляем счетчик непрочитанных и сортируем
		const chatsWithMeta = await Promise.all(
			chats.map(async (chat) => {
				const unreadCount = await prisma.message.count({
					where: {
						chatId: chat.id,
						senderId: { not: userId }, // От клиента
						isRead: false,
					},
				})

				return {
					id: chat.id,
					trainerId: chat.trainerId,
					clientId: chat.clientId,
					createdAt: chat.createdAt,
					updatedAt: chat.updatedAt,
					client: chat.client,
					lastMessage: chat.messages[0] || null,
					unreadCount,
					isFavorite: favoriteClientIds.has(chat.clientId),
				}
			}),
		)

		// Сортировка: избранные сначала
		chatsWithMeta.sort((a, b) => {
			if (a.isFavorite && !b.isFavorite) return -1
			if (!a.isFavorite && b.isFavorite) return 1
			return 0
		})

		return chatsWithMeta
	} else {
		// Для клиента: чаты с тренерами (обычно один)
		const chats = await prisma.chat.findMany({
			where: {
				clientId: userId,
			},
			include: {
				trainer: {
					select: { id: true, name: true, photo: true },
				},
				messages: {
					orderBy: { createdAt: 'desc' },
					take: 1,
					include: {
						sender: {
							select: { id: true, name: true },
						},
					},
				},
			},
		})

		// Добавляем счетчик непрочитанных
		const chatsWithMeta = await Promise.all(
			chats.map(async (chat) => {
				const unreadCount = await prisma.message.count({
					where: {
						chatId: chat.id,
						senderId: { not: userId }, // От тренера
						isRead: false,
					},
				})

				return {
					id: chat.id,
					trainerId: chat.trainerId,
					clientId: chat.clientId,
					createdAt: chat.createdAt,
					updatedAt: chat.updatedAt,
					trainer: chat.trainer,
					lastMessage: chat.messages[0] || null,
					unreadCount,
				}
			}),
		)

		return chatsWithMeta
	}
}
