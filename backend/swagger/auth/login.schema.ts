const loginSchemaSwagger = {
	tags: ['Auth'],
	summary: 'Вход в систему',
	description: 'Аутентификация пользователя по email/телефону и паролю',
	body: {
		type: 'object',
		required: ['emailOrPhone', 'password'],
		properties: {
			emailOrPhone: {
				type: 'string',
				example: 'ivan@mail.ru или +79161234567',
				description: 'Email или российский номер телефона',
			},
			password: {
				type: 'string',
				minLength: 6,
				maxLength: 10,
				example: '123456',
				description: 'Пароль (6-10 символов)',
			},
		},
		description: 'Данные для входа в систему',
	},
	response: {
		200: {
			type: 'object',
			description: 'Успешная авторизация',
			properties: {
				user: {
					type: 'object',
					properties: {
						role: {
							type: 'string',
							example: 'CLIENT',
							description: 'Роль пользователя',
						},
					},
				},
				token: {
					type: 'object',
					properties: {
						accessToken: {
							type: 'string',
							example: 'jwt-access-token',
							description: 'Access токен (передавать в заголовке Authorization)',
						},
					},
				},
			},
		},
		400: {
			type: 'object',
			description: 'Ошибка валидации данных',
			properties: {
				error: {
					type: 'object',
					description: 'Детали ошибки',
				},
			},
		},
		401: {
			type: 'object',
			description: 'Неверные учетные данные',
			properties: {
				message: {
					type: 'string',
					example: 'Неверный Email/телефон или пароль',
				},
			},
		},
	},
}

export { loginSchemaSwagger }
