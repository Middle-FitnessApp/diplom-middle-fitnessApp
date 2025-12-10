import { FastifyInstance } from 'fastify'
import { sendMessage, getMessages, getChats } from '../controllers/chat.js'
import { authGuard } from '../middleware/authGuard.js'
import { hasRole } from '../middleware/hasRole.js'
import {
	SendMessageSchemaZod,
	SendMessageDTO,
	SendMessageParamsDTO,
} from '../validation/zod/chat/send-message.dto.js'
import {
	GetMessagesSchemaZod,
	GetMessagesQueryDTO,
	GetMessagesParamsDTO,
} from '../validation/zod/chat/get-messages.dto.js'
import multipart from '@fastify/multipart'
import { cleanupFilesOnError } from '../utils/uploadPhotos.js'
import { MAX_PHOTO_SIZE, CHAT_IMAGES_SUBFOLDER } from '../consts/file.js'

export default async function chatRoutes(app: FastifyInstance) {
	app.register(multipart)

	// Получение списка чатов
	app.get('/chats', { preHandler: [authGuard] }, async (req, reply) => {
		const chats = await getChats(req.user.id, req.user.role)

		return reply.status(200).send({ chats })
	})

	// Получение истории сообщений чата
	app.get(
		'/chat/:chatId/messages',
		{
			preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])],
			schema: {
				querystring: GetMessagesSchemaZod.querystring,
				params: GetMessagesSchemaZod.params,
			},
		},
		async (req, reply) => {
			const result = await getMessages(
				(req.params as GetMessagesParamsDTO).chatId,
				req.user.id,
				req.query as GetMessagesQueryDTO,
			)

			return reply.status(200).send(result)
		},
	)

	// Отправка сообщения в чат
	app.post(
		'/chat/:chatId/messages',
		{
			preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])],
			schema: {
				body: SendMessageSchemaZod.body,
				params: SendMessageSchemaZod.params,
			},
			onError: cleanupFilesOnError,
		},
		async (req, reply) => {
			let body: Record<string, string>
			let filesMap: Record<string, string> = {}

			// Проверяем, является ли запрос multipart (есть ли файлы)
			if (req.isMultipart()) {
				// Обрабатываем загрузку файлов (только изображение, макс. 500KB)
				const { uploadPhotos } = await import('../utils/uploadPhotos.js')
				const uploadResult = await uploadPhotos(
					req,
					['image'],
					MAX_PHOTO_SIZE,
					CHAT_IMAGES_SUBFOLDER,
				)
				filesMap = uploadResult.files
				body = uploadResult.body
			} else {
				body = req.body as Record<string, string>
			}

			const message = await sendMessage(
				(req.params as SendMessageParamsDTO).chatId,
				req.user.id,
				body as SendMessageDTO,
				filesMap,
			)

			// Отправка через Socket.IO (если подключены)
			// Предполагаем, что io доступен глобально или через app
			const io = app.io
			if (io) {
				io.to(`chat_${(req.params as SendMessageParamsDTO).chatId}`).emit(
					'new_message',
					message,
				)
			}

			return reply.status(201).send({ message })
		},
	)
}
