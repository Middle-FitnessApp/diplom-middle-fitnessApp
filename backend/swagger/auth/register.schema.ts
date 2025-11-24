const registerSchemaSwagger = {
	tags: ['Auth'],
	summary: 'Регистрация пользователя',
	description:
		'Регистрация CLIENT (с фото) или TRAINER (с соц.сетями). Выберите роль в параметре role',
	querystring: {
		type: 'object',
		properties: {
			role: {
				type: 'string',
				enum: ['CLIENT', 'TRAINER'],
				default: 'CLIENT',
				description: 'Роль: CLIENT (клиент) или TRAINER (тренер)',
			},
		},
		required: ['role'],
	},
	consumes: ['multipart/form-data'],
	produces: ['application/json'],
	response: {
		201: {
			type: 'object',
			properties: {
				user: {
					type: 'object',
					properties: {
						role: { type: 'string', example: 'CLIENT' },
					},
				},
				token: {
					type: 'object',
					properties: {
						accessToken: { type: 'string', example: 'jwt-access-token' },
					},
				},
			},
		},
		400: {
			type: 'object',
			properties: {
				error: {
					type: 'object',
					description: 'Ошибки валидации',
				},
			},
		},
	},
}

export { registerSchemaSwagger }
