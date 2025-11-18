export class ApiError extends Error {
	statusCode: number

	constructor(message: string, statusCode = 400) {
		super(message)
		this.statusCode = statusCode
	}

	// Ошибка сервер не может обработать запрос
	static badRequest(msg: string) {
		return new ApiError(msg, 400)
	}

	// Ошибка авторизации
	static unauthorized(msg: string) {
		return new ApiError(msg, 401)
	}

	// Ошибка доступа к ресурсу
	static forbidden(msg: string) {
		return new ApiError(msg, 403)
	}

	// Ресурс не найден
	static notFound(msg: string) {
		return new ApiError(msg, 404)
	}

	// Внутренняя ошибка сервера
	static internal(msg: string) {
		return new ApiError(msg, 500)
	}
}
