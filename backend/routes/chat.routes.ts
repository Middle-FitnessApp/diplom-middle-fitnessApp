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
	app.get('/', { preHandler: [authGuard] }, async (req, reply) => {
		const chats = await getChats(req.user.id, req.user.role)

		return reply.status(200).send({ chats })
	})

	// Получение истории сообщений чата
	app.get(
		'/:chatId/messages',
		{
			preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])],
		},
		async (req, reply) => {
			const { chatId } = GetMessagesSchemaZod.params.parse(req.params)
			const query = GetMessagesSchemaZod.querystring.parse(req.query)

			const result = await getMessages(chatId, req.user.id, query)

			return reply.status(200).send(result)
		},
	)

	// Отправка сообщения в чат
	app.post(
		'/:chatId/messages',
		{
			preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])],
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

			const { chatId } = SendMessageSchemaZod.params.parse(req.params)
			const messageData = SendMessageSchemaZod.body.parse(body)

			const message = await sendMessage(chatId, req.user.id, messageData, filesMap)

			// Отправка через Socket.IO (если подключены)
			// Предполагаем, что io доступен глобально или через app
			const io = app.io
			if (io) {
				io.to(`chat_${chatId}`).emit('new_message', message)
			}

			return reply.status(201).send({ message })
		},
	)
}
