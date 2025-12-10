import app from './app.js'
import { Server as SocketIOServer } from 'socket.io'
import { socketAuthMiddleware, AuthenticatedSocket } from './middleware/socketAuth.js'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

const start = async () => {
	try {
		const server = await app.listen({ port: PORT, host: '0.0.0.0' })

		// Настройка Socket.IO
		const io = new SocketIOServer(app.server, {
			cors: {
				origin: process.env.FRONTEND_URL || 'http://localhost:5173',
				credentials: true,
			},
		})

		// Middleware для аутентификации
		io.use(socketAuthMiddleware)

		// Обработка подключений
		io.on('connection', (socket) => {
			const authSocket = socket as AuthenticatedSocket
			console.log(`Пользователь ${authSocket.user.id} подключился`)

			// Присоединение к комнате чата
			authSocket.on('join_chat', (chatId: string) => {
				authSocket.join(`chat_${chatId}`)
				console.log(`Пользователь ${authSocket.user.id} присоединился к чату ${chatId}`)
			})

			// Индикатор печати
			authSocket.on('typing_start', (chatId: string) => {
				authSocket.to(`chat_${chatId}`).emit('user_typing', {
					userId: authSocket.user.id,
					chatId,
				})
			})

			authSocket.on('typing_stop', (chatId: string) => {
				authSocket.to(`chat_${chatId}`).emit('user_stopped_typing', {
					userId: authSocket.user.id,
					chatId,
				})
			})

			authSocket.on('disconnect', () => {
				console.log(`Пользователь ${authSocket.user.id} отключился`)
			})
		})

		console.log(`Сервер работает на порту ${PORT}`)
	} catch (err) {
		console.error('Ошибка запуска сервера:', err)
		process.exit(1)
	}
}

start().catch((err) => {
	console.error('Критическая ошибка:', err)
	process.exit(1)
})
