import app from './app.js'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

const start = async () => {
	try {
		await app.listen({ port: PORT })

		console.log(`Сервер работает на порту ${PORT}`)
		console.log(`Документация доступна по адресу http://localhost:${PORT}/docs`)
	} catch (err) {
		app.log.error(err)
		process.exit(1)
	}
}

start()
