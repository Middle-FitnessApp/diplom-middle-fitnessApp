import { prisma } from '../prisma.js'
import { ApiError } from '../utils/ApiError.js'
import { SendMessageDTO } from '../validation/zod/chat/send-message.dto.js'

/**
 * Отправка сообщения в чат
 * @param chatId - ID чата
 * @param senderId - ID отправителя
 * @param data - Данные сообщения (text, image опционально)
 * @param filesMap - Карта загруженных файлов (для изображений)
 * @returns Созданное сообщение
 */
export async function sendMessage(
	chatId: string,
	senderId: string,
	data: SendMessageDTO,
	filesMap: Record<string, string>,
) {
	// Проверяем, существует ли чат
	const chat = await prisma.chat.findUnique({
		where: { id: chatId },
		include: { trainer: true, client: true },
	})

	if (!chat) {
		throw ApiError.notFound('Чат не найден')
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
				chatId,
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
			where: { id: chatId },
			data: { updatedAt: new Date() },
		})

		return newMessage
	})

	// Возвращаем сообщение с данными отправителя
	return message
}
