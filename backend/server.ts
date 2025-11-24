import app from './app.js'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

const start = async () => {
	try {
		await app.listen({ port: PORT, host: '0.0.0.0' })

		console.log(`Сервер работает на порту ${PORT}`)
		console.log(`Документация доступна по адресу http://localhost:${PORT}/docs`)
	} catch (err) {
		console.error('Ошибка запуска сервера:', err)
		process.exit(1)
	}
}

start().catch((err) => {
	console.error('Критическая ошибка:', err)
	process.exit(1)
})
